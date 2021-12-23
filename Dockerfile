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

RUN mkdir -p /logs/nginx && mkdir -p /data

RUN pip install --no-cache --upgrade pip
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# copy nginx conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY app /src/app 

COPY bin/start.sh /src/bin/start.sh

CMD /src/bin/start.sh 

VOLUME /logs
VOLUME /data
