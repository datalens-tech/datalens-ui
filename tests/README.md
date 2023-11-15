# DataLens E2E tests.

### Prerequisites

[Install docker](https://docs.docker.com/engine/install/)

[Install docker compose plugin](https://docs.docker.com/compose/install/linux/) if it not already installed

### Tests run configuration
Create `.env` file in root of project. Should be `datalens-ui/.env` and add:
```dotenv
E2E_DOMAIN=http://localhost:3030
NO_AUTH=true
```
For additional configuration check [list of available ENV variables](documentation/env_configuration.md)


### Running test
Start containers by docker compose 
```bash
# It will run containers and UI from current branch.
docker compose -f tests/docker-compose.e2e.yml up
```
Run tests via commands:
```npm
npm run test:install:chromium
npm run test:e2e:opensource
```

### Developing tests in dev mode.

Install Node.js >= v18.17.0 manually or via [node version manager](https://github.com/nvm-sh/nvm).

Start project in dev mode:

```bash
docker compose -f tests/docker-compose.e2e.yml -f tests/docker-compose.e2e-dev.yml up

# Start datalens ui in dev mode:
npm ci # Use next command on Apple M1: npm ci --target_arch=x64
npm run dev
```

Run tests via commands:
```npm
npm run test:install:chromium
npm run test:e2e:opensource
```

### How to add new connection/dataset/chart/dashboard for E2E tests:

1. Start project `docker compose -f tests/docker-compose.e2e.yml up`
2. Create necessary test entries in interface
3. Run `npm run test:e2e:us-dump` - this command will create new database dump with test entries which you just created 