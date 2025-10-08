#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Solo instalar husky en desarrollo
if (process.env.NODE_ENV !== 'production' && !process.env.CI) {
  try {
    console.log('Instalando Husky para desarrollo...');
    execSync('npx husky install', { stdio: 'inherit' });
  } catch (error) {
    console.log('Husky no disponible, continuando sin él...');
  }
} else {
  console.log('Saltando instalación de Husky en producción...');
}
