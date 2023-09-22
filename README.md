# DataLens

### Prerequisites

[Install docker](https://docs.docker.com/engine/install/)

[Install docker compose plugin](https://docs.docker.com/compose/install/linux/) if it not already installed

### Start project in dev mode

Install NodeJS >= v18.17.0 manually or via [node version manager](https://github.com/nvm-sh/nvm).

Start project in dev mode:

```bash
# Start backend for datalens:
git clone git@github.com:datalens-tech/datalens.git
cd datalens
docker compose up

# Start datalens ui in dev mode:
git clone git@github.com:datalens-tech/datalens-ui.git
cd ui
npm ci # Use next command on Apple M1: npm ci --target_arch=x64
npm run dev
```

Now you can open datalens in dev mode at [http://localhost:3030](http://localhost:3030)

### Credentials for posgres

Hostname:
```
postgres-connection
```

Port:
```
5432
```

Path to database:
```
world-db
```

Username:
```
world
```

Password:
```
world123
```
