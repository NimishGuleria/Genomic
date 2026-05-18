pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/NimishGuleria/Genomic.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t genomic .'
            }
        }

        stage('Deploy Container') {
            steps {
                bat '''
                docker rm -f genomic-container || exit 0
                docker run -d -p 8081:80 --name genomic-container genomic
                '''
            }
        }
    }
}