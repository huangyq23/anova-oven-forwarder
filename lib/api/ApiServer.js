import Koa from "koa";
import jwt from "koa-jwt";
import { koaJwtSecret } from "jwks-rsa";
import Router from "koa-router";
import requestReceived from "request-received";
import responseTime from "koa-better-response-time";
import requestId from "koa-better-request-id";
import { AUTH_ENABLED, JWKS_URI, CLIENT_ID, JWT_ISSUER, PORT } from "../../constants.js";

class ApiServer {
    constructor({ wsManager }, cabin) {
        this.app = new Koa();
        this.router = new Router();

        this.app.use(requestReceived);
        this.app.use(responseTime());
        this.app.use(requestId());
        this.app.use(cabin.middleware);
        this.app.use(async function errorMiddleware(ctx, next) {
            try {
                await next();
            } catch (err) {
                const errorMessages = err?.message ?? "Unknown error";
                ctx.logger.error(errorMessages);

                if (401 == err.status) {
                    ctx.status = 401;
                    ctx.body = {
                        error: {
                            message: "Protected resource",
                        },
                    };
                } else if (err.status) {
                    ctx.status = err.status;
                    ctx.body = {
                        error: {
                            message: errorMessages,
                        },
                    };
                }
            }
        });

        this.app.use(async (ctx, next) => {
            ctx.wsManager = wsManager;
            await next();
        });

        this.router.get("/ping", async (ctx) => {
            ctx.status = 200;
            ctx.body = { status: "OK" };
        });
        this.router.post("/stop", async (ctx) => {
            ctx.wsManager.stopCook();
            ctx.body = {
                success: true,
            };
        });

        if (AUTH_ENABLED) {
            this.app.use(
                jwt({
                    secret: koaJwtSecret({
                        jwksUri: JWKS_URI,
                        cache: true,
                        cacheMaxEntries: 5,
                        cacheMaxAge: 10 * 60 * 60 * 1000,
                    }),
                    audience: CLIENT_ID,
                    issuer: JWT_ISSUER,
                    algorithms: ["RS256"],
                }).unless({
                    path: [/^\/public/],
                })
            );
        }

        this.app.use(this.router.routes());
        this.app.use(this.router.allowedMethods());
    }

    start() {
        this.app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    }
}

export { ApiServer };