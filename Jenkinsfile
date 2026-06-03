pipeline {
    agent any
    environment {
        IMAGE = "adityameshram/react-demo"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/meshramaditya/CI-CD-Pipeline--Jenkins-k8s-Argo-CD'
            }
        }

        stage('Build Docker') {
            steps {
                sh 'docker build -t $IMAGE:$BUILD_NUMBER .'
            }
        }

        stage('Push Docker') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'adityameshram',
                    passwordVariable: 'Aditya@2003'
                )]) {

                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin

                    docker push $IMAGE_NAME:$IMAGE_TAG
                    '''
                }
        }

        stage('Update Helm') {
            steps {
                sh '''
                if [ -f values.yaml ]; then
                    sed -i "s/^tag:.*/tag: $BUILD_NUMBER/" values.yaml || true
                else
                    echo "image:" > values.yaml
                    echo "  repository: $IMAGE" >> values.yaml
                    echo "  tag: $BUILD_NUMBER" >> values.yaml
                fi
                    IMAGE = "adityameshram/react-demo"
            }
        }
    }
}