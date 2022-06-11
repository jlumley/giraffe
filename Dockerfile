FROM python:3.9-alpine

LABEL maintainer="Jeremy Lumley <jeremy.lumley96@gmail.com>"
LABEL org.opencontainers.image.source = "https://github.com/jlumley/giraffe"

RUN apk update && apk upgrade

RUN apk add --no-cache \
sqlite \
curl \
nginx \
linux-headers \
gcc \
libc-dev \
pcre-dev \
nodejs \
npm

RUN pip install --no-cache --upgrade pip
RUN pip install \
Flask==2.0.1 \
Flask-expects-json==1.7.0 \
Uwsgi==2.0.19.1 \
werkzeug==2.0.3 \
pytest

COPY app/frontend/package.json /src/app/frontend/package.json
COPY app/frontend/package-lock.json /src/app/frontend/package-lock.json
WORKDIR /src/app/frontend

RUN npm ci
RUN npm install -g serve

COPY app/frontend /src/app/frontend
RUN npm run build

VOLUME /data
VOLUME /logs
EXPOSE 80

# copy nginx conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf

COPY app /src/app
COPY bin/start.sh /src/bin/start.sh

WORKDIR /src/app

