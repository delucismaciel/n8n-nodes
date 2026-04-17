#!/usr/bin/env bash
set -euo pipefail

NODE=""
CONTAINER=""

for arg in "$@"; do
  case $arg in
    --node=*)
      NODE="${arg#*=}"
      ;;
    --container=*)
      CONTAINER="${arg#*=}"
      ;;
    -h|--help)
      echo "Uso: $0 --node=\"n8n-nodes-xxx\" --container=\"n8n-servo\""
      echo
      echo "Copia o pacote de nodos/<NODE> para o container n8n, ajusta"
      echo "permissões e reinicia o serviço."
      exit 0
      ;;
    *)
      echo "Argumento desconhecido: $arg" >&2
      echo "Uso: $0 --node=\"n8n-nodes-xxx\" --container=\"n8n-servo\"" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$NODE" || -z "$CONTAINER" ]]; then
  echo "Uso: $0 --node=\"n8n-nodes-xxx\" --container=\"n8n-servo\"" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/nodos/$NODE"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Pacote não encontrado: $SOURCE_DIR" >&2
  exit 1
fi

echo "→ Buildando $NODE…"
(cd "$SOURCE_DIR" && npm run build)

echo "→ Copiando $NODE para $CONTAINER…"
docker cp "$SOURCE_DIR" "$CONTAINER://home/node/.n8n/custom/node_modules/"

echo "→ Ajustando permissões…"
docker exec -u root "$CONTAINER" chown -R node:node "//home/node/.n8n/custom/node_modules/$NODE"

echo "→ Reiniciando $CONTAINER…"
docker restart "$CONTAINER"

echo "OK — $NODE instalado em $CONTAINER."
