ARG UBUNTU_VERSION=24.04

FROM ubuntu:${UBUNTU_VERSION} AS base-stage

ARG NODE_MAJOR=22

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get -y upgrade && apt-get -y install ca-certificates curl gnupg

# node
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

RUN apt-get update && apt-get -y install nodejs

# remove unnecessary packages
RUN apt-get -y purge curl gnupg gnupg2 && \
    apt-get -y autoremove && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# timezone setting
ENV TZ="Etc/UTC"
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# user app
RUN useradd -m -u 1001 app && mkdir /opt/app && chown app:app /opt/app

# install package dependencies for production
FROM base-stage AS install-stage

# install system dependencies
RUN apt-get update && apt-get -y install g++ make

WORKDIR /opt/app

COPY package.json package-lock.json .npmrc /opt/app/

RUN npm ci

# production running stage
FROM base-stage AS runtime-stage

ARG app_version

ENV TMPDIR=/tmp

WORKDIR /opt/app

COPY --from=install-stage /opt/app/package.json /opt/app/package-lock.json /opt/app/
COPY --from=install-stage /opt/app/node_modules /opt/app/node_modules

# split install playwright deps and browser
RUN npx playwright install chromium ffmpeg --with-deps --dry-run | grep --color=never 'sh -c' | sed 's|sh -c "||' | sed 's|"||' > ./deps.sh && chmod +x ./deps.sh && ./deps.sh && rm -rf ./deps.sh

ENV PLAYWRIGHT_DOWNLOAD_HOST=https://storage.yandexcloud.net/playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/app/pw-browsers

RUN npx playwright install chromium ffmpeg && rm -rf /var/lib/apt/lists/*

# copy sources

COPY ./src/shared /opt/app/src/shared
COPY ./tests /opt/app/tests

RUN mkdir -p /opt/app/tests/artifacts && chown -R app:app /opt/app/tests

USER app

ENV NODE_ENV=production

ENV APP_VERSION=$app_version

ENV E2E_DOMAIN="http://localhost:8080" 
ENV E2E_RETRY_TIMES=1
ENV E2E_NO_AUTH=true 

ENTRYPOINT ["npm", "run", "test:e2e:opensource"]
