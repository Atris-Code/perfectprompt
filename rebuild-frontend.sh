#!/bin/bash
# Script para reconstruir y desplegar el frontend

echo "🔨 Reconstruyendo Frontend..."
cd frontend

# Limpiar build anterior
rm -rf dist/

# Instalar dependencias (por si acaso)
npm install --legacy-peer-deps

# Reconstruir
npm run build

if [ -d "dist" ]; then
    echo "✅ Build completado exitosamente"
    echo "📦 Archivos generados en: frontend/dist/"
    echo ""
    echo "⚠️ Próximo paso: Reiniciar el contenedor Docker o servidor web"
    echo "   Si usas Docker: docker-compose -f docker-compose.prod.yml restart nexo_frontend_prod"
else
    echo "❌ Error: Build falló, no se generó el directorio dist"
    exit 1
fi
