pipeline {
  agent {
    kubernetes {
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

  options {
    skipDefaultCheckout(true)
  }

  environment {
    IMAGE = 'adityameshram/react-demo'
    IMAGE_TAG = "${BUILD_NUMBER}"
    APP_DIR = ''
    GITOPS_DIR = 'gitops-repo'
    GITOPS_VALUES_REL = 'react-app/values.yaml'
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
        container('git') {
          script {
            env.APP_DIR = sh(
              script: '''
                if [ -f "$WORKSPACE/Frontend/package.json" ]; then
                  echo Frontend
                elif [ -f "$WORKSPACE/package.json" ]; then
                  echo .
                else
                  echo "ERROR: package.json not found in Frontend/ or repo root" >&2
                  exit 1
                fi
              ''',
              returnStdout: true
            ).trim()
          }
        }
      }
    }

    stage('Debug Workspace') {
      steps {
        container('git') {
          sh '''
            echo "WORKSPACE=$WORKSPACE"
            echo "APP_DIR=$APP_DIR"
            pwd
            ls -la
            ls -la "$WORKSPACE/$APP_DIR"
            find "$WORKSPACE" -maxdepth 3 -iname 'dockerfile' -o -name 'package.json' | sort
          '''
        }
      }
    }

    stage('Install') {
      steps {
        container('node') {
          dir("${env.APP_DIR}") {
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
              set -eu

              APP_PATH="$WORKSPACE/$APP_DIR"
              if [ "$APP_DIR" = "." ]; then
                APP_PATH="$WORKSPACE"
              fi

              if [ -f "$APP_PATH/dockerfile" ]; then
                DOCKERFILE_NAME='dockerfile'
              elif [ -f "$APP_PATH/Dockerfile" ]; then
                DOCKERFILE_NAME='Dockerfile'
              else
                echo "ERROR: dockerfile/Dockerfile not found in $APP_PATH" >&2
                ls -la "$APP_PATH"
                exit 1
              fi

              test -f "$APP_PATH/package.json"
              test -f "$APP_PATH/package-lock.json"

              mkdir -p /kaniko/.docker
              AUTH="$(printf '%s:%s' "$DOCKER_USER" "$DOCKER_PASS" | base64 | tr -d '\n')"
              cat > /kaniko/.docker/config.json <<EOF
{"auths":{"https://index.docker.io/v1/":{"auth":"$AUTH"}}}
EOF

              /kaniko/executor \
                --context="dir://$APP_PATH" \
                --dockerfile="$DOCKERFILE_NAME" \
                --destination="$IMAGE:$IMAGE_TAG" \
                --destination="$IMAGE:latest"
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
              rm -rf "$GITOPS_DIR"
              git clone "https://$GIT_USER:$GIT_PASS@github.com/meshramaditya/react-app-gitops.git" "$GITOPS_DIR"
              git -C "$GITOPS_DIR" config user.email 'ci@example.com'
              git -C "$GITOPS_DIR" config user.name 'jenkins-ci'
              git -C "$GITOPS_DIR" config --global --add safe.directory "$WORKSPACE/$GITOPS_DIR" || true
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
              VALUES_PATH="$WORKSPACE/$GITOPS_DIR/$GITOPS_VALUES_REL"

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

              git -C "$GITOPS_DIR" add "$GITOPS_VALUES_REL"
              git -C "$GITOPS_DIR" commit -m "ci: update image tag to $IMAGE_TAG" || true
              git -C "$GITOPS_DIR" push origin HEAD:main
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
