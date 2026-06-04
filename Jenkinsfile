pipeline {
  agent {
    kubernetes {
      label 'react-app-ci'
      defaultContainer 'git'
      yaml '''
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
'''
    }
  }

  options {
    skipDefaultCheckout(true)
    timestamps()
    timeout(time: 45, unit: 'MINUTES')
  }

  environment {
    IMAGE_NAME = 'adityameshram/react-demo'
    IMAGE_TAG = "${BUILD_NUMBER}"
    GITOPS_REPO = 'https://github.com/meshramaditya/react-app-gitops.git'
    GITOPS_BRANCH = 'main'
    GITOPS_WORKDIR = 'gitops'
  }

  stages {
    stage('Checkout') {
      steps {
        container('git') {
          checkout scm
          sh 'git config --global --add safe.directory "$WORKSPACE" || true'
        }
      }
    }

    stage('Resolve App Path') {
      steps {
        script {
          if (fileExists('Frontend/package.json')) {
            env.APP_PATH = "${WORKSPACE}/Frontend"
          } else if (fileExists('package.json')) {
            env.APP_PATH = "${WORKSPACE}"
          } else {
            error('package.json not found at repo root or Frontend/')
          }
        }
        container('git') {
          sh '''
            set -eu
            mkdir -p "$APP_PATH/public"
            touch "$APP_PATH/public/.gitkeep" || true
          '''
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        container('node') {
          sh '''
            set -eu
            cd "$APP_PATH"
            npm ci --no-audit --no-fund
          '''
        }
      }
    }

    stage('Build & Push Docker Image') {
      steps {
        container('kaniko') {
          withCredentials([
            usernamePassword(
              credentialsId: 'dockerhub-creds',
              usernameVariable: 'DOCKER_USER',
              passwordVariable: 'DOCKER_PASS'
            )
          ]) {
            sh '''
              set -eu
              if [ -f "$APP_PATH/dockerfile" ]; then
                DF=dockerfile
              else
                DF=Dockerfile
              fi

              mkdir -p /kaniko/.docker
              AUTH="$(printf '%s:%s' "$DOCKER_USER" "$DOCKER_PASS" | base64 | tr -d '\\n')"
              cat > /kaniko/.docker/config.json <<EOF
{"auths":{"https://index.docker.io/v1/":{"auth":"${AUTH}"}}}
EOF

              /kaniko/executor \
                --context="dir://${APP_PATH}" \
                --dockerfile="${DF}" \
                --destination="${IMAGE_NAME}:${IMAGE_TAG}" \
                --destination="${IMAGE_NAME}:latest" \
                --snapshot-mode=redo \
                --verbosity=info
            '''
          }
        }
      }
    }

    stage('Clone GitOps Repo') {
      steps {
        container('git') {
          withCredentials([
            usernamePassword(
              credentialsId: 'github',
              usernameVariable: 'GIT_USER',
              passwordVariable: 'GIT_PASS'
            )
          ]) {
            sh '''
              set -eu
              CLONE_URL="${GITOPS_REPO#https://}"
              CLONE_URL="https://${GIT_USER}:${GIT_PASS}@${CLONE_URL}"
              rm -rf "$GITOPS_WORKDIR"
              git clone --depth 1 --branch "$GITOPS_BRANCH" "$CLONE_URL" "$GITOPS_WORKDIR"
              git -C "$GITOPS_WORKDIR" config user.email "adityameshram623@gmail.com"
              git -C "$GITOPS_WORKDIR" config user.name "Aditya Meshram"
              git -C "$GITOPS_WORKDIR" config --global --add safe.directory "$WORKSPACE/$GITOPS_WORKDIR" || true
            '''
          }
        }
      }
    }

    stage('Update Helm Values') {
      steps {
        container('git') {
          sh '''
            set -eu
            VALUES_FILE="$GITOPS_WORKDIR/react-app/values.yaml"
            test -f "$VALUES_FILE"
            sed -i "s|^[[:space:]]*repository:.*|  repository: ${IMAGE_NAME}|" "$VALUES_FILE"
            sed -i "s|^[[:space:]]*tag:.*|  tag: \\"${IMAGE_TAG}\\"|" "$VALUES_FILE"
            grep -A3 '^image:' "$VALUES_FILE" || true
          '''
        }
      }
    }

    stage('Commit & Push') {
      steps {
        container('git') {
          withCredentials([
            usernamePassword(
              credentialsId: 'github',
              usernameVariable: 'GIT_USER',
              passwordVariable: 'GIT_PASS'
            )
          ]) {
            sh '''
              set -eu
              git -C "$GITOPS_WORKDIR" add react-app/values.yaml
              git -C "$GITOPS_WORKDIR" diff --cached --quiet && exit 0
              git -C "$GITOPS_WORKDIR" commit -m "Update image tag to ${IMAGE_TAG}"
              git -C "$GITOPS_WORKDIR" push origin "$GITOPS_BRANCH"
            '''
          }
        }
      }
    }
  }

  post {
    success {
      echo 'CI/CD Pipeline Completed Successfully'
    }
    failure {
      echo 'Pipeline Failed'
    }
  }
}
