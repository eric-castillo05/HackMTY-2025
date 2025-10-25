#!/bin/bash

# Script para iniciar el backend con Docker y exponerlo con ngrok

echo "Iniciando backend con Docker y ngrok..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo " Docker no está corriendo. Por favor, inicia Docker Desktop."
    exit 1
fi

# Verificar si ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo -e "${YELLOW}  ngrok no está instalado${NC}"
    echo "Instalando ngrok..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ngrok/ngrok/ngrok
        else
            echo "Homebrew no está instalado. Instala ngrok manualmente desde: https://ngrok.com/download"
            exit 1
        fi
    else
        echo "Por favor, instala ngrok manualmente desde: https://ngrok.com/download"
        exit 1
    fi
fi

# Detener contenedores existentes
echo -e "${BLUE} Deteniendo contenedores existentes...${NC}"
docker-compose down

# Construir y levantar el contenedor
echo -e "${BLUE} Construyendo y levantando contenedor...${NC}"
docker-compose up -d --build

# Esperar a que el contenedor esté listo
echo -e "${BLUE} Esperando a que el backend esté listo...${NC}"
sleep 10

# Verificar si el contenedor está corriendo
if ! docker ps | grep -q gate_group; then
    echo " Error: El contenedor no está corriendo"
    docker-compose logs
    exit 1
fi

# Verificar si el backend responde
echo -e "${BLUE} Verificando backend...${NC}"
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1 || curl -s http://localhost:8080 > /dev/null 2>&1; then
        echo -e "${GREEN} Backend está corriendo${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo "Intento $attempt de $max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${YELLOW}  No se pudo verificar el backend, pero continuando con ngrok...${NC}"
fi

# Iniciar ngrok
echo -e "${BLUE} Iniciando ngrok...${NC}"
echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}   Backend expuesto públicamente${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# Iniciar ngrok en el puerto 8080
ngrok http 8080
