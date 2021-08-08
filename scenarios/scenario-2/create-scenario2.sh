#!/bin/bash

# Author: Joshua Jebaraj 


pid=$(gcloud config list --format 'value(core.project)' ) > /dev/null 2>&1 


gcloud config set project $pid > /dev/null 2>&1


name=$1

if [[ -n "$name" ]]; then 


echo "creating the sql instance"

gcloud sql instances create $name --database-version=MYSQL_5_7 --tier=db-f1-micro  --zone=asia-east1-a  --authorized-networks=0.0.0.0/0 

ip=$(gcloud sql instances describe $name | grep "ipAddress" | sed -n 2P | awk -F ':' '{print $2}')

echo The ipAddress of the sql instance is $ip
else
    echo "Enter the Sql-instance Name"
fi
