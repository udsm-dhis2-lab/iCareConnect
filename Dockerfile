FROM openjdk:11 AS build

RUN apt-get update && \
    apt-get install -y curl gnupg apt-transport-https ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

COPY ./docker/glowroot /glowroot
COPY ./docker/setenv.sh bin/
COPY ./docker/admin.json /glowroot/

FROM udsmdhis2/icare-openmrs:1.0.0

COPY --from=build /glowroot /glowroot
COPY --from=build /bin/setenv.sh bin/

COPY ./omods/core/omod/target/icare-1.0.0-SNAPSHOT.omod .OpenMRS/modules/icare.omod
COPY ./ui/dist/icare-ui webapps/ROOT
