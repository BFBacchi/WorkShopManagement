# Guía de Diagnóstico de CSP (Content Security Policy)

## 🔍 Paso 1: Verificar Headers HTTP en Producción

### En Chrome DevTools:

1. **Abre tu aplicación en producción** (URL de Vercel)
2. **Abre DevTools** (F12)
3. **Ve a la pestaña "Network"**
4. **Recarga la página** (Ctrl+R o F5)
5. **Busca el primer request** (generalmente el documento HTML - nombre del dominio)
6. **Haz clic en ese request**
7. **Ve a la pestaña "Headers"**
8. **Busca "Response Headers"** y busca `Content-Security-Policy`

### ✅ Qué buscar:

- **Si NO aparece `Content-Security-Policy`**: Vercel no está aplicando los headers
- **Si aparece pero NO tiene `'unsafe-eval'`**: El archivo `vercel.json` no se está aplicando correctamente
- **Si aparece con `'unsafe-eval'`**: El problema está en otro lugar

---

## 🔍 Paso 2: Verificar CSP en el HTML

### En Chrome DevTools:

1. **Ve a la pestaña "Elements"** (o "Elementos")
2. **Busca en el `<head>`** del documento
3. **Busca cualquier meta tag** con `http-equiv="Content-Security-Policy"`

### ✅ Qué buscar:

- **Si hay un meta tag con CSP**: Puede estar en conflicto con los headers HTTP
- **Si NO hay meta tag**: Está bien, los headers HTTP deberían funcionar

---

## 🔍 Paso 3: Verificar Errores Específicos en Consola

### En Chrome DevTools:

1. **Ve a la pestaña "Console"**
2. **Busca errores rojos** relacionados con CSP
3. **Haz clic en el error** para ver detalles
4. **Busca información sobre qué script está siendo bloqueado**

### ✅ Qué buscar:

- **Mensaje exacto del error**: Te dirá qué directiva está bloqueando
- **URL del script bloqueado**: Te dirá qué archivo está causando el problema
- **Línea de código**: Te ayudará a identificar el código problemático

---

## 🔍 Paso 4: Verificar el Archivo dist/index.html

### En tu proyecto local:

1. **Ejecuta `npm run build`** para generar el build de producción
2. **Abre `dist/index.html`** en un editor
3. **Busca meta tags** con CSP

### ✅ Qué buscar:

- **Si hay CSP en dist/index.html**: Puede estar en conflicto
- **Si NO hay CSP**: Está bien, Vercel debería aplicar los headers

---

## 🔍 Paso 5: Verificar Configuración de Vercel

### En Vercel Dashboard:

1. **Ve a tu proyecto en Vercel**
2. **Ve a "Settings" → "Headers"**
3. **Verifica que los headers estén configurados**

### ✅ Qué buscar:

- **Si los headers NO están en Vercel**: Necesitas verificar que `vercel.json` esté en el repositorio
- **Si los headers están pero son diferentes**: Puede haber un problema con el formato

---

## 🔍 Paso 6: Verificar Caché del Navegador

### En Chrome:

1. **Abre una ventana de incógnito** (Ctrl+Shift+N)
2. **Abre DevTools** (F12)
3. **Ve a "Network"**
4. **Marca "Disable cache"** (en la parte superior)
5. **Recarga la página**

### ✅ Qué buscar:

- **Si funciona en incógnito**: El problema es caché del navegador
- **Si NO funciona**: El problema es la configuración

---

## 🔍 Paso 7: Verificar el Script Específico que Causa el Problema

### En Chrome DevTools:

1. **Ve a "Console"**
2. **Busca el error específico**
3. **Haz clic derecho en el error** → "Copy error"
4. **Busca en el código fuente** el archivo mencionado

### ✅ Qué buscar:

- **Nombre del archivo**: Te dirá qué componente está causando el problema
- **Línea de código**: Te ayudará a encontrar el código exacto

---

## 🔧 Soluciones Comunes

### Problema 1: Vercel no aplica los headers

**Solución**: Verifica que `vercel.json` esté en la raíz del proyecto y tenga el formato correcto.

### Problema 2: CSP en conflicto

**Solución**: Elimina cualquier CSP del HTML y deja solo los headers HTTP.

### Problema 3: Caché del navegador

**Solución**: Limpia la caché o usa modo incógnito.

### Problema 4: Script específico usando eval()

**Solución**: Identifica el script y reemplázalo por una alternativa que no use eval().

---

## 📝 Información a Recopilar

Cuando reportes el problema, incluye:

1. **URL exacta** donde ocurre el error
2. **Mensaje completo del error** de la consola
3. **Screenshot** de los headers HTTP (Network → Headers)
4. **Screenshot** del error en la consola
5. **Versión de Chrome** que estás usando
6. **Si funciona en modo incógnito** o no

---

## 🛠️ Comandos Útiles

```bash
# Verificar que vercel.json existe
cat vercel.json

# Verificar el build local
npm run build
cat dist/index.html | grep -i "content-security-policy"

# Verificar headers en producción (desde terminal)
curl -I https://tu-dominio.vercel.app | grep -i "content-security-policy"
```

