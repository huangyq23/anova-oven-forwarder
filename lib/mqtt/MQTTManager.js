import * as mqtt from "mqtt";

class MQTTManager {
    constructor({serverUrl, username, password}, logger) {
        this.serverUrl = serverUrl;
        this.username = username;
        this.password = password;
        this.logger = logger;
        this.client = null;
        this.subscribers = new Map();
    }

    async connect() {
        if (this.isConnected()) {
            return;
        }

        try {
            this.client = mqtt.connect(this.serverUrl, {
                username: this.username,
                password: this.password,
            });
        } catch (error) {
            this.logger.error("Error connecting to MQTT:", error);
            throw error;
        }

        return new Promise((resolve, reject) => {
            this.client.on("connect", () => {
                this.logger.info("MQTT connection established");
                resolve();
            });

            this.client.on("message", (topic, message) => {
                this.handleMessage(topic, message);
            });

            this.client.on("error", (err) => {
                this.logger.error(`MQTT error: ${err}`);
                reject(err);
            });

            this.client.on("close", () => {
                this.logger.info("MQTT connection closed");
            });
        });
    }

    async subscribe(topics, handler) {
        return new Promise((resolve, reject) => {
            this.client.subscribe(topics, (err) => {
                if (err) {
                    this.logger.error(`Error subscribing to topic: ${err.message}`);
                    reject(new Error("Error subscribing to topic"));
                } else {
                    for (let topic of topics) {
                        if (!this.subscribers.has(topic)) {
                            this.subscribers.set(topic, []);
                        }
                        this.subscribers.get(topic).push(handler);
                    }
                    resolve();
                }
            });
        });
    }

    async publish(topic, message, retain = false) {
        if (!this.isConnected()) {
            throw new Error("MQTT is not connected");
        }

        const payload = JSON.stringify(message);

        return new Promise((resolve, reject) => {
            this.client.publish(topic, payload, {retain}, (err) => {
                if (err) {
                    this.logger.error(`Error publishing message: ${err.message}`);
                    reject(new Error("Error publishing message"));
                } else {
                    resolve();
                }
            });
        });
    }

    handleMessage(topic, message) {
        if (this.subscribers.has(topic)) {
            for (let handler of this.subscribers.get(topic)) {
                handler(message);
            }
        }
    }

    isConnected() {
        return this.client && this.client.connected;
    }
}


export { MQTTManager };