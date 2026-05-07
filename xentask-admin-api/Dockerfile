FROM ghcr.io/your-org/k8s/baseimages/ubuntu-nginx-onnx:latest

USER root

RUN apk add --no-cache php7-gd ffmpeg libwebp libwebp-tools && \
	rm -rf /var/cache/*

COPY --chown=www root/ /web/root/
COPY --chown=www inc/ /web/inc/
COPY --chown=www templates/ /web/templates/
COPY conf/docker-nginx.cfg /etc/nginx/nginx.conf

EXPOSE 8080

USER www

RUN export TZ='EST'

# Let supervisord start nginx & php-fpm
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
