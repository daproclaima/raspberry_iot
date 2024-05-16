# https://community.home-assistant.io/t/how-to-configure-nginx-to-reverse-proxy-to-mqtt-using-ssl/63634
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

#server {
#    server_name mqttws.devedanos-iot.com www.devedanos-iot.com devedanos-iot.com;
#    listen 80;
#
#    root /var/www/html;
#    index index.php index.html index.htm;
#
#    location ~ /.well-known {
#        allow all;
#    }
#}

server {
   server_name mqttws.devedanos-iot.com www.devedanos-iot.com devedanos-iot.com;
   listen 80;

   root /var/www/html;
   index index.php index.html index.htm;

   location ~ /.well-known {
     allow all;
   }

   add_header Strict-Transport-Security "max-age=31536000; includeSubdomains";
   ssl off;
   proxy_buffering off;

   location /
   {
      proxy_pass ws://127.0.0.1:9001; #address of home assistant machine
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Connection $connection_upgrade;

      proxy_redirect default;
      proxy_set_header Host $host;
#     proxy_redirect http:// https://;
      proxy_http_version 1.1;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto https;
      proxy_set_header Upgrade $http_upgrade;
#     auth_basic "Restricted Content";
#     auth_basic_user_file /etc/nginx/.htpasswd;
   }
}