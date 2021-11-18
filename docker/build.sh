sh docker/build-local.sh
version=$(cat version)
docker push udsmdhis2/icare-core:$version