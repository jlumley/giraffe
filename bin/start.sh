mkdir -p /logs/nginx
mkdir -p /logs/uwsgi

nginx

if [ -z "${API_ONLY}"]; then

  uwsgi --ini /src/app/uwsgi.ini &

  cd /src/app/frontend
  serve -s build

else
 uwsgi --ini /src/app/uwsgi.ini

fi
