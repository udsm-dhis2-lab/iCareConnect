#!/bin/bash
branch=$(git branch | grep \* | cut -d ' ' -f2)
NODE_IMAGE="node:20"

docker run --rm -w="/app" -v "$(pwd)/ui":/app $NODE_IMAGE npm install --legacy-peer-deps
docker run --rm -w="/app" -v "$(pwd)/ui":/app $NODE_IMAGE npm run build:prod

docker run --rm -v $(pwd)/omods/core:/usr/src/omod -w /usr/src/omod udsmdhis2/icare-omod-compiler mvn clean package -DskipTests

version=$(cat version)
if [ -n "$GITHUB_HEAD_REF" ]; then
  branch="$GITHUB_HEAD_REF"
else
  branch="${GITHUB_REF##*/}"
fi
safe_branch=$(echo "$branch" | sed 's/[^a-zA-Z0-9._-]/_/g')
docker buildx build -t udsmdhis2/icare-core:$safe_branch-$version --push .
