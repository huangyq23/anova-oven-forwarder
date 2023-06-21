if [ -z "$npm_package_version" ]; then
    npm_package_version="latest"
fi

if [ -z "$IMAGE_NAME" ]; then
    IMAGE_NAME="anova-oven-forwarder"
fi

IMAGE_TAG="$IMAGE_NAME:$npm_package_version"