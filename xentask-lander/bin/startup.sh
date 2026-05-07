#!/bin/sh
/usr/bin/php /web/bin/build_api.php
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf