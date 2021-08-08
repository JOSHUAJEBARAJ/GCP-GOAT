#!/bin/bash

# Author: Joshua Jebaraj 

pid=$(gcloud config list --format 'value(core.project)' )  


gcloud config set project $pid 

# deleting firewall
echo "Deleting Cluster Firewall rule"

gcloud compute firewall-rules delete test-node-port -q  

# deleting cluster

echo "Deleting Cluster"

gcloud container clusters delete test-cluster  --zone "asia-east1-a" -q 
