cd tests/e2e
yarn install
../../release/*.AppImage --appimage-mount >> apppath &
docker-compose create --force-recreate
docker-compose run init-rte && \
COMMON_URL=$(tail -n 1 apppath)/resources/app.asar/index.html \
ELECTRON_PATH=$(tail -n 1 apppath)/redisinsight \
dotenv -e .desktop.env yarn test:desktop
