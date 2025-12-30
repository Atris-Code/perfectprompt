# 🔑 Guía: Configurar API Key de Gemini

## ❌ Problema Identificado

Tu aplicación muestra el error:
```
API key not valid. Please pass a valid API key
```

**Causa:** La API key en el archivo `.env.local` no tiene el formato correcto o está vacía.

## ✅ Solución: Pasos para Configurar

### Paso 1: Obtener una API Key válida de Google AI Studio

1. **Visita Google AI Studio:**
   - Ve a: https://aistudio.google.com/app/apikey

2. **Inicia sesión:**
   - Usa tu cuenta de Google

3. **Crear API Key:**
   - Haz clic en **"Get API key"** o **"Create API key"**
   - Selecciona un proyecto existente o crea uno nuevo
   - Copia la API key generada (empieza con algo como `AIzaSy...`)

### Paso 2: Configurar el archivo .env.local

1. **Abre el archivo `.env.local`** en la raíz del proyecto
   - Ubicación: `f:\PerfectPrompt\.env.local`

2. **Reemplaza el contenido** con tu nueva API key:
   ```
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
   ⚠️ **IMPORTANTE:** Reemplaza `AIzaSyXXX...` con tu API key real

3. **Guarda el archivo**

### Paso 3: Reiniciar el servidor de desarrollo

En la terminal, presiona `Ctrl+C` para detener el servidor, luego:

```powershell
npm run dev
```

### Paso 4: Verificar que funciona

1. Recarga la página en el navegador (http://localhost:3000/)
2. Intenta usar cualquier función de generación de contenido
3. Debería funcionar sin errores

## 📋 Formato Correcto de la API Key

✅ **Formato válido:**
```
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

❌ **Formatos incorrectos:**
```
GEMINI_API_KEY="tu_clave_aqui"
GEMINI_API_KEY=
GEMINI_API_KEY=xxxxxxxxxxxx
```

## 🔍 Verificación Rápida

Después de configurar, ejecuta este comando para verificar:

```powershell
# Ver si la key está configurada (sin mostrar el valor completo)
Get-Content .env.local | ForEach-Object { 
    if ($_ -match "GEMINI_API_KEY=(.+)") { 
        Write-Host "✅ API Key configurada: $($matches[1].Substring(0, 15))..." -ForegroundColor Green 
    } 
}
```

## ⚠️ Notas Importantes

1. **Seguridad:**
   - NO compartas tu API key públicamente
   - NO la subas a repositorios públicos
   - El archivo `.env.local` está en `.gitignore` (protegido)

2. **Límites de uso:**
   - Las API keys tienen límites de uso gratuito
   - Monitorea tu uso en: https://aistudio.google.com/app/apikey

3. **Troubleshooting:**
   - Si el error persiste, verifica que copiaste la key completa
   - Asegúrate de no tener espacios antes o después de la key
   - La key debe ser una sola línea, sin saltos de línea

## 🆘 ¿Necesitas Ayuda?

Si después de seguir estos pasos el error continúa:
1. Verifica que la key sea válida en Google AI Studio
2. Intenta generar una nueva API key
3. Revisa que el archivo `.env.local` no tenga caracteres especiales

---

**Última actualización:** 10/12/2025 18:40
