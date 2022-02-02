yarn --cwd tests/e2e install

# mount app resources
./release/*.AppImage --appimage-mount >> apppath &

# run rte
docker-compose -f tests/e2e/docker-compose.yml build
docker-compose -f tests/e2e/docker-compose.yml create --force-recreate
docker-compose -f tests/e2e/docker-compose.yml run init-rte && \

# run tests
COMMON_URL=$(tail -n 1 apppath)/resources/app.asar/index.html \
ELECTRON_PATH=$(tail -n 1 apppath)/redisinsight \
yarn --cwd tests/e2e dotenv -e .desktop.env yarn --cwd tests/e2e test:desktop

docker-compose -f tests/e2e/docker-compose.yml stop
