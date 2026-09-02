# 🚀 Guía de Despliegue a Producción (Nexo Sinérgico)

Esta guía detalla los pasos para desplegar la aplicación en el servidor de producción: **http://188.166.19.103/**.

## 0. Conexión al Servidor

Para conectarte al servidor, debes especificar el usuario (usualmente `root`) antes de la dirección IP. Si solo usas la IP, intentará conectar con tu usuario de Windows (`46736`), lo cual causa el error "Permission denied".

```bash
ssh root@188.166.19.103
```

## 1. Requisitos Previos en el Servidor
Asegúrate de que el servidor (Ubuntu/Debian recomendado) tenga instalado:
- **Docker**: [Instalar Docker](https://docs.docker.com/engine/install/ubuntu/)
- **Docker Compose**: [Instalar Docker Compose](https://docs.docker.com/compose/install/)
- **Git**: Para clonar el repositorio.

## 1.5. Preparación del Repositorio (Solo primera vez)

Antes de clonar en el servidor, asegúrate de haber subido tu código local a GitHub.

**Requisito Local:** Debes tener [Git instalado en Windows](https://git-scm.com/download/win). Si recibes un error como "git no se reconoce", instálalo y reinicia VS Code.

Ejecuta estos comandos en tu **terminal local (Windows)**:

```bash
# Inicializar git si no existe
git init

# Agregar todos los archivos
git add .

# Crear el primer commit
git commit -m "Initial deploy to production"

# Renombrar rama a main
git branch -M main

# Conectar con el repositorio remoto
git remote add origin https://github.com/Atris-Code/perfectprompt.git

# Subir el código
git push -u origin main
```

## 2. Preparación del Entorno

1.  **Clonar el repositorio** en el servidor:
    ```bash
    git clone https://github.com/Atris-Code/perfectprompt.git
    cd perfectprompt
    ```

2.  **Configurar Variables de Entorno**:
    Crea un archivo `.env` en la raíz del proyecto con las credenciales de producción. Puedes usar el archivo `.env` local como base, pero asegúrate de cambiar las contraseñas.

    ```bash
    nano .env
    ```

    **Contenido requerido:**
    ```env
    POSTGRES_USER=nexo_admin
    POSTGRES_PASSWORD=TU_CONTRASEÑA_SEGURA_DB
    POSTGRES_DB=nexo_db
    POSTGRES_PORT=5432
    
    SECRET_KEY=TU_SECRET_KEY_LARGA_Y_ALEATORIA
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    
    OPENAI_API_KEY=TU_API_KEY_DE_OPENAI
    ANTHROPIC_API_KEY=TU_API_KEY_DE_ANTHROPIC   # opcional (fallback)
    CORS_ORIGINS=http://TU_DOMINIO,http://localhost:3000
    ```

## 3. Despliegue con Docker Compose

Utilizaremos el archivo de configuración de producción `docker-compose.prod.yml` que hemos creado.

1.  **Construir y levantar los contenedores**:
    ```bash
    docker-compose -f docker-compose.prod.yml up -d --build
    ```

    *   `-f docker-compose.prod.yml`: Indica usar el archivo de producción.
    *   `up`: Crea e inicia los contenedores.
    *   `-d`: Ejecuta en segundo plano (detached mode).
    *   `--build`: Fuerza la reconstrucción de las imágenes (importante para el frontend).

2.  **Verificar el estado**:
    ```bash
    docker-compose -f docker-compose.prod.yml ps
    ```
    Deberías ver 3 servicios (`nexo_db_prod`, `nexo_backend_prod`, `nexo_frontend_prod`) en estado `Up`.

## 4. Inicialización de la Base de Datos

Una vez que los contenedores estén corriendo, necesitas inicializar el esquema de la base de datos.

1.  **Ejecutar el script de inicialización**:
    ```bash
    docker exec -it nexo_backend_prod python init_db.py
    ```

## 5. Acceso a la Aplicación

*   **Frontend (Usuario Final)**: Accede a [http://188.166.19.103/](http://188.166.19.103/)
*   **Backend API Docs**: Accede a [http://188.166.19.103/docs](http://188.166.19.103/docs)

## 6. Mantenimiento y Actualizaciones

Para actualizar la aplicación después de hacer cambios en el código:

1.  **Bajar los cambios**:
    ```bash
    git pull origin main
    ```

2.  **Reconstruir y reiniciar**:
    ```bash
    docker-compose -f docker-compose.prod.yml up -d --build
    ```

## 7. Solución de Problemas

### 7.1 Error "KeyError: 'ContainerConfig'"
Si al desplegar recibes este error, es por una incompatibilidad en la versión antigua de `docker-compose`.
**Solución:** Elimina los contenedores manualmente antes de desplegar:
```bash
docker rm -f nexo_backend_prod nexo_frontend_prod
docker-compose -f docker-compose.prod.yml up -d --build
```

### 7.2 Otros Problemas
*   **Ver logs del backend**:
    ```bash
    docker logs -f nexo_backend_prod
    ```
*   **Ver logs del frontend (Nginx)**:
    ```bash
    docker logs -f nexo_frontend_prod
    ```
*   **Reiniciar todo**:
    ```bash
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    ```
