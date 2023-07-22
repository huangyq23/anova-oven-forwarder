class MetricManager {
    constructor({ metricClients, wsManager }) {
        this.metricClients = metricClients;
        this.wsManager = wsManager;

        this.wsManager.subscribe("EVENT_APO_STATE", this.handleOvenState.bind(this));
    }

    async handleOvenState(response) {
        this.metricClients.forEach((metricClient) => {
            metricClient.recordOvenState(response);
        });
    }
}

export { MetricManager };
