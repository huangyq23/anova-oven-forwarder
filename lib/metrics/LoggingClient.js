import { MetricClient } from "./MetricClient.js";

/**
 * A metric client that logs to the console
 */
class LoggingClient extends MetricClient {
    constructor(config, logger) {
        super(config, logger);
    }

    recordOvenState(ovenStatus) {
        console.dir({ ovenStatus }, { depth: null });
    }
}

export { LoggingClient };
