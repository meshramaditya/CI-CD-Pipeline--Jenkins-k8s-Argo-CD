Project Title
# End-to-End GitOps CI/CD Pipeline on AWS EKS using Jenkins, ArgoCD, Docker, Helm & Kubernetes
---------------------------------------------------
# Architecture Diagram
<img width="2816" height="1536" alt="Architecture" src="https://github.com/user-attachments/assets/ef47ba4a-52c2-46d4-939d-18ed567dfd3a" />


Project Objective

This project demonstrates a complete GitOps-based CI/CD pipeline for a React/Next.js application deployed on AWS EKS.

The pipeline automatically:

- Builds the application
- Creates a Docker image
- Pushes the image to DockerHub
- Updates Helm values
- Pushes changes to a GitOps repository
- Triggers ArgoCD synchronization
- Deploys the latest version to Kubernetes

-----------------------------------------------
Technologies Used

## Technologies

- AWS EKS
- Kubernetes
- Jenkins
- ArgoCD
- Helm
- Docker
- DockerHub
- GitHub
- Kaniko
- React / Next.js

---------------------------------------------
Challenges Solved

## Challenges Faced and Solutions

- EBS CSI Driver Issue

  Problem:  Jenkins Persistent Volume Claim remained in Pending state.

  Root Cause: AWS EBS CSI Driver was missing.

  Solution: Installed and configured the AWS EBS CSI Driver with IRSA and OIDC.

- Jenkins Pod Pending

  Problem: Jenkins StatefulSet remained Pending.

  Solution: Configured EBS-backed storage and verified PVC binding.

- ArgoCD Helm Error

  Problem: Application creation failed due to invalid values.yaml.

  Solution: Fixed YAML syntax and Helm chart configuration.

- GitHub 403 Push Error

  Problem: Jenkins could not push changes to the GitOps repository.

  Solution: Configured GitHub PAT with repository permissions.

--------------------------------------------------------
Screenshots Section

## 1. EKS Cluster Creation

<img width="1868" height="850" alt="Screenshot 2026-06-04 170645" src="https://github.com/user-attachments/assets/bae2279a-13dc-4685-96f1-fc22636cda79" />

<img width="1896" height="830" alt="Screenshot 2026-06-04 171849" src="https://github.com/user-attachments/assets/448253ef-fea4-41eb-b498-7808730f6d99" />


## 2. ArgoCD Dashboard

<img width="1852" height="752" alt="Screenshot 2026-06-04 171437" src="https://github.com/user-attachments/assets/8b94512e-dff7-4849-9b8a-31fee9817780" />

<img width="1891" height="943" alt="Screenshot 2026-06-04 172605" src="https://github.com/user-attachments/assets/22dde478-3c11-4c33-804a-a10b6199d426" />


## 3. Successful Jenkins Pipeline

<img width="1878" height="937" alt="Screenshot 2026-06-04 171612" src="https://github.com/user-attachments/assets/b3866690-79b6-4808-9091-b89b68c44dd2" />


## 4. DockerHub Image

<img width="1888" height="857" alt="Screenshot 2026-06-04 171159" src="https://github.com/user-attachments/assets/4cbcebf6-61bc-4f93-96d2-19b21a1a1b51" />


## 5. ArgoCD Sync

<img width="1899" height="996" alt="Screenshot 2026-06-04 170524" src="https://github.com/user-attachments/assets/c696d65e-5fd4-424b-ab79-d9d059140ea6" />


## 6. Application Running on AWS LoadBalancer

<img width="1869" height="792" alt="Screenshot 2026-06-04 175838" src="https://github.com/user-attachments/assets/0163d9b5-e20c-413c-b64f-3890ab3c010e" />


<img width="1898" height="944" alt="Screenshot 2026-06-04 175941" src="https://github.com/user-attachments/assets/9dec3996-fe1d-439b-a382-f4e7cb5ce3de" />

-------------------------------------------------------
Key DevOps Skills Demonstrated

## Skills Demonstrated

- Kubernetes Administration
- AWS EKS Management
- Helm Packaging
- Jenkins CI/CD Pipelines
- GitOps Workflows
- ArgoCD Continuous Delivery
- Docker Image Management
- Container Security
- Kubernetes Storage Management
- Troubleshooting Production Deployments
