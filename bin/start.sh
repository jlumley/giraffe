
#nginx -c /etc/nginx/nginx.conf

uwsgi --ini /src/app/uwsgi.ini
#uwsgi --socket 0.0.0.0:5000 --protocol=http --chdir /src/app --module wsgi:app
