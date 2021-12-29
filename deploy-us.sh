#!/bin/bash
# export CLOUDSDK_PYTHON_SITEPACKAGES=1
git reset --hard

gcloud beta builds submit --config cloudbuild-us.yaml .
gcloud container clusters get-credentials gke-us-cluster --zone us-central1 --project group4-3m4
gcloud auth configure-docker us-docker.pkg.dev --quiet


webSHA=`gcloud beta artifacts docker images list us-docker.pkg.dev/group4-3m4/dronegaga-artifact-registry/player-sql --limit=1 --sort-by=~CREATE_TIME | grep -w sha256 | cut -d ':' -f 2`
webSHA=${webSHA:0:64}

echo $webSHA
sed -i.bak "s/\bDIGEST\b/$webSHA/g" deploy-us.yaml 

#gcloud auth configure-docker asia-docker.pkg.dev --quiet
#docker pull us-docker.pkg.dev/group4-3m4/dronegaga-artifact-registry/web@sha256:$webSHA

#kubectl set image deployments/zone-ingress -n zoneprinter frontend=us-docker.pkg.dev/group4-3m4/dronegaga-artifact-registry/web@sha256:$webSHA
kubectl apply -f deploy-us.yaml 
kubectl rollout restart deployment player-sql-deployment -n player-sql