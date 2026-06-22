#!/bin/sh
PORT=80
[ -n "$PORT" ] && PORT="$PORT"
cat > /etc/nginx/conf.d/default.conf << NGINXEOF
server {
    listen $PORT;
    server_name www.gizemegemenwedding.online;
    return 301 https://gizemegemenwedding.online\$request_uri;
}

server {
    listen $PORT;
    root /usr/share/nginx/html;
    index izmir.html;
    try_files \$uri \$uri.html \$uri/ =404;
}
NGINXEOF
exec "$@"
