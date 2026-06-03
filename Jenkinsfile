pipeline {
    agent any

    environment {
        IMAGE = "adityameshram/react-demo"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/meshramaditya/CI-CD-Pipeline--Jenkins-k8s-Argo-CD'
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build Docker') {
            steps {
                sh 'docker build -t $IMAGE:$IMAGE_TAG .'
            }
        }

        stage('Push Docker') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $IMAGE:$IMAGE_TAG
                        docker logout || true
                    '''
                }
            }
        }

        stage('Update Helm') {
            steps {
                sh '''
                    VALUES_PATH=gitops/react-app/values.yaml
                    if [ -f "$VALUES_PATH" ]; then
                        sed -i 's/^ *tag:.*/tag: "'"$IMAGE_TAG"'"/' "$VALUES_PATH" || true
                    else
                        mkdir -p "$(dirname "$VALUES_PATH")"
                        cat > "$VALUES_PATH" <<EOF
image:
    repository: $IMAGE
    tag: "$IMAGE_TAG"
EOF
                    fi

                    # Commit and push the updated values file back to the repo (optional)
                    git config user.email "ci@example.com" || true
                    git config user.name "jenkins-ci" || true
                    git add "$VALUES_PATH" || true
                    git commit -m "ci: update image tag to $IMAGE_TAG" || true
                    git push origin HEAD:main || true
                '''
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
    }
}