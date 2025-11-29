pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.prod.yml'
        DB_PASSWORD = credentials('DB_PASSWORD')
        REDIS_PASSWORD = credentials('REDIS_PASSWORD')
        DB_HOST = credentials('DB_HOST')
        REDIS_ADDR = credentials('REDIS_ADDR')
        // Default values for non-sensitive data
        DB_USER = 'postgres'
        DB_NAME = 'postgres'
        DB_PORT = '5432'
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building Docker images...'
                sh "docker-compose -f ${DOCKER_COMPOSE_FILE} build"
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                // Add your test commands here, e.g.:
                // sh "docker-compose -f ${DOCKER_COMPOSE_FILE} run backend go test ./..."
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying to production...'
                // Stop old containers and start new ones
                sh "docker-compose -f ${DOCKER_COMPOSE_FILE} up -d"

                // Prune old images to save space
                sh "docker system prune -f"
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
