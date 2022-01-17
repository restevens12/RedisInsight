@echo off

set COMMON_URL=%USERPROFILE%/AppData/Local/Programs/redisinsight/resources/app.asar/index.html
set ELECTRON_PATH=%USERPROFILE%/AppData/Local/Programs/redisinsight/RedisInsight-preview.exe

call yarn --cwd tests/e2e install

call "./release/Redisinsight-preview-win-installer.exe"

:: waiting until app auto launches
timeout 5

:: close an auto launched app
taskkill /im Redisinsight-preview.exe /f

:: run rte & tests
call docker-compose -f tests/e2e/docker-compose.yml create --force-recreate
call docker-compose -f tests/e2e/docker-compose.yml run init-rte || exit 1

call yarn --cwd tests/e2e dotenv -e .desktop.env yarn --cwd tests/e2e test:desktop
