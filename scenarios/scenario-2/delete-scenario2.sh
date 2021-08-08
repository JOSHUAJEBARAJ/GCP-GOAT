#!/bin/bash

# Author: Joshua Jebaraj 

pid=$(gcloud config list --format 'value(core.project)' ) 


gcloud config set project $pid 

name=$1

if [[ -n "$name" ]]; then 

echo "Deleting the sql instance"

gcloud sql instances delete $name -q 

else
    echo "Enter the Sql-instance Name"
fi
