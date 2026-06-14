#!/bin/sh
set -e

CHECKSUM_FILE=/app/node_modules/.package-checksum
CURRENT=$(md5sum /app/package-lock.json | awk '{print $1}')

if [ ! -f "$CHECKSUM_FILE" ] || [ "$(cat $CHECKSUM_FILE)" != "$CURRENT" ]; then
  echo "package-lock.json changed or node_modules empty — running npm ci..."
  npm ci
  echo "$CURRENT" > "$CHECKSUM_FILE"
fi

exec "$@"
