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
Ключ (токен) для авторизации требуется передать в адресной строке, как `x-rpc-authorization=bW9iaWxlOjEyMzQ1`. Токен защифрован, как кодировка `base64`.

Во все внешние запросы прокидывается дополнительный заголовок: `X-Rpc-Authorization`.

Интерфейс взаимодействует с REST API https://github.com/akrasnov87/datalens-auth.

## Сборка
<pre>
docker login -u [username]
docker build -t akrasnov87/datalens-ui:0.2864.0 .
docker push akrasnov87/datalens-ui:0.2864.0
</pre>

## Тестирование

В корне проекта создать файл `.env` и добавить туда строки:

<pre>
US_ENDPOINT="http://host.docker.internal:8030"
BI_API_ENDPOINT="http://host.docker.internal:8031"
BI_DATA_ENDPOINT="http://host.docker.internal:8032"
HC=1
PYTHON=python3
### TEMPLATE SECRETS BEGIN
APP_MODE=full
APP_ENV=development
APP_INSTALLATION=opensource
APP_DEV_MODE=1

### TEMPLATE SECRETS END
</pre>

Где:
* PYTHON - это команда для вызова python, используется для создания `.ods` файла (альтернатива `.xlsx`). По умолчанию хранится `python3` (см. src/server/configs/common.ts)

Выполняем команды:
<pre>
npm ci
npm run dev
</pre>

### Новые параметры

* FETCHING_TIMEOUT_SEC=600 - таймаут в секундах для выполнения запроса;
* FLAT_TABLE_ROWS_LIMIT=1000000 - максимальное количество строк для табличных данных;
* UNITED_STORAGE_CONFIG_LOADED_TIMEOUT=10000 - таймаут на получение информации о связи двух таблиц по связанному ключу, по умолчанию занчение 10000 ms

## Получение последних изменений с главного репозитория yandex

<pre>
git remote add upstream https://github.com/datalens-tech/datalens-ui.git
git pull upstream main
</pre>

## Запуск через vscode

Создаём launch файл
<pre>
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch via npm",
            "type": "node",
            "request": "launch",
            "cwd": "${workspaceFolder}",
            "runtimeExecutable": "npm",
            "runtimeArgs": ["run", "dev"]
        }
    ]
}
</pre>

## Running Puppeteer

На локальном компьютере должен быть установлен `google-chrome-stable`:
<pre>
sudo apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
</pre>

Инструкция по запуску в контейнере [тут](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker).

В файле `src\server\controllers\print-entry.ts` указывается путь к `google-chrome-stable`. Для определения этого пути используется команда: `which google-chrome-stable`.

## Авторы доработки

* Александр Краснов - https://github.com/akrasnov87
* Кирилл Автономов -  https://github.com/kirillva