#!/usr/bin/env node

/**
 * Script para analizar relaciones entre tablas de alertas y obras
 * Ejecutar con: node scripts/analyze-relations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de APIs (ajustar según tu entorno)
const API_BASE_URL =
  process.env.VITE_API_BASE ||
  'https://visorestrategicobackend-gkejc4hthnace6b4.eastus2-01.azurewebsites.net/api/powerbi';
const API_KEY = process.env.VITE_API_KEY || 'pow3rb1_visor_3str4t3g1co_2025';

async function fetchData(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function analyzeRelations(alertas, obras) {
  console.log('🔗 ANÁLISIS DE RELACIONES ENTRE TABLAS');
  console.log('=====================================\n');

  console.log('📊 DATOS DISPONIBLES:');
  console.log(`Alertas: ${alertas.length} registros`);
  console.log(`Obras: ${obras.length} registros\n`);

  // Analizar campos disponibles
  const alertaFields = alertas.length > 0 ? Object.keys(alertas[0]) : [];
  const obraFields = obras.length > 0 ? Object.keys(obras[0]) : [];

  console.log('🔍 CAMPOS EN ALERTAS:', alertaFields);
  console.log('🔍 CAMPOS EN OBRAS:', obraFields);

  // Buscar campos que podrían ser IDs
  const possibleIdFields = {
    alertas: alertaFields.filter(
      field =>
        field.toLowerCase().includes('id') ||
        field.toLowerCase().includes('codigo') ||
        field.toLowerCase().includes('numero')
    ),
    obras: obraFields.filter(
      field =>
        field.toLowerCase().includes('id') ||
        field.toLowerCase().includes('codigo') ||
        field.toLowerCase().includes('numero')
    ),
  };

  console.log('\n🎯 POSIBLES CAMPOS ID:');
  console.log('En Alertas:', possibleIdFields.alertas);
  console.log('En Obras:', possibleIdFields.obras);

  // Analizar coincidencias por diferentes campos
  const relations = {
    byIdObra: { matches: 0, field: 'ID OBRA' },
    byNombre: { matches: 0, field: 'NOMBRE OBRA' },
    byProyectoEstrategico: { matches: 0, field: 'PROYECTO ESTRATÉGICO' },
    byDependencia: { matches: 0, field: 'DEPENDENCIA' },
    byComuna: { matches: 0, field: 'COMUNA' },
  };

  // Analizar coincidencias
  alertas.forEach(alerta => {
    obras.forEach(obra => {
      // Por ID OBRA
      if (
        alerta['ID OBRA'] &&
        obra['ID OBRA'] &&
        String(alerta['ID OBRA']) === String(obra['ID OBRA'])
      ) {
        relations.byIdObra.matches++;
      }

      // Por NOMBRE OBRA
      const alertaNombre = normalize(alerta['NOMBRE OBRA']);
      const obraNombre = normalize(obra['NOMBRE OBRA'] || obra['NOMBRE']);
      if (alertaNombre && obraNombre && alertaNombre === obraNombre) {
        relations.byNombre.matches++;
      }

      // Por PROYECTO ESTRATÉGICO
      const alertaProyecto = normalize(alerta['PROYECTO ESTRATÉGICO']);
      const obraProyecto = normalize(obra['PROYECTO ESTRATÉGICO']);
      if (alertaProyecto && obraProyecto && alertaProyecto === obraProyecto) {
        relations.byProyectoEstrategico.matches++;
      }

      // Por DEPENDENCIA
      const alertaDep = normalize(alerta['DEPENDENCIA']);
      const obraDep = normalize(obra['DEPENDENCIA']);
      if (alertaDep && obraDep && alertaDep === obraDep) {
        relations.byDependencia.matches++;
      }

      // Por COMUNA
      const alertaComuna = normalize(alerta['COMUNA']);
      const obraComuna = normalize(obra['COMUNA']);
      if (alertaComuna && obraComuna && alertaComuna === obraComuna) {
        relations.byComuna.matches++;
      }
    });
  });

  console.log('\n📈 COINCIDENCIAS ENCONTRADAS:');
  Object.entries(relations).forEach(([key, data]) => {
    const percentage =
      alertas.length > 0 ? ((data.matches / alertas.length) * 100).toFixed(1) : '0';
    console.log(`${data.field}: ${data.matches} coincidencias (${percentage}%)`);
  });

  // Mostrar ejemplos de coincidencias
  console.log('\n📋 EJEMPLOS DE COINCIDENCIAS:');
  const examples = alertas.slice(0, 3).map((alerta, i) => {
    const matchingObra = obras.find(obra => String(alerta['ID OBRA']) === String(obra['ID OBRA']));

    return {
      alerta: {
        id: alerta['ID OBRA'],
        nombre: alerta['NOMBRE OBRA'],
        proyecto: alerta['PROYECTO ESTRATÉGICO'],
      },
      obra: matchingObra
        ? {
            id: matchingObra['ID OBRA'],
            nombre: matchingObra['NOMBRE OBRA'],
            proyecto: matchingObra['PROYECTO ESTRATÉGICO'],
          }
        : null,
    };
  });

  console.table(examples);

  // Generar reporte
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalAlertas: alertas.length,
      totalObras: obras.length,
      relations: Object.fromEntries(
        Object.entries(relations).map(([key, data]) => [
          key,
          {
            field: data.field,
            matches: data.matches,
            percentage:
              alertas.length > 0 ? ((data.matches / alertas.length) * 100).toFixed(1) : '0',
          },
        ])
      ),
    },
    possibleIdFields,
    examples,
  };

  // Guardar reporte
  const reportPath = path.join(__dirname, '..', 'reports', 'table-relations.json');
  const reportsDir = path.dirname(reportPath);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Reporte guardado en: ${reportPath}`);

  return report;
}

async function main() {
  console.log('🚀 Iniciando análisis de relaciones...\n');
  console.log(`🔗 Intentando conectar a: ${API_BASE_URL}\n`);

  try {
    // Obtener datos de las APIs
    console.log('📡 Obteniendo datos de alertas...');
    const alertasData = await fetchData(`${API_BASE_URL}/alertas`);
    if (!alertasData) {
      console.error('❌ No se pudieron obtener las alertas');
      console.log('💡 Asegúrate de que el servidor esté corriendo en:', API_BASE_URL);
      console.log('💡 O ajusta VITE_API_BASE en tu .env');
      process.exit(1);
    }
    const alertas = alertasData.data || alertasData;

    console.log('📡 Obteniendo datos de obras...');
    const obrasData = await fetchData(`${API_BASE_URL}/obras`);
    if (!obrasData) {
      console.error('❌ No se pudieron obtener las obras');
      console.log('💡 Asegúrate de que el servidor esté corriendo en:', API_BASE_URL);
      process.exit(1);
    }
    const obras = obrasData.data || obrasData;

    // Analizar relaciones
    const report = analyzeRelations(alertas, obras);

    console.log('\n✅ Análisis completado');

    // Mostrar recomendaciones
    const bestRelation = Object.entries(report.summary.relations).sort(
      (a, b) => parseFloat(b[1].percentage) - parseFloat(a[1].percentage)
    )[0];

    console.log(
      `\n🎯 RECOMENDACIÓN: Usar "${bestRelation[1].field}" como campo de relación principal`
    );
    console.log(`   Coincidencias: ${bestRelation[1].matches} (${bestRelation[1].percentage}%)`);
  } catch (error) {
    console.error('❌ Error durante el análisis:', error.message);
    process.exit(1);
  }
}

// Ejecutar siempre
main();

export { analyzeRelations, fetchData, normalize };
