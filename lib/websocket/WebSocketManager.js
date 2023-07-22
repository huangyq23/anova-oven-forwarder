import WebSocket from "ws";
import { getStopCookCommand, getOvenCommand } from "./command/anovaOvenCommandUtils.js";

/**
 * Manages the WebSocket connection to the Anova server and sends commands to the oven
 *
 * @typedef {import("../security/TokenManager.js").TokenManager} TokenManager
 */
class WebSocketManager {
    /**
     * @param {object} config
     * @param {string} config.serverUrl
     * @param {string} config.deviceId Unique identifier for the oven, currently unused
     * @param {TokenManager} config.tokenManager
     * @param {*} logger
     */
    constructor({ serverUrl, deviceId, tokenManager }, logger) {
        this.serverUrl = serverUrl;
        this.tokenManager = tokenManager;
        this.logger = logger;
        this.deviceId = deviceId;

        this.ws = null;
        this.subscribers = new Map();
        this.connected = false;
    }

    /**
     * @experimental
     */
    async stopCook() {
        const command = getStopCookCommand(this.deviceId);
        await this.#send(command);
    }

    async sendCommand(ovenCommand, payload) {
        const command = getOvenCommand(this.deviceId, ovenCommand, payload);
        await this.#send(command);
    }

    async subscribe(responseType, handler) {
        if (!this.subscribers.has(responseType)) {
            this.subscribers.set(responseType, []);
        }

        this.subscribers.get(responseType).push(handler);
    }

    async connect() {
        if (this.isConnected()) {
            return;
        }

        const token = await this.tokenManager.getAccessToken();

        return new Promise((resolve, reject) => {
            const url = new URL(this.serverUrl);

            url.search = new URLSearchParams({
                token: token,
                supportedAccessories: "APO",
                platform: "ios",
            });
            
            this.ws = new WebSocket(url, {
                protocol: "ANOVA_V2",
            });

            this.ws.on("open", () => {
                this.logger.info("WebSocket connection established");
            });

            this.ws.on("message", (data) => {
                const response = JSON.parse(data);

                if (response.command === "EVENT_APO_STATE") {
                    resolve();

                    if (!this.deviceId) {
                        this.deviceId = response.payload.cookerId;
                    }
                }

                if (this.subscribers.has(response.command)) {
                    for (const handler of this.subscribers.get(
                        response.command
                    )) {
                        handler(response);
                    }
                }
            });

            this.ws.on("error", (err) => {
                this.logger.error(`WebSocket error: ${err}`);
                reject(err);
            });

            this.ws.on("close", (code, reason) => {
                this.logger.info(
                    `WebSocket connection closed. Code: ${code}, Reason: ${reason}`
                );
                this.logger.info("Reconnecting in 5s...");
                setTimeout(() => this.connect(), 5000);
            });
        });
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    #send(data) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected()) {
                reject(new Error("WebSocket is not connected"));
            } else {
                this.ws.send(JSON.stringify(data), (err) => {
                    if (err) {
                        this.logger.error(`Error sending data: ${err.message}`);
                        reject(new Error("Error sending data"));
                    } else {
                        resolve();
                    }
                });
            }
        });
    }
}

export { WebSocketManager };
