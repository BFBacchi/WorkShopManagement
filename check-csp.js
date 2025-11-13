#!/usr/bin/env node

/**
 * Script para verificar la configuración de CSP
 * Ejecuta: node check-csp.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando configuración de CSP...\n');

// 1. Verificar vercel.json
console.log('1️⃣ Verificando vercel.json...');
const vercelPath = path.join(__dirname, 'vercel.json');
if (fs.existsSync(vercelPath)) {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  const cspHeader = vercelConfig.headers?.[0]?.headers?.find(
    (h) => h.key === 'Content-Security-Policy'
  );
  
  if (cspHeader) {
    console.log('   ✅ CSP encontrada en vercel.json');
    if (cspHeader.value.includes("'unsafe-eval'")) {
      console.log('   ✅ CSP incluye "unsafe-eval"');
    } else {
      console.log('   ❌ CSP NO incluye "unsafe-eval"');
    }
    console.log(`   📝 CSP: ${cspHeader.value.substring(0, 100)}...`);
  } else {
    console.log('   ❌ No se encontró CSP en vercel.json');
  }
} else {
  console.log('   ❌ vercel.json no existe');
}

// 2. Verificar index.html
console.log('\n2️⃣ Verificando index.html...');
const indexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  if (indexContent.includes('Content-Security-Policy')) {
    console.log('   ⚠️  CSP encontrada en index.html (puede causar conflictos)');
    const match = indexContent.match(/content="([^"]+)"/i);
    if (match) {
      console.log(`   📝 CSP en HTML: ${match[1].substring(0, 100)}...`);
    }
  } else {
    console.log('   ✅ No hay CSP en index.html (correcto, se usa vercel.json)');
  }
} else {
  console.log('   ❌ index.html no existe');
}

// 3. Verificar dist/index.html si existe
console.log('\n3️⃣ Verificando dist/index.html (build de producción)...');
const distIndexPath = path.join(__dirname, 'dist', 'index.html');
if (fs.existsSync(distIndexPath)) {
  const distContent = fs.readFileSync(distIndexPath, 'utf8');
  if (distContent.includes('Content-Security-Policy')) {
    console.log('   ⚠️  CSP encontrada en dist/index.html');
    const match = distContent.match(/content="([^"]+)"/i);
    if (match) {
      console.log(`   📝 CSP en dist: ${match[1].substring(0, 100)}...`);
      if (!match[1].includes("'unsafe-eval'")) {
        console.log('   ❌ CSP en dist NO incluye "unsafe-eval"');
      }
    }
  } else {
    console.log('   ✅ No hay CSP en dist/index.html');
  }
} else {
  console.log('   ℹ️  dist/index.html no existe (ejecuta npm run build primero)');
}

// 4. Verificar vite.config.ts
console.log('\n4️⃣ Verificando vite.config.ts...');
const vitePath = path.join(__dirname, 'vite.config.ts');
if (fs.existsSync(vitePath)) {
  const viteContent = fs.readFileSync(vitePath, 'utf8');
  if (viteContent.includes('Content-Security-Policy')) {
    console.log('   ✅ CSP encontrada en vite.config.ts (solo para desarrollo)');
    if (viteContent.includes("'unsafe-eval'")) {
      console.log('   ✅ CSP incluye "unsafe-eval"');
    }
  } else {
    console.log('   ℹ️  No hay CSP en vite.config.ts');
  }
}

console.log('\n✅ Verificación completada\n');
console.log('📋 Próximos pasos:');
console.log('   1. Verifica los headers HTTP en producción usando Chrome DevTools');
console.log('   2. Revisa la consola del navegador para ver errores específicos');
console.log('   3. Ejecuta: npm run build y verifica dist/index.html');
console.log('   4. Limpia la caché del navegador o usa modo incógnito');

