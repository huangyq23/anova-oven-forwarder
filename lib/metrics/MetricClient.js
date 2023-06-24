/**
 * Abstract class for metric backends
 */
class MetricClient {
    /**
     * @param {object} config
     * @param {*} logger
     */
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }

    recordOvenState(ovenStatus) {
        throw new Error("Not implemented");
    }
}

export { MetricClient };
