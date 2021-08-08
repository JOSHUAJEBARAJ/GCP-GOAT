#!/bin/bash
# Author: Joshua Jebaraj 

pid=$(gcloud config list --format 'value(core.project)' )  


gcloud config set project $pid 

name=$1

if [[ -n "$name" ]]; then 
# Setting up project
pid=$(gcloud config list --format 'value(core.project)' )  


gcloud config set project $pid 

# creating bucket


echo "Creating Bucket"

gsutil mb gs://$pid/ 


echo "Creating Service Account"

# Creating task for next scenario

gcloud iam service-accounts create $name --display-name="$name"  


email=$name@$pid.iam.gserviceaccount.com  



# creating key 
gcloud iam service-accounts keys create ./service-key.json --iam-account $email  

# adding the roles
gcloud projects add-iam-policy-binding $pid --role roles/storage.admin --member serviceAccount:$email 

echo "Copying the contents to the Bucket"
# copying the file to the bucket
gsutil cp service-key.json gs://$pid/ 

# making the bucket publicly accessible

gsutil iam ch allUsers:objectViewer gs://$pid/ 

echo Now go to the below url https://storage.googleapis.com/$pid/

rm service-key.json

else
    echo "Enter the Service account-name"
fi
