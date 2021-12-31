FROM python:3.9-alpine

LABEL maintainer="Jeremy Lumley <jeremy.lumley96@gmail.com>"

RUN apk update && apk upgrade

RUN apk add --no-cache \
sqlite \
curl \
nginx \
linux-headers \
gcc \
libc-dev \
pcre-dev

RUN pip install --no-cache --upgrade pip
RUN pip install \
Flask==2.0.1 \
Flask-expects-json==1.7.0 \
Uwsgi==2.0.19.1

VOLUME /data
VOLUME /logs
EXPOSE 80

# copy nginx conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY app /src/app

COPY bin/start.sh /src/bin/start.sh

CMD /src/bin/start.sh
