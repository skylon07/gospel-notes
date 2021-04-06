#!/usr/bin/env bash

if [ -z "$SRC_USERNAME" ] || [ -z "$REPO_NAME" ]; then
    echo "Need SRC_USERNAME and REPO_NAME set"
    exit 1
fi
docker build -t ${SRC_USERNAME}/${REPO_NAME} .
