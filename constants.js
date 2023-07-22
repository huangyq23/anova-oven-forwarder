import * as dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const WS_SERVER = process.env.WS_SERVER || "wss://app.oven.anovaculinary.io";
export const TOKEN_API = process.env.TOKEN_API ||
    "https://securetoken.googleapis.com/v1/token?key=AIzaSyDQiOP2fTR9zvFcag2kSbcmG9zPh6gZhHw";
export const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
// const DEVICE_ID = process.env.DEVICE_ID;
export const API_SERVER_ENABLED = process.env.API_SERVER_ENABLED === "true";
export const AUTH_ENABLED = process.env.AUTH_ENABLED === "true";
export const JWT_ISSUER = process.env.JWT_ISSUER;
export const JWKS_URI = process.env.JWKS_URI;
export const CLIENT_ID = process.env.CLIENT_ID;
export const METRIC_INFLUX_ENABLED = process.env.METRIC_INFLUX_ENABLED === "true";
export const INFLUX_URL = process.env.INFLUX_URL;
export const INFLUX_TOKEN = process.env.INFLUX_TOKEN;
export const INFLUX_ORG = process.env.INFLUX_ORG;
export const INFLUX_BUCKET = process.env.INFLUX_BUCKET;
export const HOSTNAME = process.env.HOSTNAME;
export const METRIC_LOG_ENABLED = process.env.METRIC_LOG_ENABLED === "true";
export const MQTT_ENABLED = process.env.MQTT_ENABLED === "true";
export const MQTT_URL = process.env.MQTT_URL;
export const MQTT_USERNAME = process.env.MQTT_USERNAME;
export const MQTT_PASSWORD = process.env.MQTT_PASSWORD;