#!/bin/sh

set -e

DEFAULT_CONF_FILE="etc/nginx/nginx.conf"

# check if we have ipv6 available
if [ -f "/proc/net/if_inet6" ]; then
  # check config file exists
  if [ -f "/$DEFAULT_CONF_FILE" ]; then
    # check write permission
    if touch /$DEFAULT_CONF_FILE 2>/dev/null; then
      # enable ipv6 on nginx.conf listen sockets
      sed -i -E 's|listen 8080;|listen 8080;\n        listen [::]:8080;|' /$DEFAULT_CONF_FILE
    else
      echo '{"level":"INFO","msg":"can not modify /'"${DEFAULT_CONF_FILE}"' (read-only file system?)"}'
    fi
  else
    echo '{"level":"INFO","msg":"/'"${DEFAULT_CONF_FILE}"' is not a file or does not exist"}'
  fi
else
  echo '{"level":"INFO","msg":"ipv6 not available"}'
fi

exec '/usr/sbin/nginx'
