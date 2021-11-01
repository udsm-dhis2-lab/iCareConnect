cd ui
docker run -w="/app" -v "$(pwd)":/app node:12.18.3-alpine3.12 npm install
docker run -w="/app" -v "$(pwd)":/app node:12.18.3-alpine3.12 npm run build:prod
cd ..
docker run --rm -v maven-repo:/root/.m2 -v $(pwd)/omods/core:/usr/src/omod -w /usr/src/omod maven:3.6.3-openjdk-11-slim mvn clean package -DskipTests
version=$(cat version)
echo "$version"
docker build -t udsmdhis2/icare-core:$version .