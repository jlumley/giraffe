FROM alpine

LABEL maintainer="Jeremy Lumley <jeremy.lumley96@gmail.com>"

RUN apk update && apk upgrade

RUN apk add --no-cache \
sqlite \
curl
RUN apk add --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip

RUN pip3 install --no-cache --upgrade pip setuptools
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt


# copy src 
ARG FLASK_DIR="/src/giraffe-flask-app"
RUN mkdir -p $FLASK_DIR
COPY flask_app.py ${FLASK_DIR}/flask_app.py
COPY giraffe_budget ${FLASK_DIR}/giraffe_budget

CMD python /src/giraffe-flask-app/flask_app.py

VOLUME /data
