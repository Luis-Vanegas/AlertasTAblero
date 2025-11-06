/**
 * Utilidades para mapear proyectos a iconos
 */

import {
  Folder as FolderIcon,
  SportsSoccer as SportsIcon,
  School as SchoolIcon,
  Park as ParkIcon,
  LocalHospital as HospitalIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  DirectionsCar as TransportIcon,
  WaterDrop as WaterIcon,
  Construction as ConstructionIcon,
  LibraryBooks as LibraryIcon,
  SportsBasketball as BasketballIcon,
  Stadium as StadiumIcon,
  FitnessCenter as GymIcon,
} from '@mui/icons-material';
import React from 'react';

/**
 * Configuración de patrones de texto y sus iconos correspondientes
 * Ordenado por prioridad (más específicos primero)
 */
const PROJECT_ICON_PATTERNS: Array<{
  patterns: string[];
  icon: React.ComponentType;
  priority?: number; // Mayor número = mayor prioridad
}> = [
  // Deportes - Específicos primero
  {
    patterns: ['estadio', 'escenario deportivo'],
    icon: StadiumIcon,
    priority: 10,
  },
  {
    patterns: ['basketball', 'baloncesto'],
    icon: BasketballIcon,
    priority: 9,
  },
  {
    patterns: ['gimnasio', 'fitness'],
    icon: GymIcon,
    priority: 8,
  },
  {
    patterns: ['deportiv', 'deporte', 'cancha', 'recreo'],
    icon: SportsIcon,
    priority: 7,
  },
  // Educación
  {
    patterns: [
      'escuela',
      'colegio',
      'educacion',
      'educación',
      'institución educativa',
      'institucion educativa',
    ],
    icon: SchoolIcon,
  },
  // Parques y espacios públicos
  {
    patterns: [
      'parque',
      'plaza',
      'espacio publico',
      'espacio público',
      'alameda',
      'jardin',
      'jardín',
    ],
    icon: ParkIcon,
  },
  // Salud
  {
    patterns: ['hospital', 'salud', 'clinica', 'clínica', 'centro de salud'],
    icon: HospitalIcon,
  },
  // Vivienda
  {
    patterns: ['vivienda', 'casa', 'hogar', 'residencial'],
    icon: HomeIcon,
  },
  // Infraestructura y construcción
  {
    patterns: [
      'construccion',
      'construcción',
      'infraestructura',
      'obra',
      'puente',
      'tunel',
      'túnel',
    ],
    icon: ConstructionIcon,
  },
  // Transporte
  {
    patterns: ['transporte', 'via', 'vía', 'carretera', 'metro', 'tram', 'terminal'],
    icon: TransportIcon,
  },
  // Agua y saneamiento
  {
    patterns: ['agua', 'acueducto', 'alcantarillado', 'saneamiento'],
    icon: WaterIcon,
  },
  // Bibliotecas y cultura
  {
    patterns: ['biblioteca', 'cultura', 'museo', 'teatro'],
    icon: LibraryIcon,
  },
  // Comercial y negocios
  {
    patterns: ['comercial', 'negocio', 'centro comercial', 'mercado'],
    icon: BusinessIcon,
  },
];

/**
 * Obtiene el icono correspondiente para un proyecto basado en su nombre
 * @param projectName - Nombre del proyecto
 * @returns Componente de icono de React
 */
export const getProjectIcon = (projectName: string): React.ReactElement => {
  const normalized = projectName.toLowerCase();

  // Buscar coincidencias con prioridad
  const matches = PROJECT_ICON_PATTERNS.map(config => {
    const hasMatch = config.patterns.some(pattern => normalized.includes(pattern));
    return hasMatch ? config : null;
  }).filter(Boolean) as Array<{
    patterns: string[];
    icon: React.ComponentType;
    priority?: number;
  }>;

  if (matches.length === 0) {
    return <FolderIcon />;
  }

  // Ordenar por prioridad (mayor primero) y tomar el primero
  matches.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  const IconComponent = matches[0].icon;
  return <IconComponent />;
};
