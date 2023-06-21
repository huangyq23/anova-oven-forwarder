import * as dotenv from "dotenv";
dotenv.config();

import Koa from "koa";
import jwt from "koa-jwt";
import { koaJwtSecret } from "jwks-rsa";
import Router from "koa-router";
import Cabin from "cabin";
import requestReceived from "request-received";
import responseTime from "koa-better-response-time";
import requestId from "koa-better-request-id";

import { TokenManager } from "./lib/security/TokenManager.js";
import { WebSocketManager } from "./lib/websocket/WebSocketManager.js";
import { InfluxClient } from "./lib/metrics/InfluxClient.js";
import { LoggingClient } from "./lib/metrics/LoggingClient.js";

const PORT = process.env.PORT || 3000;
const WS_SERVER = process.env.WS_SERVER || "wss://app.oven.anovaculinary.io";
const TOKEN_API =
    process.env.TOKEN_API ||
    "https://securetoken.googleapis.com/v1/token?key=AIzaSyDQiOP2fTR9zvFcag2kSbcmG9zPh6gZhHw";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
// const DEVICE_ID = process.env.DEVICE_ID;

const AUTH_ENABLED = process.env.AUTH_ENABLED === "true";
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWKS_URI = process.env.JWKS_URI;
const CLIENT_ID = process.env.CLIENT_ID;

const METRIC_INFLUX_ENABLED = process.env.METRIC_INFLUX_ENABLED === "true";
const INFLUX_URL = process.env.INFLUX_URL;
const INFLUX_TOKEN = process.env.INFLUX_TOKEN;
const INFLUX_ORG = process.env.INFLUX_ORG;
const INFLUX_BUCKET = process.env.INFLUX_BUCKET;
const HOSTNAME = process.env.HOSTNAME;

const METRIC_LOG_ENABLED = process.env.METRIC_LOG_ENABLED === "true";

const tokenManager = new TokenManager(TOKEN_API, REFRESH_TOKEN);

const app = new Koa();
const router = new Router();

const cabin = new Cabin();

const loggingClient = new LoggingClient({}, cabin);

const influxClient = new InfluxClient(
    {
        url: INFLUX_URL,
        token: INFLUX_TOKEN,
        org: INFLUX_ORG,
        bucket: INFLUX_BUCKET,
        host: HOSTNAME,
    },
    cabin
);

const metricClients = [];

if (METRIC_INFLUX_ENABLED) {
    metricClients.push(influxClient);
}

if (METRIC_LOG_ENABLED) {
    metricClients.push(loggingClient);
}

const wsManager = new WebSocketManager(
    {
        serverUrl: WS_SERVER,
        tokenManager,
        metricClients,
    },
    cabin
);

app.use(requestReceived);
app.use(responseTime());
app.use(requestId());
app.use(cabin.middleware);

app.use(function (ctx, next) {
    return next().catch((err) => {
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
                    message: err.message,
                },
            };
        }
    });
});

if (AUTH_ENABLED) {
    app.use(
        jwt({
            secret: koaJwtSecret({
                jwksUri: JWKS_URI,
                cache: true,
                cacheMaxEntries: 5,
                cacheMaxAge: 10 * 60 * 60 * 1000,
            }),
            audience: CLIENT_ID,
            issuer: JWT_ISSUER,
        })
    );
}

if (!wsManager.isConnected()) {
    await wsManager.connect();
}

app.use(async (ctx, next) => {
    ctx.wsManager = wsManager;
    await next();
});

router.get("/ping", async (ctx) => {
    ctx.status = 200;
    ctx.body = { status: "OK" };
});

router.post("/airFry", async (ctx) => {
    ctx.wsManager.airFry(DEVICE_ID);
    ctx.body = {
        success: true,
    };
});

router.post("/stop", async (ctx) => {
    ctx.wsManager.stopCook(DEVICE_ID);
    ctx.body = {
        success: true,
    };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, async () => {
    cabin.info(`Server listening at http://localhost:${PORT}`);
});
