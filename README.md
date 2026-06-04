Project Title
# End-to-End GitOps CI/CD Pipeline on AWS EKS using Jenkins, ArgoCD, Docker, Helm & Kubernetes
---------------------------------------------------
# Architecture Diagram
<img width="2816" height="1536" alt="Architecture" src="https://github.com/user-attachments/assets/ef47ba4a-52c2-46d4-939d-18ed567dfd3a" />
---------------------------------------------------
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

EBS CSI Driver Issue

Problem:
Jenkins Persistent Volume Claim remained in Pending state.

Root Cause:
AWS EBS CSI Driver was missing.

Solution:
Installed and configured the AWS EBS CSI Driver with IRSA and OIDC.

Jenkins Pod Pending

Problem:
Jenkins StatefulSet remained Pending.

Solution:
Configured EBS-backed storage and verified PVC binding.

ArgoCD Helm Error

Problem:
Application creation failed due to invalid values.yaml.

Solution:
Fixed YAML syntax and Helm chart configuration.

GitHub 403 Push Error

Problem:
Jenkins could not push changes to the GitOps repository.

Solution:
Configured GitHub PAT with repository permissions.

--------------------------------------------------------
Screenshots Section

## 1. EKS Cluster Creation


## 2. Jenkins Running on EKS

## 3. ArgoCD Dashboard

## 4. Successful Jenkins Pipeline

## 5. DockerHub Image

## 6. ArgoCD Sync

## 7. Application Running on AWS LoadBalancer

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
