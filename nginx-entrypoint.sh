#!/bin/sh
PORT=80
[ -n "$PORT" ] && PORT="$PORT"
cat > /etc/nginx/conf.d/default.conf << EOF
server {
    listen $PORT;
    root /usr/share/nginx/html;
    index izmir.html;
    try_files \$uri \$uri.html \$uri/ =404;
}
EOF
exec "$@"
