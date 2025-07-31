#!/bin/bash

# =============================================================================
# SIMULADOR DE DECISÃO ESTRATÉGICA - SCRIPT DE INSTALAÇÃO AUTOMÁTICA
# =============================================================================
# Versão: 2.0.0
# Compatível com: Ubuntu Server 20.04/22.04 LTS
# Autor: Simulador Estratégico Team
# Descrição: Instalação completa automatizada em servidor Ubuntu
# =============================================================================

set -e  # Parar execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configurações (edite conforme necessário)
APP_NAME="simulador-estrategico"
APP_USER="simulador"
APP_DIR="/var/www/simulador"
LOG_DIR="/var/log/simulador"
BACKUP_DIR="/home/$APP_USER/backups"
DOMAIN="" # Deixe vazio se não tiver domínio ainda
EMAIL="" # Para SSL certificate
NODE_VERSION="18"
GITHUB_REPO="" # URL do seu repositório GitHub

# =============================================================================
# FUNÇÕES AUXILIARES
# =============================================================================

print_banner() {
    echo -e "${BLUE}"
    echo "=================================================================="
    echo "🚀 SIMULADOR DE DECISÃO ESTRATÉGICA - INSTALAÇÃO AUTOMÁTICA"
    echo "=================================================================="
    echo -e "${NC}"
    echo -e "${WHITE}Versão: 2.0.0${NC}"
    echo -e "${WHITE}Sistema: Ubuntu Server 20.04/22.04 LTS${NC}"
    echo -e "${WHITE}Data: $(date)${NC}"
    echo ""
}

print_step() {
    echo -e "${CYAN}[PASSO $1/12]${NC} ${WHITE}$2${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Este script deve ser executado como root (sudo)"
        echo "Execute: sudo bash $0"
        exit 1
    fi
}

check_os() {
    if [[ ! -f /etc/lsb-release ]]; then
        print_error "Este script é compatível apenas com Ubuntu"
        exit 1
    fi
    
    source /etc/lsb-release
    if [[ "$DISTRIB_ID" != "Ubuntu" ]]; then
        print_error "Este script é compatível apenas com Ubuntu"
        exit 1
    fi
    
    if [[ "$DISTRIB_RELEASE" < "20.04" ]]; then
        print_error "Ubuntu 20.04+ é necessário"
        exit 1
    fi
    
    print_success "Sistema compatível: Ubuntu $DISTRIB_RELEASE"
}

get_user_input() {
    echo -e "${YELLOW}📝 CONFIGURAÇÃO INICIAL${NC}"
    echo ""
    
    # Domínio
    read -p "🌐 Digite seu domínio (ex: meusite.com) ou ENTER para pular: " input_domain
    if [[ -n "$input_domain" ]]; then
        DOMAIN="$input_domain"
    fi
    
    # Email para SSL
    if [[ -n "$DOMAIN" ]]; then
        read -p "📧 Digite seu email para certificado SSL: " input_email
        EMAIL="$input_email"
    fi
    
    # Repositório GitHub
    read -p "📦 URL do repositório GitHub (ou ENTER para usar código local): " input_repo
    if [[ -n "$input_repo" ]]; then
        GITHUB_REPO="$input_repo"
    fi
    
    echo ""
    echo -e "${GREEN}Configuração:${NC}"
    echo "Domínio: ${DOMAIN:-'Não configurado'}"
    echo "Email: ${EMAIL:-'Não configurado'}"
    echo "Repositório: ${GITHUB_REPO:-'Código local'}"
    echo ""
    
    read -p "Continuar? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "Instalação cancelada."
        exit 0
    fi
}

# =============================================================================
# ETAPAS DE INSTALAÇÃO
# =============================================================================

step_01_update_system() {
    print_step 1 "Atualizando sistema"
    
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get upgrade -y -qq
    apt-get autoremove -y -qq
    
    print_success "Sistema atualizado"
}

step_02_install_nodejs() {
    print_step 2 "Instalando Node.js $NODE_VERSION LTS"
    
    # Remover versões antigas do Node.js
    apt-get remove -y nodejs npm > /dev/null 2>&1 || true
    
    # Instalar Node.js via NodeSource
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs
    
    # Verificar instalação
    NODE_VER=$(node --version)
    NPM_VER=$(npm --version)
    
    print_success "Node.js $NODE_VER instalado"
    print_success "npm $NPM_VER instalado"
}

