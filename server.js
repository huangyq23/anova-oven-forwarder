import Cabin from "cabin";
import {
    API_SERVER_ENABLED,
    HOSTNAME,
    INFLUX_BUCKET,
    INFLUX_ORG,
    INFLUX_TOKEN,
    INFLUX_URL,
    METRIC_INFLUX_ENABLED,
    METRIC_LOG_ENABLED,
    MQTT_ENABLED,
    MQTT_PASSWORD,
    MQTT_URL,
    MQTT_USERNAME,
    REFRESH_TOKEN,
    TOKEN_API,
    WS_SERVER,
} from "./constants.js";
import { ApiServer } from "./lib/api/ApiServer.js";
import { InfluxClient } from "./lib/metrics/InfluxClient.js";
import { LoggingClient } from "./lib/metrics/LoggingClient.js";
import { MetricManager } from "./lib/metrics/MetricManager.js";
import { MQTTManager } from "./lib/mqtt/MQTTManager.js";
import { TokenManager } from "./lib/security/TokenManager.js";
import { WebSocketManager } from "./lib/websocket/WebSocketManager.js";

const tokenManager = new TokenManager(TOKEN_API, REFRESH_TOKEN);

const cabin = new Cabin();

const wsManager = new WebSocketManager(
    {
        serverUrl: WS_SERVER,
        tokenManager,
    },
    cabin
);

if (!wsManager.isConnected()) {
    await wsManager.connect();
}

const metricClients = [];

if (METRIC_INFLUX_ENABLED) {
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

    metricClients.push(influxClient);
}

if (METRIC_LOG_ENABLED) {
    const loggingClient = new LoggingClient({}, cabin);

    metricClients.push(loggingClient);
}

new MetricManager({ metricClients, wsManager }, cabin);

if (MQTT_ENABLED) {
    const mqttManager = new MQTTManager(
        {
            serverUrl: MQTT_URL,
            username: MQTT_USERNAME,
            password: MQTT_PASSWORD,
        },
        cabin
    );

    await mqttManager.connect();
}

if (API_SERVER_ENABLED) {
    const apiServer = new ApiServer(
        {
            wsManager,
        },
        cabin
    );

    apiServer.start();
}
