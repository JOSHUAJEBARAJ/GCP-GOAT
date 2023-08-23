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