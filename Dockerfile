FROM ghcr.io/gravity-ui/node-nginx:ubuntu20-nodejs18

ARG app_version

ENV APP_BUILDER_CDN=false
ENV UI_CORE_CDN=false
ENV TMPDIR=/tmp
ENV APP_VERSION=$app_version
ENV NODE_ENV=production

WORKDIR /opt/app

COPY deploy/nginx /etc/nginx
COPY deploy/supervisor /etc/supervisor/conf.d
COPY . .

RUN npm ci -q --no-progress --include=dev --also=dev
RUN npm run build
RUN npm prune --production
RUN rm -rf assets deploy src /tmp/* /root/.npm
RUN chown app /opt/app/dist/run

CMD /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
