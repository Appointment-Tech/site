#!/usr/bin/env bash
# Builda e reinicia o servidor — nessa ordem, sempre.
#
# 🚨 O servidor Node do nitro monta o índice de assets públicos na memória ao
# iniciar. Rodar `npm run build` com ele de pé recria .output no disco e o
# processo antigo passa a servir 404 para TODOS os assets, enquanto o HTML
# continua carregando normalmente — sintoma que parece bug de configuração e
# não é. Este script existe para tornar impossível esquecer o restart.
set -euo pipefail
cd "$(dirname "$0")"

PORT="${PORT:-3103}"
PIDFILE="/tmp/site-v3-$PORT.pid"

# Arquivo de PID, não `pgrep -f`/`pkill -f`: o padrão de busca casa com o
# próprio shell que roda este script e mata a sessão junto.
if [ -f "$PIDFILE" ]; then
  OLD=$(cat "$PIDFILE")
  if kill -0 "$OLD" 2>/dev/null; then
    kill "$OLD" && echo "servidor anterior ($OLD) encerrado"
  fi
  rm -f "$PIDFILE"
fi

npm run build

PORT="$PORT" nohup node .output/server/index.mjs > /tmp/v3-server.log 2>&1 &
echo $! > "$PIDFILE"
until curl -s -o /dev/null -m 2 "http://localhost:$PORT/" 2>/dev/null; do sleep 1; done
echo "no ar em http://localhost:$PORT/ (pid $(cat $PIDFILE))"
