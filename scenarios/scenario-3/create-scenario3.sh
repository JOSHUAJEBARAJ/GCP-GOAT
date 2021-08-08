
#!/bin/bash

# Author: Joshua Jebaraj 

# creating cluster

pid=$(gcloud config list --format 'value(core.project)' ) 


gcloud config set project $pid > /dev/null 2>&1

echo "Creating Cluster"

gcloud container clusters create test-cluster --subnetwork default  --machine-type "n1-standard-1" --image-type "UBUNTU" --zone "asia-east1-a" 

# adding credentials to the kubectl

gcloud container clusters get-credentials   test-cluster --zone "asia-east1-a" 



echo "Creating firewall rules"

# creating Firewall rules
gcloud compute firewall-rules create test-node-port --allow tcp:30003 

# creating app

echo "Deploying  Application"
kubectl apply -f mongo.yml

