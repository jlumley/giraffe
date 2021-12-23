mkdir -p /logs/nginx
nginx

uwsgi --ini /src/app/uwsgi.ini
