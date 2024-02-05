# DataLens

### Prerequisites

[Install docker](https://docs.docker.com/engine/install/)

[Install docker compose plugin](https://docs.docker.com/compose/install/linux/) if it not already installed

### Start project in dev mode

Install Node.js >= v18.17.0 manually or via [node version manager](https://github.com/nvm-sh/nvm).

Start project in dev mode:

```bash
# Start backend for datalens:
git clone git@github.com:datalens-tech/datalens.git
cd datalens
docker compose -f docker-compose-dev.yml up

# Start datalens ui in dev mode:
git clone git@github.com:datalens-tech/datalens-ui.git
cd ui
npm ci
npm run dev
```

Now you can open datalens in dev mode at [http://localhost:3030](http://localhost:3030)

### Credentials for postgres

Hostname:

```
pg-demo-connection
```

Port:

```
5432
```

Path to database:

```
demo
```

Username:

```
demo
```

Password:

```
demo
```
## Комментарий
Ключ для авторизации требуется передать в адресной строке, как `x-rpc-authorization=bW9iaWxlOjEyMzQ1`.

Во все внешние запросы прокидывается дополнительный заголовок: `X-Rpc-Authorization`.

## Отладка и запуск проекта
Требуется установить WSL2 и запусить проект в Visual Code

В терминале выбрать `Ubuntu WSL` и выполнить команду `code .`

Подробнее:
* https://www.petermorlion.com/debugging-wsl-from-vs-code/
* https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-vscode


## Сборка
<pre>
docker login -u [username]
docker build -t akrasnov87/datalens-ui:0.1245.0 .
docker push akrasnov87/datalens-ui:0.1245.0
</pre>

## Тестирвование

В корне проекта создать файл .env и добавить туда строки:
<pre>
US_ENDPOINT="http://host.docker.internal:8030"
BI_API_ENDPOINT="http://host.docker.internal:8031"
BI_DATA_ENDPOINT="http://host.docker.internal:8032"
### TEMPLATE SECRETS BEGIN
APP_MODE=full
APP_ENV=development
APP_INSTALLATION=opensource
APP_DEV_MODE=1

### TEMPLATE SECRETS END
</pre>
