## Attacking Google Cloud Storage

In order to start the scenario go to the `scenario-1` folder by typing the below command in the `GCLOUD Shell`

``` bash
cd scenario-1
```

Go into the [canary-token](https://canarytokens.org/generate#) and generate the dummy aws creds and copy the value 

Now move into the `juice-shop` folder and create the new file called `aws-creds.txt` and paste the copied value in the file 

``` bash
cd juice-shop
```

Once it is done move back into the `scenario-1` folder and zip the `juice-shop` folder by typing the below command in the `GCLOUD Shell`

```bash
cd ..
```
``` bash
zip -r juice-shop.zip juice-shop/
```
Export the `PROJECT_ID` variable by typing the below command in the `GCLOUD Shell`

``` bash
export PROJECT_ID="project-id"
```

Now deploy the infrastructure by typing the below command in the `GCLOUD Shell`

``` bash
terraform init
```

```bash
terraform apply -auto-approve -var project-id=$PROJECT_ID -var unique-name=<BUCKET_NAME>
```

> Note the `BUCKET_NAME` should be unique, if you get the error while deploying the infrastructure change the `BUCKET_NAME` and try again


### Scenario info

Public-Facing Google Bucket is the most common vulnerability in the `GCP` environment Users often create the bucket with public access in order to use the data stored in the bucket to be used by external application ,Sometimes this leads leakage of sensitive information

In this scenario we are going to see how to find the public bucket using the TBD name and how to access the data stored in the bucket 


### Solution 
In order to find the public bucket we are going to use the tool called [gcp-enum](https://github.com/JOSHUAJEBARAJ/gcp-enum)


Install the `gcp-enum` by typing the below command in the `GCLOUD Shell`

``` bash
git clone https://github.com/JOSHUAJEBARAJ/gcp-enum
```

Next navigate to the `gcp-enum` folder by typing the below command in the `GCLOUD Shell`

``` bash
cd gcp-enum
```

Now run the `gcp-enum` by typing the below command in the `GCLOUD Shell`

``` bash
go run main.go -k <unique-name> -file short-wordlist -c 10
```

> Replace the `<unique-name>` with the bucket name which you have used while deploying the infrastructure

You will see one valid bucket name in the output which end with `-backup`



> Note if you find the other bucket name with other than `-backup` , please ignore it and don't try to access it as it may belong to other users and it may lead to legal issues

Now try to access the bucket by typing the below url in the browser

``` bash
http://<unique-name>-backup.storage.googleapis.com/
```

For example if the bucket name is `gcp-goat-123` then the url will be 

``` bash
http://gcp-goat-123-backup.storage.googleapis.com/
```


Now on acessing the url you will find the `juice-shop.zip` file

Let's download the file by typing the below command in the `GCLOUD Shell`

``` bash
wget http://<unique-name>-backup.storage.googleapis.com/juice-shop.zip
```

Next unzip the file by typing the below command in the `GCLOUD Shell`

``` bash
unzip juice-shop.zip
```

Now move into the `juice-shop` folder by typing the below command in the `GCLOUD Shell`

``` bash
cd juice-shop
```

Now you will find the `aws-creds.txt` file in the folder

### Clean up

To clean up the `Scenario` type the below command in the `GCLOUD Shell`

``` bash
cd scenario-1
```

```bash
terraform destroy -auto-approve -var project-id=$PROJECT_ID -var unique-name=<unique-name> 
```

Move into the previous folder by typing the below command in the `GCLOUD Shell`

``` bash
cd ..
```