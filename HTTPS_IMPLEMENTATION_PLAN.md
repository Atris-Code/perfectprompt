# Plan de Implementación de Seguridad HTTPS (SSL/TLS)

Este documento detalla los requisitos previos y el plan paso a paso para asegurar el servidor de producción de **Nexo Sinérgico** utilizando HTTPS con certificados Let's Encrypt.

## 1. Requisitos Previos (Checklist)

Antes de comenzar la configuración técnica, asegúrate de cumplir con los siguientes puntos críticos:

### A. Dominio Registrado
- [ ] **Nombre de Dominio**: Debes tener un dominio válido (ej: `nexosinergico.com` o `app.tudominio.com`).
- [ ] **Acceso al Panel DNS**: Debes tener acceso para modificar los registros DNS de tu proveedor de dominio (GoDaddy, Namecheap, Cloudflare, AWS Route53, etc.).

### B. Configuración DNS
- [ ] **Registro A**: El dominio (y subdominios si aplica) debe apuntar a la dirección IP pública de tu servidor de producción.
  - Ejemplo: `A  nexosinergico.com  ->  188.166.19.103`
  - Ejemplo: `A  www.nexosinergico.com  ->  188.166.19.103`
- [ ] **Propagación**: Verifica que los cambios DNS se hayan propagado (puede tardar de minutos a horas). Puedes usar herramientas como `whatsmydns.net`.

### C. Acceso al Servidor
- [ ] **SSH**: Acceso root o sudo al servidor VPS/Cloud.
- [ ] **Docker & Docker Compose**: Deben estar instalados y funcionando (ya confirmado por el despliegue actual).

### D. Configuración de Firewall / Red
- [ ] **Puerto 80 (HTTP)**: Debe estar ABIERTO para la validación inicial de Let's Encrypt (ACME challenge).
- [ ] **Puerto 443 (HTTPS)**: Debe estar ABIERTO para el tráfico seguro.
- [ ] **Verificación**: Si usas AWS/Azure/GCP, revisa los "Security Groups" o "Firewall Rules". Si usas UFW en Linux, asegúrate de permitir ambos.

## 2. Estrategia de Implementación

Utilizaremos el enfoque de **Nginx + Certbot (Dockerizado)** para una gestión automática y aislada.

### Componentes:
1.  **Nginx (Frontend)**: Actuará como servidor web y terminador SSL.
2.  **Certbot**: Un contenedor efímero que solicitará y renovará los certificados automáticamente.
3.  **Volumen Compartido**: Un volumen de Docker para compartir los certificados entre Certbot y Nginx.

### Pasos a Seguir (Resumen):
1.  Modificar `docker-compose.prod.yml` para incluir el servicio `certbot` y montar volúmenes de certificados.
2.  Crear un script de inicialización para obtener el primer certificado (dummy) y luego el real.
3.  Actualizar `nginx.conf` para escuchar en el puerto 443 y usar los certificados SSL.
4.  Configurar la renovación automática.

---

**¿Listo para proceder?**
Una vez confirmes que tienes el dominio apuntando a la IP `188.166.19.103` (o la IP actual de producción), podemos ejecutar los cambios en el código.
