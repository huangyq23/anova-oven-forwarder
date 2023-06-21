import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
import { MetricClient } from "../metrics/MetricClient.js";
import { TokenManager } from "../security/TokenManager.js";

/**
 * Manages the WebSocket connection to the Anova server and sends commands to the oven
 */
class WebSocketManager {
    /**
     * @param {object} config
     * @param {string} config.serverUrl
     * @param {string} config.deviceId Unique identifier for the oven, currently unused
     * @param {TokenManager} config.tokenManager
     * @param {MetricClient[]} config.metricClients
     * @param {*} logger
     */
    constructor({ serverUrl, deviceId, tokenManager, metricClients }, logger) {
        this.ws = null;
        this.connected = false;
        this.deviceId = deviceId;
        this.serverUrl = serverUrl;
        this.tokenManager = tokenManager;
        this.metricClients = metricClients;
        this.logger = logger;
    }

    #getAuthCommand(token) {
        return {
            command: "AUTH_TOKEN",
            payload: token,
        };
    }

    #getOvenCommand(type, payload) {
        const commandId = uuidv4();
        const requestId = uuidv4();

        return {
            command: "SEND_OVEN_COMMAND",
            payload: {
                deviceId: this.deviceId,
                command: {
                    id: commandId,
                    type,
                    ...(payload ? { payload } : {}),
                },
                requestId,
            },
        };
    }

    /**
     * @experimental
     */
    stopCook() {
        const command = this.#getOvenCommand("stopCook");
        this.#send(command);
    }

    /**
     * @experimental
     */
    airFry() {
        const airFryCommand = {
            cookId: `ios-${uuidv4()}`,
            stages: [
                {
                    stepType: "stage",
                    id: `ios-${uuidv4()}`,
                    title: "Preheat",
                    type: "preheat",
                    userActionRequired: false,
                    temperatureBulbs: {
                        dry: {
                            setpoint: {
                                fahrenheit: 400,
                                celsius: 204,
                            },
                        },
                        mode: "dry",
                    },
                    heatingElements: {
                        top: {
                            on: true,
                        },
                        bottom: {
                            on: false,
                        },
                        rear: {
                            on: true,
                        },
                    },
                    fan: {
                        speed: 100,
                    },
                    vent: {
                        open: false,
                    },
                    steamGenerators: {
                        relativeHumidity: {
                            setpoint: 0,
                        },
                        mode: "relative-humidity",
                    },
                },
                {
                    stepType: "stage",
                    id: `ios-${uuidv4()}`,
                    title: "Airfry",
                    type: "cook",
                    userActionRequired: false,
                    temperatureBulbs: {
                        dry: {
                            setpoint: {
                                fahrenheit: 400,
                                celsius: 204,
                            },
                        },
                        mode: "dry",
                    },
                    heatingElements: {
                        top: {
                            on: true,
                        },
                        bottom: {
                            on: false,
                        },
                        rear: {
                            on: true,
                        },
                    },
                    fan: {
                        speed: 100,
                    },
                    vent: {
                        open: false,
                    },
                    steamGenerators: {
                        relativeHumidity: {
                            setpoint: 0,
                        },
                        mode: "relative-humidity",
                    },
                },
            ],
        };

        const command = this.#getOvenCommand("startCook", airFryCommand);
        this.#send(command);
    }

    async connect() {
        const token = await this.tokenManager.getAccessToken();

        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.serverUrl);

            this.ws.on("open", () => {
                this.logger.info("WebSocket connection established");
                this.ws.send(JSON.stringify(this.#getAuthCommand(token)));
            });

            this.ws.on("message", (data) => {
                const response = JSON.parse(data);
                if (response.response === 'OVEN_STATE') {
                    resolve();
                    this.deviceId = response.ovenId;
                    this.metricClients.forEach((metricClient) => {
                        metricClient.recordOvenState(response);
                    });
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