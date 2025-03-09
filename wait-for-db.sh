#!/bin/sh

host="$1"
port="$2"
shift 2
cmd="$@"

while ! nc -z "$host" "$port"; do
  echo "Esperando a MongoDB en $host:$port..."
  sleep 2
done

exec $cmd