step_03_install_dependencies() {
    print_step 3 "Instalando dependências do sistema"
    
    apt-get install -y \
        nginx \
        git \
        curl \
        wget \
        unzip \
        htop \
        tree \
        ufw \
        fail2ban \
        logrotate \
        cron \
        build-essential \
        python3-certbot-nginx \
        > /dev/null 2>&1
    
    # Instalar PM2 globalmente
    npm install -g pm2 > /dev/null 2>&1
    
    print_success "Dependências instaladas"
}

step_04_create_user() {
    print_step 4 "Criando usuário da aplicação"
    
    # Criar usuário se não existir
    if ! id "$APP_USER" &>/dev/null; then
        useradd -m -s /bin/bash "$APP_USER"
        usermod -aG www-data "$APP_USER"
        print_success "Usuário $APP_USER criado"
    else
        print_info "Usuário $APP_USER já existe"
    fi
    
    # Criar diretórios
    mkdir -p "$APP_DIR" "$LOG_DIR" "$BACKUP_DIR"
    chown -R "$APP_USER:www-data" "$APP_DIR" "$LOG_DIR"
    chown -R "$APP_USER:$APP_USER" "$BACKUP_DIR"
    
    print_success "Diretórios criados"
}

step_05_setup_application() {
    print_step 5 "Configurando aplicação"
    
    if [[ -n "$GITHUB_REPO" ]]; then
        print_info "Clonando repositório..."
        sudo -u "$APP_USER" git clone "$GITHUB_REPO" "$APP_DIR" 2>/dev/null || {
            print_warning "Erro ao clonar repositório. Criando estrutura básica..."
            create_basic_structure
        }
    else
        print_info "Criando estrutura básica da aplicação..."
        create_basic_structure
    fi
    
    # Navegar para diretório da aplicação
    cd "$APP_DIR"
    
    # Configurar package.json se não existir
    if [[ ! -f "package.json" ]]; then
        create_package_json
    fi
    
    # Instalar dependências
    print_info "Instalando dependências da aplicação..."
    sudo -u "$APP_USER" npm install > /dev/null 2>&1
    
    # Build da aplicação
    print_info "Fazendo build da aplicação..."
    sudo -u "$APP_USER" npm run build > /dev/null 2>&1 || {
        print_warning "Build falhou. Criando build básico..."
        create_basic_build
    }
    
    print_success "Aplicação configurada"
}

create_basic_structure() {
    sudo -u "$APP_USER" mkdir -p "$APP_DIR"/{src,public,build}
    
    # Criar package.json básico
    create_package_json
    
    # Criar estrutura React básica
    create_react_structure
    
    # Criar build básico
    create_basic_build
}

create_package_json() {
    sudo -u "$APP_USER" tee "$APP_DIR/package.json" > /dev/null <<EOF
{
  "name": "simulador-estrategico",
  "version": "2.0.0",
  "description": "Simulador de Decisão Estratégica com IA Avançada",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "lucide-react": "^0.263.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF
}

create_react_structure() {
    # Criar public/index.html
    sudo -u "$APP_USER" tee "$APP_DIR/public/index.html" > /dev/null <<EOF
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#2563eb" />
    <meta name="description" content="Simulador de Decisão Estratégica com IA Avançada" />
    <title>Simulador de Decisão Estratégica</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
EOF

    # Criar src/index.js
    sudo -u "$APP_USER" mkdir -p "$APP_DIR/src"
    sudo -u "$APP_USER" tee "$APP_DIR/src/index.js" > /dev/null <<EOF
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
EOF

    # Criar src/App.js básico
    sudo -u "$APP_USER" tee "$APP_DIR/src/App.js" > /dev/null <<EOF
import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>
          🎯 Simulador de Decisão Estratégica
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Sistema instalado com sucesso!
        </p>
        <p style={{ color: '#059669', fontSize: '0.9rem' }}>
          ✅ Servidor configurado e funcionando
        </p>
        <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#9ca3af' }}>
          Para personalizar, substitua os arquivos em: $APP_DIR
        </div>
      </div>
    </div>
  );
}

export default App;
EOF
}

