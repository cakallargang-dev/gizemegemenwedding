FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY . /usr/share/nginx/html/
RUN echo 'server { listen 8080; server_name www.gizemegemenwedding.online; return 301 https://gizemegemenwedding.online$request_uri; } server { listen 8080; root /usr/share/nginx/html; index izmir.html; try_files $uri $uri.html $uri/ =404; }' > /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]