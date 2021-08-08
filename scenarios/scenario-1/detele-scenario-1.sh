#!/bin/bash
# Author: Joshua Jebaraj 

# Deleting the instance
pid=$(gcloud config list --format 'value(core.project)' ) > /dev/null 2>&1 


gcloud config set project $pid > /dev/null 2>&1

echo "Deleting the Compute instance"

gcloud compute instances delete test --zone=asia-east1-a -q > /dev/null 2>&1 

# deleting firewall

echo "Deleting the Compute Firewall"

gcloud compute firewall-rules delete http2 -q > /dev/null 2>&1 
