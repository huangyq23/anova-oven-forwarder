import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { MetricClient } from "./MetricClient.js";

/**
 * A metric client that push to Influxdb 2.0
 */
class InfluxClient extends MetricClient {
    #client;
    #writeApi;
    
    constructor(config, logger) {
        super(config, logger);

        const { url, token, org, bucket, host } = config;
        this.#client = new InfluxDB({ url, token });

        this.#writeApi = this.#client.getWriteApi(org, bucket);
        this.#writeApi.useDefaultTags({ host });
    }

    recordOvenState(anovaStatus) {
        const {
            ovenId,
            data: {
                updatedTimestamp,
                state: { mode },
                nodes: {
                    door,
                    fan,
                    lamp,
                    vent,
                    waterTank,
                    temperatureBulbs,
                    temperatureProbe,
                    heatingElements,
                    steamGenerators,
                },
            },
        } = anovaStatus;

        const point = new Point("oven")
            .tag("ovenId", ovenId)
            .timestamp(new Date(updatedTimestamp));

        point.stringField("state-mode", mode);

        point
            .floatField("dry", temperatureBulbs.dry.current.celsius)
            .floatField("dryBottom", temperatureBulbs.dryBottom.current.celsius)
            .floatField("dryTop", temperatureBulbs.dryTop.current.celsius)
            .floatField("wet", temperatureBulbs.wet.current.celsius)
            .booleanField("wet-dosed", temperatureBulbs.wet.dosed)
            .stringField("temp-mode", temperatureBulbs.mode);

        if (temperatureBulbs.mode === "dry") {
            point.floatField(
                "dry-setpoint",
                temperatureBulbs.dry.setpoint.celsius
            );
        }

        if (temperatureBulbs.mode === "wet") {
            point.floatField(
                "wet-setpoint",
                temperatureBulbs.wet.setpoint.celsius
            );
        }

        point
            .booleanField("lamp-on", lamp.on)
            .booleanField("vent-open", vent.open)
            .booleanField("door-closed", door.closed)
            .booleanField("waterTank-empty", waterTank.empty)
            .intField("fan-speed", fan.speed);

        point
            .booleanField("heating-bottom-on", heatingElements.bottom.on)
            .booleanField("heating-top-on", heatingElements.top.on)
            .booleanField("heating-rear-on", heatingElements.rear.on)
            .intField("heating-bottom-watts", heatingElements.bottom.watts)
            .intField("heating-top-watts", heatingElements.top.watts)
            .intField("heating-rear-watts", heatingElements.rear.watts);

        point.booleanField("probe-connected", temperatureProbe.connected);

        if (temperatureProbe.connected) {
            point.floatField("probe", temperatureProbe.current.celsius);
            if (temperatureProbe.setpoint) {
                point.floatField(
                    "probe-setpoint",
                    temperatureProbe.setpoint.celsius
                );
            }
        }

        point
            .stringField("steam-mode", steamGenerators.mode)
            .floatField("evaporator", steamGenerators.evaporator.celsius)
            .floatField("boiler", steamGenerators.boiler.celsius)
            .booleanField("boiler-dosed", steamGenerators.boiler.celsius)
            .intField("evaporator-watts", steamGenerators.evaporator.watts)
            .intField("boiler-watts", steamGenerators.boiler.watts);

        if (steamGenerators.mode === "relative-humidity") {
            point
                .floatField(
                    "relative-humidity",
                    steamGenerators.relativeHumidity.current
                )
                .floatField(
                    "relative-humidity-setpoint",
                    steamGenerators.relativeHumidity.setpoint
                );
        }

        if (steamGenerators.mode === "steam-percentage") {
            point.floatField(
                "steam-percentage-setpoint",
                steamGenerators.steamPercentage.setpoint
            );
        }

        this.#writeApi.writePoint(point);
        this.#flush();
    }

    async #flush() {
        await this.#writeApi.flush();
    }
}

export { MetricClient, InfluxClient };
