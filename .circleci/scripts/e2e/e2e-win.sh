cd tests/e2e
yarn install
docker-compose create --force-recreate
docker-compose run init-rte && \
COMMON_URL=$USERPROFILE/AppData/Local/Programs/redisinsight/resources/app.asar/index.html \
ELECTRON_PATH=./release \
dotenv -e .desktop.env yarn test:desktop
