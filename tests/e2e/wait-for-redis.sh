HOST=${1}
PORT=${2}
TIMEOUT=${TIMEOUT:-120}

echo "Waiting for redis on $HOST:$PORT... "

while [ $TIMEOUT -gt 0 ]; do
    echo "_TIMEOUT: $TIMEOUT"

    PONG=$(echo -e '*1\r\n$4\r\nPING\r\n' | nc -q 1 $HOST $PORT)
    ((TIMEOUT-=1))

    if [ $PONG ]; then
      echo "Redis is available on $HOST:$PORT"
      exit 0;
    fi

    sleep 1
    echo "Waiting... "
done

echo "Unable to establish connection to $HOST:$PORT"
exit 1;
