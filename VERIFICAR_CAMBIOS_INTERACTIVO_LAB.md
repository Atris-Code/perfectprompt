# Checklist para Verificar los Cambios del Laboratorio Interactivo

## 📋 Pasos a seguir:

### 1️⃣ Limpiar caché del navegador (OBLIGATORIO)

Presiona una de estas combinaciones según tu navegador:

**Windows/Linux:**
- `Ctrl + Shift + R` (Hard Refresh - Más rápido)

O si prefieres limpiar completamente:
- `Ctrl + Shift + Delete` → Selecciona "Todos los tiempos" → Marca todo → "Borrar datos"

**Mac:**
- `Cmd + Shift + R`

---

### 2️⃣ Recarga la página

Una vez limpiado, ve a:
```
http://188.166.19.103/#interactive-fundamentals-lab
```

O si estás en desarrollo local:
```
http://localhost:5173/#interactive-fundamentals-lab
```

---

### 3️⃣ Verifica los cambios

**Tabla Periódica:**
- ✅ Debería mostrar **solo símbolos** (H, He, Li, Be, etc.)
- ✅ **SIN números atómicos, SIN masas atómicas**
- ✅ **SIN nombres de elementos**
- ❌ Si ves números y texto solapado → Caché no se limpió

**Hover sobre elementos:**
- ✅ Al pasar el mouse sobre un símbolo → Aparece **tooltip flotante**
- ✅ Tooltip muestra: Nombre, Nº Atómico, Masa Atómica
- ❌ Si no aparece tooltip → Hard refresh nuevamente

**Click en Hidrógeno (H):**
- ✅ Se abre modal con información
- ✅ Tab "Visualizar" → Muestra **dos átomos unidos** (H₂)
- ❌ Si ves pantalla **blanca/negra** → Ver sección de Troubleshooting

**Click en Helio (He):**
- ✅ Se abre modal con información
- ✅ Tab "Visualizar" → Muestra **una esfera con capa exterior**
- ❌ Si ves pantalla blanca → Ver sección de Troubleshooting

---

## 🔧 Troubleshooting

### Problema: Aún veo la tabla con números y texto solapado

**Solución:**
1. Abre navegador en **Modo Incógnito/Privado** (Ctrl+Shift+N)
2. Ve a: `http://188.166.19.103/#interactive-fundamentals-lab`
3. Si funciona correctamente en incógnito, tu navegador tiene caché persistente
4. Limpia más agresivamente:
   - Cierra TODAS las pestañas del sitio
   - Abre DevTools: F12
   - Busca en la consola cualquier error
   - Ve a Application → Clear All → Clear Site Data
   - Recarga

### Problema: White Screen / Pantalla negra en visualizador 3D

**Causas posibles:**

1. **Librería 3Dmol no se cargó:**
   - Abre DevTools: F12
   - Ve a Console
   - Si ves error: "Cannot read properties of undefined"
   - Solución: Recarga la página: Ctrl+R

2. **Elemento sin estructura definida:**
   - No todos los elementos tienen modelos 3D disponibles
   - Prueba con: Carbono (C), Hierro (Fe), Cobre (Cu) - Estos SÍ tienen modelos
   - Hidrógeno y Helio funcionan con modelos simplificados

3. **Timeout o error de carga:**
   - Abre DevTools: F12
   - Ve a Console
   - Busca errores en rojo
   - Si dice "Failed to load model" → Intenta otro elemento

---

## 📊 Elementos para probar:

| Elemento | Tipo | Resultado Esperado |
|----------|------|-------------------|
| H (Hidrógeno) | Diatómico | Dos esferas unidas |
| He (Helio) | Noble | Una esfera con capa |
| C (Carbono) | CID | Estructura de diamante |
| Fe (Hierro) | CID | Estructura cristalina |
| O (Oxígeno) | Diatómico | Dos esferas unidas |

---

## 🎯 Confirmación de Éxito

Habrás completado los cambios cuando:

- [x] Tabla periódica **limpia sin saturación de texto**
- [x] Tooltip aparece **al pasar mouse**
- [x] **Sin pantalla blanca** al hacer click
- [x] Visualización 3D **carga correctamente**

---

## 🚀 Si todo está bien

Los cambios ya están implementados:
- ✅ `InteractiveFundamentalsLab.tsx` - Tabla limpia + tooltips
- ✅ `AtomVisualizer.tsx` - Mejor manejo de errores + fallback models
- ✅ `index.html` - 3Dmol cargado correctamente

Próximos pasos sugeridos:
1. Probar con diferentes navegadores
2. Verificar performance en dispositivos móviles
3. Añadir más elementos con estructuras CID
