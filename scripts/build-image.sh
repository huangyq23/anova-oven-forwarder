#!/bin/bash

. $(dirname $0)/_image-tag.sh
echo $IMAGE_TAG

docker build . -t $IMAGE_TAG
