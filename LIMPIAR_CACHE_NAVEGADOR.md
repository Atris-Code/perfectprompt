# Instrucciones de Limpieza de Caché - Laboratorio de Fundamentos Interactivos

## ⚠️ Los cambios no se visualizan?

El navegador tiene **caché** de la sesión anterior. Necesitas limpiar la caché de forma completa para ver los cambios.

## Opción 1: Limpieza Completa (Recomendado)

### En cualquier navegador:
1. Abre las Herramientas de Desarrollo: **F12** o **Ctrl+Shift+I**
2. Ve a la pestaña **Application** (o **Storage** en Firefox)
3. En la izquierda, haz clic en **Clear Site Data**
4. Marca todas las opciones
5. Haz clic en **Clear**
6. Cierra las herramientas de desarrollo: **F12**
7. Recarga la página: **Ctrl+Shift+R** (hard refresh)

### Alternativa rápida:
- **Windows/Linux**: `Ctrl+Shift+Delete` → Abre historial de navegación → Elige limpiar todo

### En Firefox:
- **Windows/Linux**: `Ctrl+Shift+Delete`
- Selecciona "Todo" en "Rango de tiempo"
- Marca "Cookies" y "Caché"
- Haz clic en "Limpiar ahora"

### En Chrome:
- **Windows/Linux**: `Ctrl+Shift+Delete`
- Elige "Todos los tiempos"
- Marca "Cookies y datos de sitios almacenados" y "Archivos en caché"
- Haz clic en "Borrar datos"

## Opción 2: Hard Refresh (Más rápido)

Simplemente presiona:
- **Windows/Linux**: `Ctrl+Shift+R`
- **Mac**: `Cmd+Shift+R`

Esto fuerza que el navegador descargue nuevamente todos los archivos.

## Opción 3: Abrir en Modo Incógnito

1. Abre una ventana de **modo incógnito/privado**
2. Visita: `188.166.19.103/#interactive-fundamentals-lab`
3. Verifica si los cambios se ven correctamente

---

## ✅ Después de limpiar caché, deberías ver:

- **Tabla Periódica**: Solo símbolos (sin números ni masas)
- **Hover sobre elementos**: Tooltip flotante con nombre y propiedades
- **Click en Hidrógeno/Helio**: Visualización 3D sin pantalla blanca

**Si aún ves pantalla blanca:**
1. Abre la consola del navegador: **F12**
2. Ve a **Console**
3. Captura cualquier mensaje de error rojo
4. Comparte ese error

---

## 🔄 Proceso de desarrollo en vivo

Si estás en modo de desarrollo local, en lugar de los pasos anteriores:

```bash
# En la carpeta frontend:
npm run dev
```

Esto debería hacer que los cambios se reflejen en vivo sin necesidad de caché.
