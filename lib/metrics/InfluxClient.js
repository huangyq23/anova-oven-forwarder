import { InfluxDB } from "@influxdata/influxdb-client";
import { MetricClient } from "./MetricClient.js";
import { getInfluxPoints } from "./influxUtils.js";

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

    async recordOvenState(ovenStatus) {
        const { systemInfoPoint, statePoint, nodesPoint } =
            getInfluxPoints(ovenStatus);

        this.#writeApi.writePoints([systemInfoPoint, statePoint, nodesPoint]);
        this.#flush();
    }

    async #flush() {
        await this.#writeApi.flush();
    }
}

export { InfluxClient };
