# Anove Oven Forwarder
A Node.JS service that interacts with the Anova Precision Oven API to record realtime metrics and support automation. 

![Grafana](./docs/grafana.png)

## ⚠️ Disclaimer 
Not affliated with Anova Applied Electronics, Inc. in any way. Use at your own risk.

## Requirements
* Node.JS 18+ installed on host or a container environment (Docker)

## Setup
### Environment Variables
Copy `.env.example` to `.env` to set up required environment variables

```sh
cp .env.example .env
```

### Obtain Refresh Token
The refresh token is a long-term token. It is (marginally) better than hard-coding username and password directly.

#### Browser (Preferred)
You can obtain the token from the Firebase IndexedDB with DevTool of your browser when logged into https://oven.anovaculinary.com/

For example, in Chrome: 
1. Navigate to https://oven.anovaculinary.com/
2. Login via any of the supported method
3. Open the Chrome DevTool (F12).
4. Locate Application > Storage > IndexedDB > firebaseLocalStorageDB > firebaseLocalStorage > value > stsTokenManager > refreshToken

#### cURL
If you wish to to use curl to obtain token directly
```sh
curl -s -X "POST" "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyDQiOP2fTR9zvFcag2kSbcmG9zPh6gZhHw" \
     -H 'Content-Type: application/json' \
     -d $'{"email": "<email>", "password": "<password>", "returnSecureToken": true}' \
| jq '.refreshToken'
```
Note that this only works if you use email+password login, please use the browser method if you use third party login.

## Run
### Node
```sh
npm i
npm run start
```

### Docker
```sh
export IMAGE_NAME=anova-oven-forwarder
./scripts/build-image.sh
./scripts/run-container.sh
```

## 🔬 Advanced (Experimental) 

### Control Cook
The application runs a Koa App that exposes the `/airFry` and `/stop` method that can start a cook.

### JWT Authorization 
If `AUTH_ENABLED` is set to `true`, the service can be protected by JWT issued by a authorization server such as Keycloak.

### InfluxDB
If `METRIC_INFLUX_ENABLED` is set to `true`, the service will try to push metrics to InfluxDB 2.

See https://docs.influxdata.com/influxdb/v2.7/get-started/ and create Influx DB bucket and API Token

## Buy me a Coffee
If you find value in this project and want to show your support, please consider [buying me a coffee](https://github.com/sponsors/huangyq23?frequency=one-time&sponsor=huangyq23) - it would really make my day!
