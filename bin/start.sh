mkdir -p /logs/nginx
mkdir -p /logs/uwsgi

nginx

uwsgi --ini /src/app/uwsgi.ini
