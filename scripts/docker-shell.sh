#!/usr/bin/env bash

if [ -z "$CONTAINER_NAME" ]; then
    echo "Need CONTAINER_NAME"
    exit 1
fi
docker exec -it ${CONTAINER_NAME} /bin/sh
