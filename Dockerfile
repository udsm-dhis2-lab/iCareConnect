FROM udsmdhis2/icare-openmrs:1.0.0
RUN apt-get update && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs
RUN node -v
COPY ./docker/glowroot /glowroot
COPY ./docker/setenv.sh bin/
COPY ./docker/admin.json /glowroot/

COPY ./omods/core/omod/target/icare-1.0.0-SNAPSHOT.omod .OpenMRS/modules/
COPY ./ui/dist/icare-ui webapps/ROOT
#COPY ./docs/build webapps/docs