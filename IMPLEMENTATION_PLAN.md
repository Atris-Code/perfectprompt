# Plan de Implementación: Sistema de Login y Nexo Sinérgico

Basado en las especificaciones de la carpeta `human/Login`, este es el plan paso a paso para implementar la infraestructura de base de datos, seguridad y el puente de datos entre el área científica y creativa.

## Fase 1: Fundamentos de Base de Datos y Esquema (PDF 1)

**Objetivo:** Establecer la estructura de datos robusta con soporte RBAC (Role-Based Access Control) y seguridad JWS.

1.  **Configuración del Entorno:**
    *   Instalar dependencias: `fastapi`, `uvicorn`, `sqlalchemy`, `passlib[bcrypt]`, `python-jose`.
    *   Configurar conexión a base de datos (SQLite para desarrollo, preparado para PostgreSQL).

2.  **Implementación del Esquema SQL:**
    *   Crear tabla `roles`: Definir roles (Admin, Operador, Viewer, Academico, Colaborador).
    *   Crear tabla `users`: Incluir campo crítico `token_version` (INT DEFAULT 1) para invalidación de tokens.
    *   Crear tabla `user_roles`: Relación Many-to-Many para usuarios con múltiples sombreros (ej. Académico + Colaborador).
    *   Crear tabla `refresh_tokens`: Para manejo de sesiones persistentes.

3.  **Semilla de Datos (Seeding):**
    *   Script para insertar los roles definidos.
    *   Crear un usuario "Híbrido" de prueba (ej. `cientifico@nexo.com`) con roles de Académico y Colaborador.

## Fase 2: Backend API y Autenticación Segura (PDF 2 y 3)

**Objetivo:** Implementar el servidor FastAPI con un sistema de login "Stateful JWT" que permita invalidación inmediata.

1.  **Modelos ORM (SQLAlchemy):**
    *   Mapear las tablas SQL a clases Python (`User`, `Role`).

2.  **Utilidades de Seguridad:**
    *   Configurar `passlib` para hasheo de contraseñas (Bcrypt).
    *   Implementar generación de JWS incluyendo `ver` (versión del token) en el payload.

3.  **Endpoint de Login (`/auth/login`):**
    *   Validar credenciales.
    *   Verificar estado `is_active`.
    *   Generar token firmado con la `token_version` actual del usuario.
    *   Devolver token y lista de roles para el Frontend.

4.  **El Guardián (Middleware de Dependencia):**
    *   Implementar `get_current_user`.
    *   Decodificar token y extraer `ver`.
    *   **Validación Crítica:** Comparar `ver` del token con `token_version` en la DB. Si difieren, rechazar (401).

## Fase 3: Control de Acceso y Rutas Protegidas (PDF 3)

**Objetivo:** Demostrar la segregación de funciones y el mecanismo de seguridad.

1.  **Helper de Roles:**
    *   Implementar función `require_role` para proteger rutas específicas.

2.  **Endpoints de Dominio:**
    *   `/pyrolysis/simulation-data`: Requiere rol "Operador" o "Académico".
    *   `/creative/generate-prompt`: Requiere rol "Colaborador".

3.  **Botón de Pánico (Admin):**
    *   Implementar `/admin/revoke-user-tokens/{email}`.
    *   Lógica: Incrementar `token_version` en la DB. Esto invalida instantáneamente todos los tokens anteriores.

## Fase 4: El Puente de Datos (Payload y Prompt) (PDF 4 y 5)

**Objetivo:** Estructurar la transferencia de contexto entre la simulación y la IA creativa.

1.  **Esquema de Datos (Pydantic):**
    *   Implementar `ContextTransferObject` con:
        *   `technical_core`: Datos duros inmutables.
        *   `semantic_bridge`: Interpretación narrativa y visual.
        *   `creative_defaults`: Sugerencias de UI.

2.  **Endpoint de Ingesta:**
    *   `/creative/receive-context`: Recibe el payload del Pyrolysis Hub.

3.  **Integración del System Prompt Maestro:**
    *   Configurar el prompt del sistema para el LLM ("Nexo").
    *   Instruir al LLM para leer el `ContextTransferObject` y operar en modo Narrativo o Visual según se requiera.

## Fase 5: Visualización y UI (PDF 6)

**Objetivo:** Planificar la interfaz de usuario para la "Fusión de Datos".

1.  **Diseño Conceptual:**
    *   Panel Izquierdo: Pyrolysis Hub (Datos, Gráfico Sankey).
    *   Panel Derecho: Creador de Prompt (Chat Proactivo).
    *   Transición: Animación de partículas de datos al hacer clic en "Generar Espacio Creativo".

---

### Próximos Pasos Inmediatos (Ejecución)

1.  Crear estructura de carpetas para el backend (`backend/auth`, `backend/models`, etc.).
2.  Escribir `main.py` y `database.py` con la configuración inicial.
3.  Ejecutar el script de setup para crear la DB y el usuario demo.
