# Setting up project
pid=$(gcloud config list --format 'value(core.project)' )  


gcloud config set project $pid 

# creating instance

echo "Creating Compute instances"
gcloud compute instances create test --machine-type=f1-micro --zone=asia-east1-a --image-family ubuntu-1804-lts   --image-project ubuntu-os-cloud   


 
# creating firewall


echo "Creating firewall"
 gcloud compute firewall-rules create http2 --description="Incoming http allowed." \
     --allow tcp:80  

# getting ip

ip=$(gcloud compute instances  list | sed -n 2p | awk -F ' ' '{print $5}')

echo The application can accessed at $ip


## Creating bucket 

gsutil mb gs://$pid-credit-card/ 

