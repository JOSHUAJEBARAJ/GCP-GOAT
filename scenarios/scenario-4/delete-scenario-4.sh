#!/bin/bash

pid=$(gcloud config list --format 'value(core.project)' )  


gcloud config set project $pid 

# Author: Joshua Jebaraj 

echo "Deleting the bucket"
pid=$(gcloud config list --format 'value(core.project)' )  


gsutil rm -r gs://$pid/ 

echo "Bucket Deleted Successfully"
