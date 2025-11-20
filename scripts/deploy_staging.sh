#!/usr/bin/env bash
set -euo pipefail

IMAGE=${1:-}
TARGET=${2:-}

if [[ -z "$IMAGE" || -z "$TARGET" ]]; then
  echo "Usage: $0 <image> <user@host>"
  exit 1
fi

ssh "$TARGET" bash -lc "
  docker pull $IMAGE && \
  docker rm -f social-gaming-backend || true && \
  docker run -d \
    --name social-gaming-backend \
    -p 4000:4000 \
    --env PORT=4000 \
    --env DATABASE_URL=\"\$DATABASE_URL\" \
    --env DB_SSL=true \
    --env SUPABASE_URL=\"\$SUPABASE_URL\" \
    --env SUPABASE_SERVICE_KEY=\"\$SUPABASE_SERVICE_KEY\" \
    --env SUPABASE_ANON_KEY=\"\$SUPABASE_ANON_KEY\" \
    --env JWT_SECRET=\"\$JWT_SECRET\" \
    $IMAGE
"