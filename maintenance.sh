#!/bin/bash

# Function to display usage
usage() {
    echo "Usage: $0 [start|stop|restart|status|logs|update]"
    exit 1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root"
    exit 1
fi

case "$1" in
    start)
        systemctl start shift-booking
        echo "Service started"
        ;;
    stop)
        systemctl stop shift-booking
        echo "Service stopped"
        ;;
    restart)
        systemctl restart shift-booking
        echo "Service restarted"
        ;;
    status)
        systemctl status shift-booking
        ;;
    logs)
        journalctl -u shift-booking -f
        ;;
    update)
        # Update the application
        cd /home/ubuntu/app-react
        git pull
        source venv/bin/activate
        pip install -r requirements.txt
        npm install
        npm run build
        systemctl restart shift-booking
        echo "Application updated and restarted"
        ;;
    *)
        usage
        ;;
esac 