## Attacking Artifact Registry

In order to start the scenario go to the `scenario-3` folder by typing the below  command in the shell

``` bash
cd scenario-3
```

Export the project ID by typing the below command in the `GCLOUD Shell`

``` bash
export PROJECT_ID="project-id"
```

> replace the `project-id` with your project ID

Next configure the `gcloud` to use the project by typing the below command in the shell 

``` bash
gcloud config set project $PROJECT_ID
```

Next enable the `Artifact Registry` api by typing the below command in the shell 

``` bash
gcloud services enable artifactregistry.googleapis.com
```



Next initialize the terraform by typing the below command in the shell 


``` bash
terraform init
```

Next apply the terraform by typing the below command in the shell 

``` bash
terraform apply -auto-approve -var project-id=$PROJECT_ID
```


Next output the service account key by typing the below command in the shell 

``` bash
terraform output -raw sa-key > creds.json
```

Next login into the `artifact registry` by typing the below command in the shell 

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

Next build and push the image using the below command 
```bash
docker build -t us-central1-docker.pkg.dev/$PROJECT_ID/gcp-goat/secret:latest .
```

```bash
docker push us-central1-docker.pkg.dev/$PROJECT_ID/gcp-goat/secret:latest
```


## Scenario info 

According to the google docs 

> Artifact Registry provides a single location for managing private packages and Docker container images.


Even though the `Artifact Registry` is private by default, sometimes users make the `Artifact Registry` public in order to use the packages and docker images in the external application, this leads to the leakage of sensitive information

In this scenario, we are going to see download the docker image from the `Artifact Registry` and extract the sensitive information from the docker image


## Solution

> Note: This scenario assumes that we have somehow able to find the project name and repo name

On your local machine , try to pull the docker image by typing the below command in the shell 

```bash
export PROJECT_ID="project-id"
```

```bash
docker pull us-central1-docker.pkg.dev/$PROJECT_ID/gcp-goat/secret:latest
```

Once the image is pulled, try to extract the sensitive information from the image by typing the below command in the shell 

```bash
docker run --rm -it us-central1-docker.pkg.dev/$PROJECT_ID/gcp-goat/secret:latest sh
```

Next try to list the files in the `/` directory by typing the below command in the shell 

```bash
ls 
```

On executing the above command you will find the file called `creds.json` which contains the service account key

Now using the service account key we can access the `GCP` resources

> Note for security reasons , the service account does not have any permission to access the resources, but in the real world, the service account will have the permission to access the resources


## Clean up 


In order to clean up the infrastructure, type the below command in the shell 

```bash
terraform destroy -auto-approve -var project-id=$PROJECT_ID
```
