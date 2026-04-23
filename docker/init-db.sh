#!/bin/bash
# Runs automatically by postgres image on first start (empty volume).
# Loads backup.sql into the database, fixing ownership from local user to postgres.

set -e

echo ">>> Loading vinyl store backup data..."

sed \
  -e "s/OWNER TO nikitatata/OWNER TO ${POSTGRES_USER}/g" \
  -e '/^\\restrict/d' \
  -e '/^\\unrestrict/d' \
  /docker-entrypoint-initdb.d/backup.sql \
| psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" --set ON_ERROR_STOP=0

echo ">>> Backup loaded."
