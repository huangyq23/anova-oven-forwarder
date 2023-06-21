#!/bin/bash

. $(dirname $0)/_image-tag.sh
echo $IMAGE_TAG

docker run -t -p 3000:3000 -v ${PWD}/.env:/usr/src/app/.env:ro $IMAGE_TAG