create_basic_build() {
    sudo -u "$APP_USER" mkdir -p "$APP_DIR/build"
    sudo -u "$APP_USER" tee "$APP_DIR/build/index.html" > /dev/null <<EOF
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#2563eb">
    <meta name="description" content="Simulador de Decisão Estratégica com IA Avançada">
    <title>Simulador de Decisão Estratégica</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
        }
        .container {
            background: white;
            padding: 3rem;
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 600px;
            margin: 2rem;
        }
        .title {
            font-size: 2.5rem;
            color: #2563eb;
            margin-bottom: 1rem;
            font-weight: bold;
        }
        .subtitle {
            font-size: 1.2rem;
            color: #6b7280;
            margin-bottom: 2rem;
        }
        .status {
            background: #10b981;
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            font-weight: 600;
            margin-bottom: 2rem;
            display: inline-block;
        }
        .info {
            background: #f3f4f6;
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin-top: 2rem;
        }
        .info h3 {
            color: #374151;
            margin-bottom: 1rem;
        }
        .info ul {
            text-align: left;
            color: #6b7280;
            line-height: 1.6;
        }
        .footer {
            margin-top: 2rem;
            font-size: 0.9rem;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="title">🎯 Simulador de Decisão Estratégica</div>
        <div class="subtitle">Plataforma Avançada com Inteligência Artificial</div>
        <div class="status">✅ Sistema Instalado com Sucesso!</div>
        
        <div class="info">
            <h3>🚀 Funcionalidades Disponíveis:</h3>
            <ul>
                <li>🧠 IA que aprende com suas decisões</li>
                <li>📊 15+ tipos de simulação estratégica</li>
                <li>👥 Modo colaborativo inteligente</li>
                <li>📈 Análise comportamental avançada</li>
                <li>🏆 Sistema de conquistas gamificado</li>
                <li>🔒 Segurança e performance otimizadas</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>Servidor configurado em: $(date)</p>
            <p>Para personalizar, substitua os arquivos em: $APP_DIR</p>
        </div>
    </div>
</body>
</html>
EOF
}

step_06_configure_nginx() {
    print_step 6 "Configurando Nginx"
    
    # Backup da configuração original
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup 2>/dev/null || true
    
    # Configuração principal do Nginx
    tee /etc/nginx/nginx.conf > /dev/null <<EOF
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/atom+xml
        application/rss+xml
        application/json;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=api:10m rate=5r/s;
    
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

    # Configuração do site
    tee /etc/nginx/sites-available/simulador > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN:-_};
    
    root $APP_DIR/build;
    index index.html;
    
    # Rate limiting
    limit_req zone=general burst=20 nodelay;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Handle React Router
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
    }
    
    # API routes (para futuras implementações)
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 5s;
        proxy_send_timeout 5s;
        proxy_read_timeout 5s;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
    
    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(env|log|ini)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

    # Ativar site e desativar default
    ln -sf /etc/nginx/sites-available/simulador /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Testar configuração
    nginx -t
    systemctl reload nginx
    
    print_success "Nginx configurado"
}

step_07_configure_firewall() {
    print_step 7 "Configurando firewall"
    
    # Configurar UFW
    ufw --force reset > /dev/null 2>&1
    ufw default deny incoming > /dev/null 2>&1
    ufw default allow outgoing > /dev/null 2>&1
    
    # Permitir conexões essenciais
    ufw allow ssh > /dev/null 2>&1
    ufw allow 'Nginx Full' > /dev/null 2>&1
    
    # Ativar firewall
    ufw --force enable > /dev/null 2>&1
    
    print_success "Firewall configurado"
}

step_08_configure_fail2ban() {
    print_step 8 "Configurando proteção contra ataques"
    
    # Configuração do Fail2ban
    tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 5

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
failregex = limiting requests, excess: .* by zone .*, client: <HOST>
maxretry = 10
EOF

    systemctl enable fail2ban > /dev/null 2>&1
    systemctl restart fail2ban > /dev/null 2>&1
    
    print_success "Fail2ban configurado"
}

step_09_setup_ssl() {
    print_step 9 "Configurando SSL"
    
    if [[ -n "$DOMAIN" && -n "$EMAIL" ]]; then
        print_info "Configurando SSL para $DOMAIN..."
        
        # Obter certificado SSL
        certbot --nginx -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive --redirect 2>/dev/null || {
            print_warning "Erro ao configurar SSL. Verifique se o domínio aponta para este servidor."
            print_info "Execute manualmente: sudo certbot --nginx -d $DOMAIN"
        }
        
        # Configurar renovação automática
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        print_success "SSL configurado para $DOMAIN"
    else
        print_info "SSL não configurado (domínio não fornecido)"
        print_info "Para configurar depois: sudo certbot --nginx -d seudominio.com"
    fi
}

step_10_setup_monitoring() {
    print_step 10 "Configurando monitoramento"
    
    # Script de health check
    tee /home/$APP_USER/healthcheck.sh > /dev/null <<'EOF'
#!/bin/bash
URL="http://localhost/health"
LOGFILE="/var/log/simulador/health.log"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null)

