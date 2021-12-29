#!/bin/bash
# export CLOUDSDK_PYTHON_SITEPACKAGES=1
git reset --hard

gcloud beta builds submit --config cloudbuild-asia.yaml .
gcloud container clusters get-credentials gke-asia-cluster --zone asia-southeast1 --project group4-3m4
gcloud auth configure-docker asia-docker.pkg.dev --quiet


webSHA=`gcloud beta artifacts docker images list asia-docker.pkg.dev/group4-3m4/dronegaga-artifact-registry/player-sql --limit=1 --sort-by=~CREATE_TIME | grep -w sha256 | cut -d ':' -f 2`
webSHA=${webSHA:0:64}

echo $webSHA
sed -i.bak "s/\bDIGEST\b/$webSHA/g" deploy-asia.yaml 

#gcloud auth configure-docker asia-docker.pkg.dev --quiet
#docker pull asia-docker.pkg.dev/group4-3m4/dronegaga-artifact-registry/web@sha256:$webSHA

#kubectl set image deployments/zone-ingress -n zoneprinter frontend=asia-docker.pkg.dev/group4-3m4/dronegaga-artifact-registry/web@sha256:$webSHA
kubectl apply -f deploy-asia.yaml 
kubectl rollout restart deployment player-sql-deployment -n player-sql