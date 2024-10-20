#!/bin/bash
branch=$(git branch | grep \* | cut -d ' ' -f2)
NODE_IMAGE="node:20"

docker run --rm -w="/app" -v "$(pwd)/ui":/app $NODE_IMAGE npm install --legacy-peer-deps
docker run --rm -w="/app" -v "$(pwd)/ui":/app $NODE_IMAGE npm run build:prod

# Compile the backend modules using Maven
docker run --rm -v "$(pwd)/omods/core":/usr/src/omod -w /usr/src/omod udsmdhis2/icare-omod-compiler mvn clean package -DskipTests

# Build the final Docker image with the current branch and version
version=$(cat version)
docker build --no-cache -t udsmdhis2/icare-core:$branch-$version .

# docker build --no-cache -t udsmdhis2/icare-core:local .
