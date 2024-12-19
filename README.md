# FintechPlayer

> Neobank

- Banking -> https://nemo.madeindigio.com
- Onboarding Individual -> https://nemo.madeindigio.com/onboarding/individual/start
- Onboarding Company -> https://nemo.madeindigio.com/onboarding/company/start

## Backoffice

Platform for administrators.

- Dashboard -> https://dashboard.swan.io

## Enduser

Web and mobile application for **clients**.

### Web app

For using in browsers.

In this [repository](/frontend-web/clients) you'll find two frontend clients:
- Web Banking: banking interface where users can manage their financial needs around transactions, cards, payments, and memberships
- Onboarding: process of opening new accounts for your users that follows specific steps to meet legal requirements

```
$ yarn dev
```

- Banking -> https://banking.swan.local:8080
- Onboarding Individual -> https://onboarding.swan.local:8080/onboarding/individual/start
- Onboarding Company -> https://onboarding.swan.local:8080/onboarding/company/start

#### Step-by-step guide

1. Configure and serve onboarding and web banking at localhost: [README.md](/frontend-web/README.md)
2. Complete individual onboarding at localhost
    - Support: https://swan-io.github.io/swan-partner-frontend/specs/onboarding/individual/
3. Validate new account: all features are available as soon as the account is validated. Banking services are highly regulated. You cannot simply "Sign up" without first going through a compliance check. The compliance process takes place in two steps, that can be simulated in the [Sandbox](https://dashboard.swan.io):
    1. Identity verification: Go to Sandbox users to edit your current Sandbox User and select ValidIdentity on the "Verification Status" input.
    2. Compliance review: go to Event Simulator > Account Holder, input the Account Holder Id, and select the status on the Verification Status field.
    - Support: https://docs.swan.io/guide/quickstart#validate-the-new-account
4. Browse you web banking client at localhost.

### Mobile app

For downloading from Google Play or App Store.

In this [repository](/frontend-mobile) you'll find two apps:
- iOS
- Android

To start the mobile development server, use:
```
$ yarn android
# --- OR ---
$ yarn ios
```

You will also need to start the backend development server:
```
$ cd server
$ yarn dev
```

## Backend

> Middleware & Server

In this [repository](/frontend-web/server) you'll find the NodeJS server to handle OAuth2 callbacks & API proxying.

### BFF

Backend for Frontend.

**BFF** is responsible for:

- Handling OAuth2
- Managing user sessions
- Acting as a proxy for Swan's GraphQL APIs
- Handling some business logic
- Serving the client application

### GraphQL

The BFF exposes a GraphQL API that is consumed by the client applications.

Update GraphQL **schemas** with the following command:
```
$ yarn graphql-update-schemas
```

All required **documents** are in the graphql directory for each application.

In order to benefit from GraphQL's types, we use **code generator**:
```
$ yarn graphql-codegen
```


### Build and deploy

**Bundle** the client applications and the server in production with the following command:
```
$ yarn build
```

Create a **Docker** image from the built files:
```
$ docker build
```

- https://swan-io.github.io/swan-partner-frontend/build-deploy
