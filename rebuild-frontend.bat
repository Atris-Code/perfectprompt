@echo off
REM Script para reconstruir y desplegar el frontend (Windows)

echo 🔨 Reconstruyendo Frontend...
cd frontend

REM Limpiar build anterior
if exist dist (
    rmdir /s /q dist
)

REM Instalar dependencias (por si acaso)
echo 📦 Instalando dependencias...
call npm install --legacy-peer-deps

REM Reconstruir
echo 🏗️ Compilando...
call npm run build

if exist dist (
    echo ✅ Build completado exitosamente
    echo 📁 Archivos generados en: frontend\dist\
    echo.
    echo ⚠️ Próximos pasos:
    echo 1. Sube los cambios a Git: git add . ^&^& git commit -m "Update Interactive Lab UI" ^&^& git push
    echo 2. Reinicia el contenedor: docker-compose -f docker-compose.prod.yml restart nexo_frontend_prod
    echo 3. O redeploy en el servidor: ssh root@188.166.19.103
) else (
    echo ❌ Error: Build falló, no se generó el directorio dist
    exit /b 1
)
