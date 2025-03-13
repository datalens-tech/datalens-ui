# use native build platform for build js files only once
FROM --platform=${BUILDPLATFORM} ubuntu:22.04 AS native-build-stage

ARG NODE_MAJOR=20

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/cert.pem

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get -y install tzdata ca-certificates curl gnupg
    #DEBIAN_FRONTEND=noninteractive apt-get -y install tzdata && \
    #apt-get -y install python3.9 python3-pip

# node
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

RUN apt-get update && apt-get -y install nodejs g++ make wget

RUN useradd -m -u 1000 app && mkdir /opt/app && chown app:app /opt/app

WORKDIR /opt/app

COPY highcharts-load.sh fonts-load.sh package.json package-lock.json .npmrc /opt/app/
RUN npm ci
RUN chmod 775 /opt/app/highcharts-load.sh
RUN chmod 775 /opt/app/fonts-load.sh
RUN /opt/app/highcharts-load.sh
RUN /opt/app/fonts-load.sh
COPY ./dist /opt/app/dist
COPY ./src /opt/app/src
COPY app-builder.config.ts tsconfig.json /opt/app/

RUN npm run build && chown app /opt/app/dist/run

# runtime base image for both platform
FROM ubuntu:22.04 AS base-stage

ARG NODE_MAJOR=20

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get -y install tzdata ca-certificates curl gnupg && \
    apt-get -y install python3.9 python3-pip

# node
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

RUN apt-get update && apt-get -y install nginx supervisor nodejs

# remove unnecessary packages
RUN apt-get -y purge curl gnupg gnupg2 && \
    apt-get -y autoremove && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# timezone setting
ENV TZ="Etc/UTC"
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# user app
RUN useradd -m -u 1000 app && mkdir /opt/app && chown app:app /opt/app

# install package dependencies for production
FROM base-stage AS install-stage

# install system dependencies
RUN apt-get update && apt-get -y install g++ make

WORKDIR /opt/app

COPY package.json package-lock.json .npmrc /opt/app/

RUN npm ci && npm prune --production

# production running stage
FROM base-stage AS runtime-stage

# cleanup nginx defaults
RUN rm -rf /etc/nginx/sites-enabled/default

COPY deploy/nginx /etc/nginx
COPY deploy/supervisor /etc/supervisor/conf.d

# ставим библиотеки python
COPY export/requirements.txt /opt/app/export/requirements.txt
RUN pip install -r /opt/app/export/requirements.txt

# prepare rootless permissions for supervisor and nginx
ARG USER=app
RUN chown -R ${USER} /var/log/supervisor/ && \
    mkdir /var/run/supervisor && \
    chown -R ${USER} /var/run/supervisor && \
    mkdir -p /var/cache/nginx && chown -R ${USER} /var/cache/nginx && \
    mkdir -p /var/log/nginx  && chown -R ${USER} /var/log/nginx && \
    mkdir -p /var/lib/nginx  && chown -R ${USER} /var/lib/nginx && \
    touch /run/nginx.pid && chown -R ${USER} /run/nginx.pid 

ARG app_version
ENV APP_VERSION=$app_version
ENV TMPDIR=/tmp

#RUN chown -R ${USER} /opt/app/dist/run
#RUN chown -R ${USER} /opt/app/export 
WORKDIR /opt/app

COPY package.json package-lock.json /opt/app/

COPY export/dash2sheets.py /opt/app/export/dash2sheets.py
COPY export/csv2ods.py /opt/app/export/csv2ods.py

COPY --from=install-stage /opt/app/node_modules /opt/app/node_modules
COPY --from=native-build-stage /opt/app/dist /opt/app/dist

RUN chown -R ${USER} /opt/app/dist/run
RUN chown -R ${USER} /opt/app/export 

USER app

ENV NODE_ENV=production

ENV APP_BUILDER_CDN=false
ENV UI_CORE_CDN=false

ENV APP_MODE=full
ENV APP_ENV=production
ENV APP_INSTALLATION=opensource

EXPOSE 8080

ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
