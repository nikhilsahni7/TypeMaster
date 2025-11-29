#!/bin/bash

# Exit on error
set -e

echo "Updating system..."
sudo apt-get update && sudo apt-get upgrade -y

echo "Installing Docker..."
# Add Docker's official GPG key:
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Starting Jenkins..."
# Create Jenkins home directory
sudo mkdir -p /var/jenkins_home
sudo chown -R 1000:1000 /var/jenkins_home

# Stop and remove existing container if it exists to update mounts
sudo docker stop jenkins || true
sudo docker rm jenkins || true

# Run Jenkins with Docker Socket and Plugins mounted
sudo docker run -d \
  --name jenkins \
  --restart always \
  -u root \
  -p 8080:8080 \
  -p 50000:50000 \
  -v /var/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(which docker):/usr/bin/docker \
  -v /usr/libexec/docker/cli-plugins:/usr/libexec/docker/cli-plugins \
  jenkins/jenkins:lts

echo "Jenkins is starting! It may take a minute."
echo "To get the initial admin password, run:"
echo "sudo docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
