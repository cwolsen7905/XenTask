FROM ghcr.io/your-org/k8s/baseimages/nginx-php-fpm-memcache:latest

COPY --chown=www root/ /web/root/
COPY --chown=www inc/ /web/inc/
COPY --chown=www --chmod=755 bin/ /web/bin/
COPY conf/docker-nginx.cfg /etc/nginx/nginx.conf

EXPOSE 8080

USER www

RUN export TZ='EST'

# Let supervisord start nginx & php-fpm
#CMD [ "/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf" ]
CMD ["/bin/sh", "-c", "/web/bin/startup.sh" ]