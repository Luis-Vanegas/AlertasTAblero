#!/usr/bin/env node

const { execSync } = require('child_process');

// Instalar Husky solo en desarrollo/local. En CI/producción se omite.
const isCi = Boolean(process.env.CI);
const isProd = process.env.NODE_ENV === 'production';

if (!isCi && !isProd) {
  try {
    console.log('Instalando Husky para desarrollo...');
    execSync('npx husky install', { stdio: 'inherit' });
  } catch (error) {
    console.log('Husky no disponible, continuando sin él...');
  }
} else {
  console.log('Saltando instalación de Husky en producción/CI...');
}
