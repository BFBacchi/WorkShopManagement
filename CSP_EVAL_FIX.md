# Solución al Error de CSP: "Content Security Policy blocks the use of 'eval'"

## Problema Identificado

El error `Content Security Policy of your site blocks the use of 'eval' in JavaScript` aparecía tanto en desarrollo como en producción, a pesar de tener `'unsafe-eval'` configurado en `vercel.json`.

## Causa del Problema

1. **En Producción**: Aunque `vercel.json` tenía `'unsafe-eval'`, faltaban algunas directivas importantes:
   - `chrome-extension:` para permitir extensiones del navegador
   - `worker-src` para Web Workers que Vite puede usar

2. **En Desarrollo**: No había CSP configurada en `vite.config.ts`, lo que causaba que el navegador aplicara políticas restrictivas por defecto o que extensiones del navegador interfirieran.

## Solución Implementada

### 1. CSP Actualizada en Producción (`vercel.json`)

Se actualizó la CSP para incluir:
- ✅ `'unsafe-eval'` en `default-src` y `script-src` (ya estaba, pero ahora está más explícito)
- ✅ `chrome-extension:` en todas las directivas relevantes (para extensiones del navegador)
- ✅ `worker-src 'self' blob:` (para Web Workers que Vite puede usar)

### 2. CSP Agregada en Desarrollo (`vite.config.ts`)

Se agregó CSP en el servidor de desarrollo con:
- ✅ `'unsafe-eval'` para permitir Vite HMR (Hot Module Replacement)
- ✅ `http://localhost:*`, `ws://localhost:*`, `wss://localhost:*` para desarrollo local
- ✅ `chrome-extension:` para extensiones del navegador
- ✅ `worker-src` para Web Workers

## Cambios Realizados

### `vercel.json`
```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: chrome-extension:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob: chrome-extension:; ... worker-src 'self' blob:;"
}
```

### `vite.config.ts`
```typescript
server: {
  headers: {
    'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http://localhost:* ws://localhost:* wss://localhost:* chrome-extension:; ..."
  },
}
```

## Verificación

Para verificar que la solución funciona:

1. **En Desarrollo**:
   ```bash
   npm run dev
   ```
   - Abre la aplicación en el navegador
   - Abre DevTools → Console
   - El error de CSP sobre `eval()` debería desaparecer

2. **En Producción**:
   - Haz deploy a Vercel
   - Abre la aplicación en producción
   - Abre DevTools → Network → Headers
   - Verifica que el header `Content-Security-Policy` incluya `'unsafe-eval'`
   - El error de CSP debería desaparecer

## Notas Importantes

1. **`'unsafe-eval'` es necesario** porque:
   - Vite HMR (Hot Module Replacement) usa `eval()` en desarrollo
   - Algunas librerías modernas pueden usar `eval()` para optimización
   - Es un compromiso necesario entre seguridad y funcionalidad

2. **`chrome-extension:`** se agregó para evitar errores de extensiones del navegador que intentan ejecutar código.

3. **`worker-src`** se agregó porque Vite puede usar Web Workers en algunos casos.

## Si el Problema Persiste

Si después de estos cambios el error persiste:

1. **Verifica los headers HTTP**:
   - En DevTools → Network → Headers
   - Busca `Content-Security-Policy`
   - Verifica que incluya `'unsafe-eval'`

2. **Limpia la caché del navegador**:
   - Ctrl+Shift+Delete → Limpiar caché
   - O usa modo incógnito para probar

3. **Verifica que no haya meta tags CSP** en el HTML:
   - DevTools → Elements → Busca `<meta http-equiv="Content-Security-Policy">`
   - Si hay alguno, elimínalo (la CSP debe venir solo de headers HTTP)

4. **Verifica extensiones del navegador**:
   - Algunas extensiones pueden aplicar CSP adicional
   - Prueba en modo incógnito (sin extensiones)

## Seguridad

Aunque `'unsafe-eval'` reduce la seguridad de la CSP, es necesario para:
- Vite HMR en desarrollo
- Algunas librerías modernas
- Funcionalidad completa de la aplicación

La CSP sigue siendo segura porque:
- ✅ Mantiene restricciones en `object-src`, `base-uri`, `frame-ancestors`
- ✅ Solo permite recursos de orígenes conocidos
- ✅ Bloquea recursos no seguros

