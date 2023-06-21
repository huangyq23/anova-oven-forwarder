#!/bin/bash

. $(dirname $0)/_image-tag.sh
echo $IMAGE_TAG

docker push $IMAGE_TAG