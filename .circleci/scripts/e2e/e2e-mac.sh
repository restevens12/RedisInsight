yarn --cwd tests/e2e install

# mount and copy app sources
sudo hdiutil attach ./release/RedisInsight-preview-mac-x64.dmg
sudo cp -R /Volumes/RedisInsight-preview-mac-x64/RedisInsight-preview.app /Applications
sudo hdiutil unmount /Volumes/RedisInsight-preview-mac-x64/

# run rte
docker-compose -f tests/e2e/docker-compose.yml create --force-recreate
docker-compose -f tests/e2e/docker-compose.yml run init-rte && \

# run tests
COMMON_URL=/Applications/RedisInsight-preview.app/Contents/resources/app.asar/index.html \
ELECTRON_PATH=/Applications/RedisInsight-preview.app/Contents/redisinsight \
yarn --cwd tests/e2e dotenv -e .desktop.env yarn --cwd tests/e2e test:desktop
