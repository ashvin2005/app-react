#!/bin/bash

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install required packages
sudo apt-get install -y python3-pip python3-venv nodejs npm nginx

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies and build frontend
npm install
npm run build

# Copy service file to systemd directory
sudo cp shift-booking.service /etc/systemd/system/

# Reload systemd to recognize new service
sudo systemctl daemon-reload

# Enable and start the service
sudo systemctl enable shift-booking
sudo systemctl start shift-booking

# Configure Nginx
sudo tee /etc/nginx/sites-available/shift-booking << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable Nginx configuration
sudo ln -s /etc/nginx/sites-available/shift-booking /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable firewall
sudo ufw allow 80
sudo ufw allow 22
sudo ufw --force enable

echo "Setup completed successfully!"
echo "The application is now running in the background"
echo "You can check the status with: sudo systemctl status shift-booking" 