pipeline {
  agent {
    kubernetes {
      label 'react-app-ci'
      defaultContainer 'git'
      yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: git
      image: alpine/git:2.45.2
      command: ['cat']
      tty: true
    - name: node
      image: node:18-bullseye-slim
      command: ['cat']
      tty: true
    - name: kaniko
      image: gcr.io/kaniko-project/executor:v1.23.2-debug
      command: ['cat']
      tty: true
"""
    }
  }

  environment {
    IMAGE = 'adityameshram/react-demo'
    IMAGE_TAG = "${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git config --global --add safe.directory "$WORKSPACE" || true'
      }
    }

    stage('Test Kaniko') {
      steps {
        container('kaniko') {
          sh 'ls -la /kaniko'
        }
      }
    }

    stage('Install') {
      steps {
        dir('Frontend') {
          container('node') {
            sh 'npm ci'
          }
        }
      }
    }

    stage('Build Image') {
      steps {
        container('kaniko') {
          withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            sh '''
              mkdir -p /kaniko/.docker
              test -f "$WORKSPACE/Frontend/dockerfile"
              test -f "$WORKSPACE/Frontend/package.json"
              test -f "$WORKSPACE/Frontend/package-lock.json"
              AUTH="$(printf '%s:%s' "$DOCKER_USER" "$DOCKER_PASS" | base64 | tr -d '\n')"
              cat > /kaniko/.docker/config.json <<EOF
{"auths":{"https://index.docker.io/v1/":{"auth":"$AUTH"}}}
EOF
              /kaniko/executor \
                --context=dir://$WORKSPACE/Frontend \
                --dockerfile=dockerfile \
                --destination=$IMAGE:$IMAGE_TAG \
                --destination=$IMAGE:latest
            '''
          }
        }
      }
    }

    stage('Clone GitOps Repo') {
      steps {
        container('git') {
          withCredentials([usernamePassword(credentialsId: 'github', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
            sh '''
              rm -rf gitops
              git clone https://$GIT_USER:$GIT_PASS@github.com/meshramaditya/react-app-gitops.git gitops
            '''
          }
        }
      }
    }

    stage('Update Helm') {
      steps {
        container('git') {
          withCredentials([usernamePassword(credentialsId: 'github', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
            sh '''
              VALUES_REL="react-app/values.yaml"
              VALUES_PATH="$WORKSPACE/gitops/$VALUES_REL"

              if [ -f "$VALUES_PATH" ]; then
                if grep -q '^ *tag:' "$VALUES_PATH"; then
                  sed -i 's/^ *tag:.*/tag: "'"$IMAGE_TAG"'"/' "$VALUES_PATH"
                else
                  printf '\nimage:\n  repository: %s\n  tag: "%s"\n' "$IMAGE" "$IMAGE_TAG" >> "$VALUES_PATH"
                fi
              else
                mkdir -p "$(dirname "$VALUES_PATH")"
                cat > "$VALUES_PATH" <<EOF
image:
  repository: $IMAGE
  tag: "$IMAGE_TAG"
EOF
              fi

              git -C "$WORKSPACE/gitops" config user.email 'ci@example.com'
              git -C "$WORKSPACE/gitops" config user.name 'jenkins-ci'
              git -C "$WORKSPACE/gitops" remote set-url origin https://$GIT_USER:$GIT_PASS@github.com/meshramaditya/react-app-gitops.git
              git -C "$WORKSPACE/gitops" add "$VALUES_REL"
              git -C "$WORKSPACE/gitops" commit -m "ci: update image tag to $IMAGE_TAG" || true
              git -C "$WORKSPACE/gitops" push origin HEAD:main
            '''
          }
        }
      }
    }
  }

  post {
    always {
      container('git') {
        sh 'git config --global --add safe.directory "$WORKSPACE" || true'
        sh 'git status --short || true'
      }
    }
  }
}
