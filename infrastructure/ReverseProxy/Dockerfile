# Dockerfile for Nginx
# https://nginx.org/en/docs/beginners_guide.html https://nginx.org/en/docs/beginners_guide.html#conf_structure
FROM nginx:alpine
COPY ./conf.d etc/nginx/conf.d
COPY ./data /data
EXPOSE 80