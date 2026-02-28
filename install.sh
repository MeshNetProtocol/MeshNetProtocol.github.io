#!/bin/bash

# ==============================================================================
# OpenMesh Sing-Box Auto Installer (CentOS/Ubuntu/Debian Compatible)
# ==============================================================================

# --- Color Constants for UE ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
CONFIG_PATH="/usr/local/etc/sing-box/config.json"

if [ "$1" = "--show" ] || [ "$1" = "show" ] || [ "$1" = "--info" ] || [ "$1" = "info" ]; then
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}    🚀 OpenMesh Node Automated Installer        ${NC}"
    echo -e "${BLUE}================================================${NC}"
    if [ ! -f "$CONFIG_PATH" ]; then
        echo -e "${RED}[ERROR] Config not found at ${CONFIG_PATH}${NC}"
        exit 1
    fi
    PORT=$(grep -o '"listen_port":[[:space:]]*[0-9]*' "$CONFIG_PATH" | head -n 1 | tr -cd '0-9')
    PASSWORD=$(grep -o '"password":[[:space:]]*"[^"]*"' "$CONFIG_PATH" | head -n 1 | sed 's/.*"password":[[:space:]]*"\([^"]*\)".*/\1/')
    METHOD=$(grep -o '"method":[[:space:]]*"[^"]*"' "$CONFIG_PATH" | head -n 1 | sed 's/.*"method":[[:space:]]*"\([^"]*\)".*/\1/')
    PUBLIC_IP=$(curl -s ifconfig.me)
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}[INFO] Sing-Box Server Credentials${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo -e "  🌍 Server IP : ${GREEN}${PUBLIC_IP}${NC}"
    echo -e "  🚪 Port      : ${GREEN}${PORT:-N/A}${NC}"
    echo -e "  🔑 Password  : ${GREEN}${PASSWORD:-N/A}${NC}"
    echo -e ""
    echo -e "  ✨ Method    : ${GREEN}${METHOD:-aes-256-gcm}${NC}"
    echo -e "${GREEN}================================================${NC}"
    exit 0
fi

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}    🚀 OpenMesh Node Automated Installer        ${NC}"
echo -e "${BLUE}================================================${NC}"

# --- 1. UE Design: Zero-Interaction Generation ---
# For a novice user, asking for ports or passwords creates friction and security risks.
# We auto-generate a secure password and a random high port to ensure safety and zero-click flow.
echo -e "${YELLOW}[*] Generatig Secure Network Credentials...${NC}"

PORT=$((RANDOM % 50000 + 10000)) 
PASSWORD=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)

echo -e "    - Port allocated: ${PORT}"
echo -e "    - Secure Password: ${PASSWORD}"

# --- 2. Environment Preparation ---
echo -e "${YELLOW}[*] Preparing system environment...${NC}"

# Detect OS (CentOS vs Ubuntu/Debian) to install basic tools
if [ -f /etc/redhat-release ]; then
    yum install -y curl wget tar systemd firewalld >/dev/null 2>&1
elif [ -f /etc/debian_version ]; then
    apt-get update >/dev/null 2>&1
    apt-get install -y curl wget tar systemd ufw >/dev/null 2>&1
fi

# --- 3. Downloading Sing-Box ---
echo -e "${YELLOW}[*] Fetching the latest sing-box core...${NC}"

# Stop existing service if any
systemctl stop sing-box >/dev/null 2>&1

# Hardcoded or dynamic fetch (Using a dynamic latest release fetch from github)
LATEST_URL=$(curl -s https://api.github.com/repos/SagerNet/sing-box/releases/latest | grep "browser_download_url.*linux-amd64.tar.gz" | cut -d '"' -f 4)
wget -qO sing-box.tar.gz "$LATEST_URL"

tar -xzf sing-box.tar.gz
# Move binary to local bin
mv sing-box-*/sing-box /usr/local/bin/
chmod +x /usr/local/bin/sing-box

# Cleanup
rm -rf sing-box.tar.gz sing-box-*/

# --- 4. Generating Configuration ---
echo -e "${YELLOW}[*] Writing server configuration...${NC}"

# Disable SELinux temporarily on CentOS to avoid permission blocks for sing-box
if command -v setenforce >/dev/null 2>&1; then
    setenforce 0 >/dev/null 2>&1
    sed -i 's/^SELINUX=.*/SELINUX=permissive/g' /etc/selinux/config >/dev/null 2>&1
fi

mkdir -p /usr/local/etc/sing-box
cat <<EOF > /usr/local/etc/sing-box/config.json
{
  "log": {
    "level": "info"
  },
  "inbounds": [
    {
      "type": "shadowsocks",
      "listen": "0.0.0.0",
      "listen_port": $PORT,
      "method": "aes-256-gcm",
      "password": "$PASSWORD",
      "multiplex": {
        "enabled": false
      }
    }
  ],
  "outbounds": [
    {
      "type": "direct"
    }
  ]
}
EOF

# --- 5. Systemd Service Registration ---
echo -e "${YELLOW}[*] Registering system service...${NC}"

cat <<EOF > /etc/systemd/system/sing-box.service
[Unit]
Description=sing-box service
Documentation=https://sing-box.sagernet.org
After=network.target nss-lookup.target network-online.target

[Service]
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
ExecStart=/usr/local/bin/sing-box run -c /usr/local/etc/sing-box/config.json
Restart=on-failure
RestartSec=10s
LimitNOFILE=infinity

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable sing-box >/dev/null 2>&1
systemctl restart sing-box

# --- 6. Firewall Configuration (CentOS firewalld & Ubuntu ufw) ---
echo -e "${YELLOW}[*] Opening firewall ports...${NC}"
if command -v firewall-cmd >/dev/null 2>&1; then
    systemctl start firewalld >/dev/null 2>&1
    firewall-cmd --add-port=${PORT}/tcp --permanent >/dev/null 2>&1
    firewall-cmd --add-port=${PORT}/udp --permanent >/dev/null 2>&1
    firewall-cmd --reload >/dev/null 2>&1
elif command -v ufw >/dev/null 2>&1; then
    ufw allow ${PORT}/tcp >/dev/null 2>&1
    ufw allow ${PORT}/udp >/dev/null 2>&1
fi

# --- 7. Final Verification & Output ---
sleep 2 # wait for service to stabilize
if systemctl is-active --quiet sing-box; then
    PUBLIC_IP=$(curl -s ifconfig.me)

    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}[SUCCESS] Sing-Box Server Installed Successfully!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo -e "Please copy the following details to your Vendor Console:"
    echo -e ""
    echo -e "  🌍 Server IP : ${GREEN}${PUBLIC_IP}${NC}"
    echo -e "  🚪 Port      : ${GREEN}${PORT}${NC}"
    echo -e "  🔑 Password  : ${GREEN}${PASSWORD}${NC}"
    echo -e "  🔎 Re-check  : ${GREEN}bash <(curl -sL https://meshnetprotocol.github.io/install.sh) --show${NC}"
    echo -e ""
    echo -e "  ✨ Method    : aes-256-gcm"
    echo -e "${GREEN}================================================${NC}"
else
    echo -e "${RED}[ERROR] Sing-Box failed to start. Please check logs: journalctl -u sing-box${NC}"
fi
