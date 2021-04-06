#!/usr/bin/env bash

if [ -z "$SRC_USERNAME" ] || [ -z "$REPO_NAME" ] || [ -z "$CONTAINER_NAME" ] || [ -z "$NODE_MODULES_VOLUME_NAME" ] ; then
    echo "Need SRC_USERNAME, REPO_NAME, CONTAINER_NAME, and NODE_MODULES_VOLUME_NAME set"
    exit 1
fi

# Check for the needed volume
if ! docker volume ls | grep -q ${NODE_MODULES_VOLUME_NAME}; then \
	docker volume create --name ${NODE_MODULES_VOLUME_NAME}; \
fi

docker run \
	--rm \
	--name ${CONTAINER_NAME} \
	-p 3000:3000 \
	-v `pwd`:/usr/src/gospel-notes \
 	-v nodemodules:/usr/src/gospel-notes/node_modules \
	${SRC_USERNAME}/${REPO_NAME}
