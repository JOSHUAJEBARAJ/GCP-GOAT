#!/bin/bash
pid=$(gcloud config list --format 'value(core.project)' )  


gcloud config set project $pid 

# Author: Joshua 

name=$1

if [[ -n "$name" ]]; then
echo "Deleting the Service account"
email=$(gcloud iam service-accounts list --filter "$name" | sed -n 2P | awk -F ' '  '{print $2}') 

gcloud iam service-accounts delete $email -q 

gcloud auth revoke $email 

# deleting the bucket
bucketname=$(gsutil ls) 

gsutil rm -r $bucketname 


else
    echo "Enter the Service account-name"
fi
