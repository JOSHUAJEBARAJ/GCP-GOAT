## Attacking Google App Engine  

> Note please execute this scenario as the last scenario because it requires you to delete the project in order to clean up the resources


In order to start the scenario go to the `scenario-5` folder by typing the below command in the `GCLOUD Shell`

First export the project id using the below command 

```bash
export PROJECT_ID="project-id"
```

Next configure the `gcloud` to use the project by typing the below command

```bash
gcloud config set project $PROJECT_ID
```

Next enable the `App Engine` API by typing the below command

```bash
gcloud services enable appengine.googleapis.com
```

Next deploy the `App Engine` by typing the below command

```bash
gcloud app deploy
```

> Select the region you want to deploy and press `Y` to continue

Once it is done you can find the application url by typing the below command

```bash
gcloud app browse
```



## Scenario Info


According to the [Wikipedia](https://en.wikipedia.org/wiki/Google_App_Engine)

**Google App Engine (often referred to as GAE or simply App Engine) is a Platform as a Service and cloud computing platform for developing and hosting web applications in Google-managed data centers. Applications are sandboxed and run across multiple servers. App Engine offers automatic scaling for web applications—as the number of requests increases for an application, App Engine automatically allocates more resources for the web application to handle the additional demand.**


By default the `App Engine` is deployed with the `default` app engine service account which has the `Editor` role in the project






In this scenario we are going to exploit the `SSRF` vulnerability in the deployed application and use the `Metadata Server` to get the service account token




### Solution

First Let's try to access the `Metadata endpoint` that gives you the information about the project id by typing the below payload in the `URL` field

```bash
http://metadata.google.internal/computeMetadata/v1/project/project-id
```
Under the `Headers` section add the below header

```bash
Metadata-Flavor: Google
```

And click on `CHECK STATUS` button and you can find the project id in the response

Next try to access the `Metadata endpoint` that gives you the information about the service account token by typing the below payload in the `URL` field

```bash
http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token
```

You can find the `access_token` in the response and you can use this token to perform the privilege escalation in the project


> Note In recent version Compute Engine SSRF is only possible if you able to pass the `headers` as `Metadata-Flavor: Google` 


### Clean up

According to the google , there is no way to delete the `App Engine` service account so you have to delete the project in order to clean up the resources

So we recommend you to delete the project after completing the scenario




## References

1. In order to learn more about `SSRF` in Google Cloud I highly recommend to check out [Tutorial on privilege escalation and post exploitation tactics in Google Cloud Platform environments](https://about.gitlab.com/blog/2020/02/12/plundering-gcp-escalating-privileges-in-google-cloud-platform/)  by [Chris Moberly](https://about.gitlab.com/company/team/#init_string)

2. More details about the meta-data endpoint [link](https://hackingthe.cloud/gcp/general-knowledge/metadata_in_google_cloud_instances/)


