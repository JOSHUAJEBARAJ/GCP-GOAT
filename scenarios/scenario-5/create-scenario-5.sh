#!/bin/bash

# Author: Joshua Jebaraj 
pid=$(gcloud config list --format 'value(core.project)' )  


gcloud config set project $pid 

# Setting up project
pid=$(gcloud config list --format 'value(core.project)' )  


gcloud config set project $pid 



echo "Uploading  container to the repository"
# creating task for next scenario
docker pull joshuajebaraj/secret:v1 

docker tag joshuajebaraj/secret:v1  gcr.io/$pid/secret:v1  

docker push gcr.io/$pid/secret:v1  

# removing the image
docker rmi gcr.io/$pid/secret:v1  
