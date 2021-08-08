#!/bin/bash
# Author: Joshua Jebaraj 

# Deleting the instance

pid=$(gcloud config list --format 'value(core.project)' )  


gcloud config set project $pid 

echo "Deleting the Compute instance"

gcloud compute instances delete test --zone=asia-east1-a -q  

# deleting firewall

echo "Deleting the Compute Firewall"

gcloud compute firewall-rules delete http2 -q  

gsutil rm -r gs://$pid-credit-card/ 
