## Getting Started

This tutorial assumes that you have Google Cloud Account with Billing Enabled in order to create the resources need for the Setup

If you have don't have the Google Cloud Account Create one by following the given link [Get Started with Google Cloud Platform](https://console.cloud.google.com/getting-started)


Go to the [Google-Console](https://console.cloud.google.com)

Create the new Project by Clicking Select Project

![setup-1](images/setup-1.png)

Create the new Project by Clicking New Project 

![setup-2](images/setup-2.png)

Enter a Valid name and click Create

> Please note the project ID for future reference
Once it is done click on the below link to clone the repository

[Clone the Repository](https://ssh.cloud.google.com/cloudshell/open?cloudshell_git_repo=https://github.com/JOSHUAJEBARAJ/GCP-GOAT)


Tick the `Trust Project` and click on `CONFIRM` , It will take few seconds to clone the repository and open the cloud shell


Next export the project id using the below command

```bash
export PROJECT_ID="project-id"
```

## Configuring the CLI 

- Once its is Go to the IAM Section by clicking the the [link](https://console.cloud.google.com/iam-admin/iam?project=) and click on the service account

- Next click on the `+CREATE SERVICE ACCOUNT` button and Enter `GCP GOAT` as the service account name and click on `CREATE AND CONTINUE`

- Next Select the `Owner` as the role and click on `DONE`

> Note in the real world its not recommended to use the owner role for the service account but for the ease of demonstration we are using the owner role

- Now select the Keys options and click on the `ADD KEY` and select `create new key` and select type as JSON 

> Note : The JSON file contains the sensitive information so make sure to keep it safe 
- Next copy the data and save it in a file named `credentials.json` in the root directory of the cloned repository

- Next configure the gcloud cli using the below command

```bash
gcloud auth activate-service-account --key-file /filepatth/credentials.json
```

> Make sure to replace the filepath with the actual path of the credentials.json file
Next configure the project id using the below command

```bash
gcloud config set project $PROJECT_ID
```

Next enable the necessary services using the below command

```bash
gcloud services enable cloudresourcemanager.googleapis.com
```

```bash
gcloud services enable iam.googleapis.com
```

```bash
gcloud services enable compute.googleapis.com
```


Once it is done navigate into the scenarios directory by executing the below command

```bash
cd scenarios
```