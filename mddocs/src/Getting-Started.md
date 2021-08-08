## Getting Started

This tutorial assumes that you have Google Cloud Account with Billing Enabled in order to create the resources need for the Setup

If you have don't have the Google Cloud Account Create one by following the given link [Get Started with Google Cloud Platform](https://console.cloud.google.com/getting-started)


Go to the [Google-Console](https://console.cloud.google.com)

Create the new Project by Clicking Select Project

![setup-1](images/setup-1.png)

Create the new Project by Clicking New Project 

![setup-2](images/setup-2.png)

Enter a Valid name and click Create

Go to the [API Dashboard](https://console.cloud.google.com/apis)

Click on the `ENABLE API AND SERVICES`

![setup-3](images/setup-3.png)


Search for `Compute Engine API` and click Enable


![setup-4](images/setup-4.png)

Repeat the Same for the `Kubernetes Engine API` and for the `Cloud SQL Admin API`

Once you have done Go to the GCloud Shell by clicking the `terminal` icon in top right corner


![setup-5](images/setup-5.png)

Once you are inside the `Shell`  make sure the shell points to the current project 

![](./images/2021-08-07-23-36-35.png)

clone the repository by  typing the following command in the `GCLOUD SHELL`

``` bash
git clone https://github.com/JOSHUAJEBARAJ/GCP-Goat.git
```


Move into the `Scenarios` folder by typing the following command in the `GCLOUD SHELL`

``` bash
cd GCP-Goat/scenarios/
```

