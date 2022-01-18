@echo off

set COMMON_URL=%USERPROFILE%/AppData/Local/Programs/redisinsight/resources/app.asar/index.html
set ELECTRON_PATH=%USERPROFILE%/AppData/Local/Programs/redisinsight/RedisInsight-preview.exe

call yarn --cwd tests/e2e install

call "./release/RedisInsight-preview-win-installer.exe"

:: waiting until app auto launches
timeout 5

:: close an auto launched app
taskkill /im RedisInsight-preview.exe /f
taskkill /im RedisInsight-preview-win-installer.exe /f

:: run rte & tests
:: call docker-compose -f tests/e2e/docker-compose.yml create --force-recreate
:: call docker-compose -f tests/e2e/docker-compose.yml run init-rte || exit 1

call yarn --cwd tests/e2e dotenv -e .desktop.env yarn --cwd tests/e2e test:desktop

"C:\Program Files\Docker\docker.exe"
invoke-webRequest "https://github.com/docker/compose/releases/download/v1.29.2/docker-compose-Windows-x86_64.exe" -UseBasicParsing -outfile "C:\Program Files\Docker\docker-compose.exe"
https://github.com/docker/compose/releases/download/v2.2.3/docker-compose-windows-x86_64.exe
Invoke-WebRequest "https://github.com/docker/compose/releases/download/v2.2.3/docker-compose-windows-x86_64.exe" -UseBasicParsing -OutFile $Env:ProgramFiles\Docker\docker-compose.exe

:: USE THIS!
Invoke-WebRequest "https://github.com/docker/compose/releases/download/v2.2.3/docker-compose-windows-x86_64.exe" -UseBasicParsing -OutFile "C:\Program Files\Docker\docker-compose.exe"

stop-service *docker*
dockerd --experimental
