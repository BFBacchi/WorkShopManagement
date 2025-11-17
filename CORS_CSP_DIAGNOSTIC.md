# Diagnóstico de CORS y CSP

## Error de CORS con `sdk-QtSYWOMLlkHBbNMB`

**Este error NO es de tu aplicación.** Es de una extensión del navegador (probablemente ReasonLabs o similar).

### ¿Por qué aparece?
- Las extensiones del navegador intentan hacer requests a sus propios servidores
- Estos requests pueden fallar por CORS si el servidor de la extensión no tiene los headers correctos
- **No afecta tu aplicación** - es solo ruido en la consola

### Solución
- **Ignorar el error** - no es un problema real
- Si quieres ocultarlo, puedes filtrar en DevTools:
  - Chrome: Filtra por "Hide network messages"
  - Firefox: Filtra por "CORS" y oculta esos mensajes

---

## Error de CSP que Persiste

### Verificación Paso a Paso

#### 1. Verificar si el error es REAL de CSP

En la consola del navegador, busca errores que digan:
- "Content Security Policy"
- "CSP"
- "eval()"
- "script-src"

**Si NO ves estos errores específicos**, entonces el problema NO es CSP.

#### 2. Verificar Headers HTTP en Producción

1. Abre tu aplicación en producción (Vercel)
2. Abre DevTools → Network
3. Recarga la página (F5)
4. Haz clic en el primer request (el documento HTML)
5. Ve a Headers → Response Headers
6. Busca `Content-Security-Policy`
7. **Copia el valor completo** de ese header

#### 3. Verificar si hay Meta Tags CSP

1. Abre DevTools → Elements
2. Busca en el `<head>` del documento
3. Busca cualquier `<meta http-equiv="Content-Security-Policy">`
4. Si hay alguno, **cópialo completo**

#### 4. Verificar Errores Específicos

En la consola, busca:
- El mensaje exacto del error
- La URL del recurso bloqueado
- La directiva que está bloqueando (ej: `script-src`, `connect-src`)

---

## Configuración Actual

### Desarrollo (`vite.config.ts`)
- **CSP deshabilitada** - Vite HMR requiere `eval()`
- Headers vacíos en el servidor de desarrollo

### Producción (`vercel.json`)
- CSP con `'unsafe-eval'` y `'unsafe-inline'` habilitados
- Permite `https:`, `data:`, `blob:` para recursos externos
- Permite `wss:`, `ws:` para WebSockets (Supabase Realtime)

---

## Posibles Problemas

### 1. CSP no se está aplicando en Vercel
- Verifica que `vercel.json` esté en la raíz del proyecto
- Verifica que el deploy incluya el archivo `vercel.json`
- Verifica en Vercel Dashboard → Settings → Headers

### 2. Conflicto de CSP
- Si hay un meta tag CSP en `index.html`, puede estar en conflicto
- Solo debe haber CSP en headers HTTP, no en meta tags

### 3. Librería usando eval() de forma incompatible
- Algunas librerías pueden usar `eval()` de forma que CSP bloquea
- Necesitamos identificar qué librería está causando el problema

### 4. Supabase Realtime necesita WebSockets
- La CSP actual permite `wss:` y `ws:`
- Si el problema es con Supabase, puede necesitar más permisos

---

## Información Necesaria para Diagnosticar

Para resolver el problema, necesito:

1. ✅ **El valor completo del header `Content-Security-Policy`** del documento HTML en producción
2. ✅ **Los mensajes exactos de los errores de CSP** en la consola (si los hay)
3. ✅ **La URL del recurso bloqueado** (si aparece en el error)
4. ✅ **Si hay meta tags CSP** en el HTML (copia el tag completo)
5. ✅ **Si el error ocurre en desarrollo o producción** (o ambos)

---

## Solución Temporal para Probar

Si quieres probar sin CSP temporalmente:

1. Comenta la línea de CSP en `vercel.json`:
```json
// {
//   "key": "Content-Security-Policy",
//   "value": "..."
// }
```

2. Haz deploy a Vercel
3. Verifica si el problema desaparece
4. Si desaparece → El problema es la CSP
5. Si persiste → El problema NO es CSP

**⚠️ IMPORTANTE**: Esto es solo para diagnóstico. No dejes la CSP deshabilitada en producción.


