#!/bin/bash

# Script para configurar o Simulador de Decisão Estratégica
echo "🚀 Configurando o Simulador de Decisão Estratégica..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado. Execute este script no diretório raiz do projeto."
    exit 1
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instalando Node.js..."
    
    # Para Ubuntu/Debian
    if command -v apt &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    # Para CentOS/RHEL
    elif command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    else
        echo "❌ Sistema operacional não suportado. Instale Node.js manualmente."
        exit 1
    fi
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instalando npm..."
    sudo apt-get install -y npm
fi

# Verificar versão do npm
NPM_VERSION=$(npm --version)
echo "✅ npm version: $NPM_VERSION"

# Limpar cache do npm
echo "🧹 Limpando cache do npm..."
npm cache clean --force

# Remover node_modules e package-lock.json se existirem
echo "🗑️ Removendo instalações anteriores..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se react-scripts foi instalado
if [ ! -f "node_modules/.bin/react-scripts" ]; then
    echo "⚠️ react-scripts não foi instalado corretamente. Instalando manualmente..."
    npm install react-scripts@5.0.1 --save-dev
fi

# Verificar se todas as dependências necessárias estão instaladas
echo "🔍 Verificando dependências..."
npm list react react-dom lucide-react

# Definir permissões corretas
echo "🔐 Configurando permissões..."
sudo chown -R $USER:$USER node_modules
sudo chown -R $USER:$USER package-lock.json

# Criar diretório de componentes se não existir
mkdir -p src/components

# Verificar estrutura de arquivos
echo "📁 Verificando estrutura de arquivos..."
required_files=(
    "src/App.js"
    "src/index.js"
    "src/components/AdvancedStrategicSimulator.js"
    "public/index.html"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Arquivo faltando: $file"
        echo "   Por favor, verifique se todos os arquivos foram criados corretamente."
    else
        echo "✅ $file - OK"
    fi
done

# Testar se react-scripts funciona
echo "🧪 Testando react-scripts..."
if npx react-scripts --version; then
    echo "✅ react-scripts está funcionando!"
else
    echo "❌ Erro com react-scripts. Tentando reinstalar..."
    npm uninstall react-scripts
    npm install react-scripts@5.0.1
fi

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "Para iniciar o projeto, execute:"
echo "  npm start"
echo ""
echo "Para fazer build de produção:"
echo "  npm run build"
echo ""
echo "Para executar testes:"
echo "  npm test"
echo ""
