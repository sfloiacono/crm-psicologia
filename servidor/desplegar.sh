#!/bin/bash
# =========================================================
# Instala o actualiza el servidor de Consultorio Psiconflor.
# Se ejecuta en Cloud Shell:  bash desplegar.sh homo   (o prod)
# =========================================================
set -e
cd "$(dirname "$0")"
PROYECTO="consultorio-psiconflor"
REGION="southamerica-east1"
ENTORNO="${1:-homo}"
ORIGENES="https://sfloiacono.github.io"
if [ "$ENTORNO" != "homo" ] && [ "$ENTORNO" != "prod" ]; then echo "El entorno tiene que ser homo o prod."; exit 1; fi

echo ""
echo "== Consultorio Psiconflor: instalando el servidor ($ENTORNO) =="
gcloud config set project "$PROYECTO" --quiet >/dev/null

# Emails que pueden facturar (se guardan solo en tu Cloud Shell, no en GitHub)
AUT_FILE="$HOME/.psiconflor-autorizados"
if [ ! -s "$AUT_FILE" ]; then
  echo ""
  echo "Escribí los emails que pueden facturar, separados por coma, y apretá Enter:"
  read -r A
  echo "$A" | tr -d ' ' | tr 'A-Z' 'a-z' > "$AUT_FILE"
fi
AUT="$(cat "$AUT_FILE")"
echo "Cuentas autorizadas: $AUT"

echo ""
echo "1/4 Activando los servicios de Google necesarios (puede tardar un par de minutos)..."
gcloud services enable cloudfunctions.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com \
  run.googleapis.com secretmanager.googleapis.com logging.googleapis.com firestore.googleapis.com --quiet

echo "2/4 Dando permisos al servidor para leer el certificado..."
NUM="$(gcloud projects describe "$PROYECTO" --format='value(projectNumber)')"
SA="${NUM}-compute@developer.gserviceaccount.com"
for S in "arca-${ENTORNO}-cert" "arca-${ENTORNO}-key"; do
  gcloud secrets add-iam-policy-binding "$S" --member="serviceAccount:$SA" \
    --role="roles/secretmanager.secretAccessor" --quiet >/dev/null
done
for R in roles/datastore.user roles/cloudbuild.builds.builder roles/logging.logWriter roles/artifactregistry.writer; do
  gcloud projects add-iam-policy-binding "$PROYECTO" --member="serviceAccount:$SA" --role="$R" \
    --condition=None --quiet >/dev/null
done

echo "3/4 Instalando el servidor (tarda unos minutos)..."
gcloud functions deploy arca --gen2 --runtime=nodejs22 --region="$REGION" --source=. \
  --entry-point=arca --trigger-http --allow-unauthenticated \
  --memory=256Mi --timeout=60s --max-instances=2 \
  --set-env-vars="^;^ARCA_ENV=${ENTORNO};PROJECT_ID=${PROYECTO};CONSULTORIO=psiconflor;AUTORIZADOS=${AUT};ORIGENES=${ORIGENES}" \
  --set-secrets="ARCA_CERT=arca-${ENTORNO}-cert:latest,ARCA_KEY=arca-${ENTORNO}-key:latest" \
  --quiet

echo "4/4 Listo."
URL="$(gcloud functions describe arca --gen2 --region="$REGION" --format='value(serviceConfig.uri)')"
echo ""
echo "=================================================="
echo " Servidor instalado en el entorno: $ENTORNO"
echo " Dirección: $URL"
echo "=================================================="
