# anova-oven-forwarder
A Node.JS service that interacts with the Anova Oven API.

## ⚠️ Disclaimer 
Not affliated with Anova Applied Electronics, Inc. in any way. Use at your own risk.

## Requirements
Node.JS 18+ installed on host or a container environment (Docker)

## Setup

### Environment Variables
Copy `.env.example` to `.env` to set up required environment variables

```sh
cp .env.example .env
```

### Obtain Refresh Token
The refresh token is a long-term token. It is (marginally) better than hard-coding username and password directly.

```sh
curl -s -X "POST" "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyDQiOP2fTR9zvFcag2kSbcmG9zPh6gZhHw" \
     -H 'Content-Type: application/json' \
     -d $'{"email": "<email>", "password": "<password>", "returnSecureToken": true}' \
| jq '.refreshToken'
```

Only email and password is supported. If you login to Anova app via third party (Apple, Facebook, Google) methods, the current workaround is to create a new dedicated email-password user and add it in the *Manage User* screen in App.

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
If `METRIC_INFLUX_ENABLED` is set to `true`, the service will try to push metrics to InfluxDB 2

See https://docs.influxdata.com/influxdb/v2.7/get-started/ and create Influx DB bucket and API Token

