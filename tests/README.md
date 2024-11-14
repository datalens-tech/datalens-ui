# DataLens E2E tests

### Prerequisites

[Install docker](https://docs.docker.com/engine/install/)

[Install docker compose plugin](https://docs.docker.com/compose/install/linux/) if it not already installed

### Tests run configuration
Create `.env` file in root of project. Should be `datalens-ui/.env` and add:
```sh
E2E_DOMAIN=http://localhost:8080
NO_AUTH=true
```
For additional configuration check [list of available ENV variables](documentation/env_configuration.md)


### Running test
Start containers by docker compose
```sh
# It will run containers and UI from current branch.
npm run test:e2e:docker:up
```

Run tests via commands:
```sh
npm run test:install:chromium
npm run test:e2e:opensource
```

### Developing tests in dev mode.

Install Node.js >= v20.18.0 manually or via [node version manager](https://github.com/nvm-sh/nvm).

Change UI port for E2E tests to dev running application at `.env` file:
```sh
E2E_DOMAIN=http://localhost:3030
```

Start project in dev mode (don't forget to update docker images first):

```sh
# It will run only dependent containers without UI.
npm run test:e2e:docker:up-no-ui

# Start datalens UI in dev mode:
npm ci
npm run dev
```

Run tests via commands:
```sh
npm run test:install:chromium
npm run test:e2e:opensource
```

### How to add or modify new connection/dataset/chart/dashboard for E2E tests:
1. Start project 
```sh
# Clear existing containers
npm run test:e2e:docker:down
# Run containers with UI from current branch
npm run test:e2e:docker:up
```
2. Create necessary test entries in interface
3. Run `npm run test:e2e:us-dump` - this command will create new database dump with test entries which you just created

### Screenshots tests:

In some cases, you may need to compare the visual representation of widget charts and other elements.
Playwright Test includes the ability to produce and visually compare screenshots using `await expect(page).toHaveScreenshot()`.
Details: https://playwright.dev/docs/test-snapshots

It is convenient to add the `@screenshot` tag to the name of such tests so that you can immediately update all snapshots if needed.
For example:

```ts
datalensTest('Date and time on the Y axis @screenshot', async ({page}) => {
    ...
});
```

There are many factors that affect browser rendering on different machines, including hardware and OS configuration.
The only reliable way to get identical screenshots is to use identical hosts, or VMs with the same image, or containers.
Therefore, to get the correct screenshots (identical to the reference ones), you need to run playwright inside the container:
```sh
npm run test:e2e:docker:playwright
```

To update snapshots, you must first set the env variable `E2E_UPDATE_SNAPSHOTS`:
```sh
E2E_UPDATE_SNAPSHOTS=1
```
And later commit the resulting screenshots.

When updating dependencies used in tests (for example, playwright), you may need to rebuild the image:
```sh
test:e2e:docker:playwright:clear
```
