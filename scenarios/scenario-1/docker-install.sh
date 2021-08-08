#!/bin/bash

printf 'Waiting for Docker to start...\n\n'

sleep 10
sudo docker run --name app -p 80:80 -d joshuajebaraj/vulnerable-app:v1