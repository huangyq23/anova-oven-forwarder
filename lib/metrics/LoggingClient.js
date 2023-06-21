import { MetricClient } from "./MetricClient.js";

/**
 * A metric client that logs to the console
 */
class LoggingClient extends MetricClient {
    constructor(config, logger) {
        super(config, logger);
    }

    recordOvenState(anovaStatus) {
        console.dir({ anovaStatus }, { depth: null });
    }
}

export { LoggingClient };
