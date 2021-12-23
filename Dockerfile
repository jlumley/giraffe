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

#RUN apk add --no-cache python3 && ln -sf python3 /usr/bin/python
#RUN python3 -m ensurepip

RUN pip3 install --no-cache --upgrade pip
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# copy nginx conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY app /src/app 

COPY bin/start.sh /src/bin/start.sh

CMD /src/bin/start.sh 

VOLUME /data