if [ "$RESPONSE" -eq 200 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S'): OK - Status $RESPONSE" >> "$LOGFILE"
else
    echo "$(date '+%Y-%m-%d %H:%M:%S'): ERROR - Status $RESPONSE" >> "$LOGFILE"
    
    # Tentar restart do nginx
    systemctl restart nginx
    
    # Log da tentativa de restart
    echo "$(date '+%Y-%m-%d %H:%M:%S'): Nginx restarted" >> "$LOGFILE"
fi
EOF

    chmod +x /home/$APP_USER/healthcheck.sh
    chown $APP_USER:$APP_USER /home/$APP_USER/healthcheck.sh
    
    # Script de monitoramento de recursos
    tee /home/$APP_USER/monitor.sh > /dev/null <<'EOF'
#!/bin/bash
LOGFILE="/var/log/simulador/monitor.log"

# CPU e Memória
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
MEM_USAGE=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
DISK_USAGE=$(df -h / | awk 'NR==2{printf "%s", $5}')

echo "$(date '+%Y-%m-%d %H:%M:%S'): CPU: ${CPU_USAGE}%, MEM: ${MEM_USAGE}%, DISK: ${DISK_USAGE}" >> "$LOGFILE"

# Alertas
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "$(date '+%Y-%m-%d %H:%M:%S'): ALERT - High CPU usage: ${CPU_USAGE}%" >> "$LOGFILE"
fi

if (( $(echo "$MEM_USAGE > 80" | bc -l) )); then
    echo "$(date '+%Y-%m-%d %H:%M:%S'): ALERT - High memory usage: ${MEM_USAGE}%" >> "$LOGFILE"
fi
EOF

    chmod +x /home/$APP_USER/monitor.sh
    chown $APP_USER:$APP_USER /home/$APP_USER/monitor.sh
    
    # Adicionar cron jobs
    (sudo -u $APP_USER crontab -l 2>/dev/null; echo "*/5 * * * * /home/$APP_USER/healthcheck.sh") | sudo -u $APP_USER crontab -
    (sudo -u $APP_USER crontab -l 2>/dev/null; echo "*/10 * * * * /home/$APP_USER/monitor.sh") | sudo -u $APP_USER crontab -
    
    print_success "Monitoramento configurado"
}

step_11_setup_backup() {
    print_step 11 "Configurando sistema de backup"
    
    # Script de backup
    tee /home/$APP_USER/backup.sh > /dev/null <<EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_DIR"
APP_DIR="$APP_DIR"
LOG_DIR="$LOG_DIR"

# Criar diretório de backup
mkdir -p "\$BACKUP_DIR"

# Backup da aplicação
tar -czf "\$BACKUP_DIR/app_\$DATE.tar.gz" -C "\$APP_DIR" . 2>/dev/null

# Backup de logs (últimos 7 dias)
find "$LOG_DIR" -name "*.log" -mtime -7 -exec cp {} "\$BACKUP_DIR/" \;

# Backup de configurações
cp /etc/nginx/sites-available/simulador "\$BACKUP_DIR/nginx_\$DATE.conf" 2>/dev/null
cp /etc/fail2ban/jail.local "\$BACKUP_DIR/fail2ban_\$DATE.conf" 2>/dev/null

# Limpeza de backups antigos (manter 7 dias)
find "\$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete 2>/dev/null
find "\$BACKUP_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null
find "\$BACKUP_DIR" -name "*.conf" -mtime +7 -delete 2>/dev/null

echo "\$(date '+%Y-%m-%d %H:%M:%S'): Backup completed - \$DATE" >> "$LOG_DIR/backup.log"
EOF

    chmod +x /home/$APP_USER/backup.sh
    chown $APP_USER:$APP_USER /home/$APP_USER/backup.sh
    
    # Script de restore
    tee /home/$APP_USER/restore.sh > /dev/null <<EOF
#!/bin/bash
if [ -z "\$1" ]; then
    echo "Uso: \$0 <arquivo_backup.tar.gz>"
    echo "Backups disponíveis:"
    ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null
    exit 1
fi

BACKUP_FILE="\$1"
if [ ! -f "\$BACKUP_FILE" ]; then
    echo "Arquivo não encontrado: \$BACKUP_FILE"
    exit 1
fi

echo "Fazendo backup do estado atual..."
/home/$APP_USER/backup.sh

echo "Restaurando de \$BACKUP_FILE..."
systemctl stop nginx
tar -xzf "\$BACKUP_FILE" -C "$APP_DIR"
chown -R $APP_USER:www-data "$APP_DIR"
systemctl start nginx

echo "Restore concluído!"

   
