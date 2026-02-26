#!/bin/sh
set -e

# Default configurations (can be overridden by environment variables)
IMAGE_NAME="${IMAGE_NAME:-ver/verilocale-web}"
REMOTE_DIR="${REMOTE_DIR:-/root/gk/web}"
REMOTE_BASE="${REMOTE_DIR%/*}"
TS=$(date +%Y%m%d-%H%M%S)

# Health check function
health_wait() {
  NAME="$1"
  LIM="$2"
  echo "Checking health for $NAME (limit ${LIM}s)..."
  for i in $(seq 1 "$LIM"); do
    s=$(docker inspect -f '{{.State.Health.Status}}' "$NAME" 2>/dev/null || echo none)
    if [ "$s" = "healthy" ]; then
      echo "Container $NAME is HEALTHY"
      return 0
    fi
    sleep 2
  done
  echo "HEALTH_CHECK_FAILED: Container $NAME did not become healthy within $LIM seconds."
  exit 1
}

# Cleanup old production images
prune_prod_images() {
  keep="$1"
  echo "Pruning old production images (keeping last $keep)..."
  
  # Get current running image ID to avoid deleting it
  cur=$(docker inspect -f '{{.Config.Image}}' verilocale-web 2>/dev/null || echo '')
  
  # List prod tags sorted by date
  rep="${IMAGE_NAME}"
  tags=$(docker images "$rep" --format '{{.Tag}}' | grep '^prod-' | sort -r)
  
  # Keep top N tags
  keep_list=$(echo "$tags" | tr ' ' '\n' | head -n "$keep" | tr '\n' ' ')
  
  # Generate list of images to delete
  # 1. Get all prod tags sorted by date (newest first)
  # 2. Skip top N (keep)
  # 3. Filter out currently running image tag
  
  images_to_delete=""
  
  for t in $tags; do
    # Check if we should keep this tag (it's in the top N)
    if echo "$keep_list" | grep -q "\<$t\>"; then
      continue
    fi
    
    # Check if this tag is currently running
    if [ -n "$cur" ] && echo "$cur" | grep -q ":$t"; then
      echo "Skipping currently running image: $rep:$t"
      continue
    fi
    
    # Add to deletion list
    images_to_delete="$images_to_delete $rep:$t"
  done

  # Batch delete local images if any
  if [ -n "$images_to_delete" ]; then
      echo "Deleting old images locally: $images_to_delete"
      docker rmi $images_to_delete >/dev/null 2>&1 || true
      
      # Optional: Delete from Registry if configured
      if [ -n "$REGISTRY_URL" ]; then
          if command -v skopeo >/dev/null 2>&1; then
              for img in $images_to_delete; do
                  # Extract tag from image name (assuming img is name:tag)
                  tag=${img##*:}
                  echo "Deleting from registry: $REGISTRY_URL/$rep:$tag"
                  skopeo delete "docker://$REGISTRY_URL/$rep:$tag" || echo "Failed to delete $img from registry"
              done
          else
              echo "Skopeo not found, skipping registry deletion."
          fi
      fi
  else
      echo "No old images to prune."
  fi
}

# Main logic
echo "Starting promotion from dev to prod..."

# 1. Configuration
SRC_TAG="${SRC_TAG:-dev}"
NEW_TAG="${PROD_TAG:-prod-$TS}"

# 2. Verify source image exists
img_id=$(docker images -q "$IMAGE_NAME:$SRC_TAG")
if [ -z "$img_id" ]; then
  echo "ERROR: Source image '$IMAGE_NAME:$SRC_TAG' not found locally."
  exit 1
fi

# 3. Tag new production image
echo "Tagging $IMAGE_NAME:$SRC_TAG as $IMAGE_NAME:$NEW_TAG"
docker tag "$IMAGE_NAME:$SRC_TAG" "$IMAGE_NAME:$NEW_TAG"

# 4. Backup current production image
echo "Backing up current production state..."
mkdir -p "$REMOTE_BASE/backups"
cur=$(docker inspect -f '{{.Config.Image}}' verilocale-web 2>/dev/null || echo "$IMAGE_NAME:1.0.0")
tag=$(echo "$cur" | awk -F: '{print $2}')

# Only backup if we can determine the tag and it's not the initial placeholder
if [ -n "$tag" ]; then
  echo "Saving backup of $IMAGE_NAME:$tag..."
  docker save "$IMAGE_NAME:$tag" | gzip > "$REMOTE_BASE/backups/${IMAGE_NAME##*/}_$tag.tar.gz"
  echo "$tag" > "$REMOTE_DIR/.prod_prev" || true
else
  echo "Warning: Could not determine current tag for backup."
fi

# 5. Deploy new version
echo "Deploying $NEW_TAG..."
cd "$REMOTE_DIR"
# Export PROD_TAG for docker-compose
export PROD_TAG="$NEW_TAG"
docker compose up -d pord-web

# 6. Verify deployment
health_wait "verilocale-web" 60

# 7. Cleanup
prune_prod_images 3

echo "Promotion completed successfully!"
