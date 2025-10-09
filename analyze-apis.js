// Script para analizar las APIs sin logs
const https = require('https');
const http = require('http');

// Configuración de las APIs
const ALERTAS_API =
  'https://visorestrategicobackend-gkejc4hthnace6b4.eastus2-01.azurewebsites.net/api/powerbi/alertas';
const OBRAS_API =
  'https://visorestrategicobackend-gkejc4hthnace6b4.eastus2-01.azurewebsites.net/api/powerbi/obras';
const API_KEY = 'pow3rb1_visor_3str4t3g1co_2025';

// Función para hacer peticiones HTTP
function makeRequest(url, apiKey) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ProyectoGraficos/1.0',
        'X-API-KEY': apiKey,
      },
    };

    https
      .get(url, options, res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', error => {
        reject(error);
      });
  });
}

// Función principal de análisis
async function analyzeAPIs() {
  try {
    console.log('🔍 Analizando APIs...\n');

    // Obtener datos de alertas
    const alertasResponse = await makeRequest(ALERTAS_API, API_KEY);
    const alertas = alertasResponse.data || alertasResponse;

    // Obtener datos de obras
    const obrasResponse = await makeRequest(OBRAS_API, API_KEY);
    const obras = obrasResponse.data || obrasResponse;

    console.log('📊 DATOS OBTENIDOS:');
    console.log(`Alertas: ${alertas.length} registros`);
    console.log(`Obras: ${obras.length} registros\n`);

    // Analizar campos comunes
    const alertaFields = alertas.length > 0 ? Object.keys(alertas[0]) : [];
    const obraFields = obras.length > 0 ? Object.keys(obras[0]) : [];
    const commonFields = alertaFields.filter(field => obraFields.includes(field));

    console.log('🔗 CAMPOS COMUNES:');
    console.log(commonFields.join(', '));
    console.log('');

    // Buscar coincidencias
    const matches = {
      byIdObra: 0,
      byNombre: 0,
      byProyectoEstrategico: 0,
      byDependencia: 0,
    };

    // Coincidencias por ID OBRA
    alertas.forEach(alerta => {
      const alertaIdObra = alerta['ID OBRA'] || alerta.obra_id;
      const matchingObras = obras.filter(obra => String(obra['ID OBRA']) === String(alertaIdObra));
      if (matchingObras.length > 0) matches.byIdObra++;
    });

    // Coincidencias por NOMBRE
    alertas.forEach(alerta => {
      const alertaNombre = alerta['NOMBRE OBRA'] || alerta.nombre_obra;
      const matchingObras = obras.filter(
        obra => String(obra['NOMBRE OBRA'] || obra['NOMBRE']) === String(alertaNombre)
      );
      if (matchingObras.length > 0) matches.byNombre++;
    });

    // Coincidencias por PROYECTO ESTRATÉGICO
    alertas.forEach(alerta => {
      const alertaProyecto = alerta['PROYECTO ESTRATÉGICO'] || alerta.proyecto_estrategico;
      const matchingObras = obras.filter(
        obra => String(obra['PROYECTO ESTRATÉGICO']) === String(alertaProyecto)
      );
      if (matchingObras.length > 0) matches.byProyectoEstrategico++;
    });

    // Coincidencias por DEPENDENCIA
    alertas.forEach(alerta => {
      const alertaDependencia = alerta['DEPENDENCIA'] || alerta.dependencia;
      const matchingObras = obras.filter(
        obra => String(obra['DEPENDENCIA']) === String(alertaDependencia)
      );
      if (matchingObras.length > 0) matches.byDependencia++;
    });

    console.log('🎯 COINCIDENCIAS ENCONTRADAS:');
    console.log(`Por ID OBRA: ${matches.byIdObra}`);
    console.log(`Por NOMBRE: ${matches.byNombre}`);
    console.log(`Por PROYECTO ESTRATÉGICO: ${matches.byProyectoEstrategico}`);
    console.log(`Por DEPENDENCIA: ${matches.byDependencia}\n`);

    // Mostrar ejemplos de datos
    console.log('📋 EJEMPLOS DE ALERTAS (primeras 3):');
    alertas.slice(0, 3).forEach((a, i) => {
      console.log(`${i + 1}. ID OBRA: ${a['ID OBRA'] || a.obra_id}`);
      console.log(`   NOMBRE: ${a['NOMBRE OBRA'] || a.nombre_obra}`);
      console.log(`   PROYECTO: ${a['PROYECTO ESTRATÉGICO'] || a.proyecto_estrategico}`);
      console.log(`   DEPENDENCIA: ${a['DEPENDENCIA'] || a.dependencia}\n`);
    });

    console.log('📋 EJEMPLOS DE OBRAS (primeras 3):');
    obras.slice(0, 3).forEach((o, i) => {
      console.log(`${i + 1}. ID OBRA: ${o['ID OBRA']}`);
      console.log(`   NOMBRE: ${o['NOMBRE OBRA'] || o['NOMBRE']}`);
      console.log(`   PROYECTO: ${o['PROYECTO ESTRATÉGICO']}`);
      console.log(`   DEPENDENCIA: ${o['DEPENDENCIA']}\n`);
    });

    // Análisis de la mejor relación
    console.log('💡 ANÁLISIS DE RELACIÓN:');
    if (matches.byIdObra > 0) {
      console.log('✅ ID OBRA es la mejor relación');
    } else if (matches.byProyectoEstrategico > 0) {
      console.log('✅ PROYECTO ESTRATÉGICO es la mejor relación');
    } else if (matches.byDependencia > 0) {
      console.log('✅ DEPENDENCIA es la mejor relación');
    } else if (matches.byNombre > 0) {
      console.log('✅ NOMBRE es la mejor relación');
    } else {
      console.log('❌ No se encontraron coincidencias directas');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar análisis
analyzeAPIs();
