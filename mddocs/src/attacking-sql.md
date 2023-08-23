##  Attacking SQL Instance

In order to start the scenario go to the `scenario-2` folder by typing the below  command in the shell

``` bash
cd scenario-2
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

Next enable the `Cloud SQL Admin API` by typing the below command in the shell 

``` bash
gcloud services enable sqladmin.googleapis.com
```


Next initialize the terraform by typing the below command in the shell 


``` bash
terraform init
```

Next apply the terraform by typing the below command in the shell 

``` bash
terraform apply -auto-approve -var project-id=$PROJECT_ID
```

> Note This will take some time to create the resources be patient 🧘 

Once it is done note the ip-address of the `SQL Instance` from the terraform output

### Scenario info

Google SQL allows developers to set up the database without any hassle by default the database can be accessed only within the authorized network but during debugging the database sometimes the user may open the database to the public for easy debugging In this Scenario the attacker gets to know to about the public-facing SQL Instance

### Solution 

First we are going to perform some `reconnaissance` on the `Instance` using nmap, in order to do that we need to first install `nmap` in the `GCLOUD Shell` by typing the below command in the shell

``` bash
sudo apt-get install nmap -y
```

Next run the nmap scan by typing the below command in the shell

``` bash
nmap -Pn <SQL INSTANCE IP>
```


Running `Nmap` Scan on the IP reveals that `MySQL` service  was running on the given instance



```
mysql -u root -h <ip>
```

> Note This scenario assumes there was no authentication for the  database , but in real world may  find some weak credentials 

Enter `\q` to exit the database

### Clean up

To clean up the `Scenario` type the below  command in the `GCLOUD Shell`

``` bash
terraform destroy -auto-approve -var project-id=$PROJECT_ID
```