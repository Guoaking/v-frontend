#!/bin/sh
set -e
mkdir -p lib/backups/postgres lib/backups/grafana
docker compose -f lib/docker-compose.yml exec -T database pg_dump -U kong -d grafana | gzip > lib/backups/postgres/grafana-$(date +%Y%m%d-%H%M%S).sql.gz
docker run --rm -v grafana_data:/data -v "$PWD/lib/backups/grafana":/backup alpine sh -lc 'tar czf /backup/grafana-data-$(date +%Y%m%d-%H%M%S).tgz -C /data .'
