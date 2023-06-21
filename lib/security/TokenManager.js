import { addSeconds, isPast } from "date-fns";

/**
 * Manage access token lifecycle
 */
class TokenManager {
    constructor(tokenEndpoint, refreshToken) {
        this.tokenEndpoint = tokenEndpoint;
        this.refreshToken = refreshToken;
        this.accessToken = null;
        this.idToken = null;
        this.expiryTime = null;
    }

    async fetchTokens() {
        try {
            const response = await fetch(this.tokenEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    grantType: "refresh_token",
                    refreshToken: this.refreshToken,
                }),
            });

            const { access_token, id_token, refresh_token, expires_in } =
                await response.json();

            this.accessToken = access_token;
            this.idToken = id_token;
            this.refreshToken = refresh_token;

            this.expiryTime = addSeconds(new Date(), expires_in - 10);

            return { access_token, id_token };
        } catch (error) {
            console.error("Error fetching tokens:", error);
            throw error;
        }
    }

    async getAccessToken() {
        if (!this.accessToken || isPast(this.expiryTime)) {
            const tokens = await this.fetchTokens();
            return tokens.access_token;
        }

        return this.accessToken;
    }

    async getIdToken() {
        if (!this.idToken || isPast(this.expiryTime)) {
            const tokens = await this.fetchTokens();
            return tokens.id_token;
        }

        return this.idToken;
    }
}

export { TokenManager };
