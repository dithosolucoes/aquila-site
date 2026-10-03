import { feature } from 'topojson-client';
import { geoDistance, geoInterpolate } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from 'geojson';
import countriesData from 'world-atlas/countries-50m.json';
import countries110Data from 'world-atlas/countries-110m.json';

export interface CityHub {
  id: string;
  name: string;
  country: string;
  /** ISO 3166 numeric code, matches world-atlas feature ids */
  iso: string;
  coordinates: [number, number]; // [lon, lat]
  description: string;
}

export interface PortugalCity {
  id: string;
  name: string;
  region: string;
  coordinates: [number, number]; // [lon, lat]
  description: string;
  importance: string;
}

// Major Latin American hubs
export const LATIN_ORIGINS: CityHub[] = [
  {
    id: 'sao-paulo',
    name: 'São Paulo',
    country: 'Brasil',
    iso: '076',
    coordinates: [-46.6333, -23.5505],
    description: 'Maior metrópole da América do Sul e polo econômico transatlântico.',
  },
  {
    id: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    country: 'Brasil',
    iso: '076',
    coordinates: [-43.1729, -22.9068],
    description: 'Histórica capital costeira com vista direta para a rota oceânica.',
  },
  {
    id: 'brasilia',
    name: 'Brasília',
    country: 'Brasil',
    iso: '076',
    coordinates: [-47.8919, -15.7975],
    description: 'Capital do planalto central brasileiro, ponto de convergência nacional.',
  },
  {
    id: 'salvador',
    name: 'Salvador',
    country: 'Brasil',
    iso: '076',
    coordinates: [-38.5016, -12.9777],
    description: 'Primeira capital colonial e berço do intercâmbio luso-brasileiro.',
  },
  {
    id: 'recife',
    name: 'Recife',
    country: 'Brasil',
    iso: '076',
    coordinates: [-34.8770, -8.0476],
    description: 'Ponto continental mais próximo da Europa e histórica porta do Atlântico.',
  },
  {
    id: 'buenos-aires',
    name: 'Buenos Aires',
    country: 'Argentina',
    iso: '032',
    coordinates: [-58.3816, -34.6037],
    description: 'Coração cultural do Rio da Prata no extremo sul do continente.',
  },
  {
    id: 'bogota',
    name: 'Bogotá',
    country: 'Colômbia',
    iso: '170',
    coordinates: [-74.0721, 4.7110],
    description: 'Vértice setentrional andino com conexões marítimas e aéreas globais.',
  },
  {
    id: 'santiago',
    name: 'Santiago',
    country: 'Chile',
    iso: '152',
    coordinates: [-70.6693, -33.4489],
    description: 'Fronteira oeste do continente junto à Cordilheira dos Andes.',
  },
  {
    id: 'mexico-city',
    name: 'Cidade do México',
    country: 'México',
    iso: '484',
    coordinates: [-99.1332, 19.4326],
    description: 'Coração da América Latina setentrional.',
  },
];

// Target cities in Portugal
export const PORTUGAL_CITIES: PortugalCity[] = [
  {
    id: 'lisboa',
    name: 'Lisboa',
    region: 'Lisboa e Vale do Tejo',
    coordinates: [-9.1393, 38.7223],
    description: 'Capital e maior porto atlântico, pontilhada de miradouros sobre o Tejo.',
    importance: 'Destino Principal // Centro Político e Tecnológico',
  },
  {
    id: 'porto',
    name: 'Porto',
    region: 'Norte',
    coordinates: [-8.6291, 41.1579],
    description: 'Capital nortenha à beira do Douro, famosa pelas pontes e vinho do Porto.',
    importance: 'Polo Industrial e Cultural do Norte',
  },
  {
    id: 'cabo-da-roca',
    name: 'Cabo da Roca',
    region: 'Sintra / Lisboa',
    coordinates: [-9.4988, 38.7804],
    description: 'O ponto mais ocidental do continente europeu: "Onde a terra acaba e o mar começa".',
    importance: 'Marco Geográfico Ocidental da Europa',
  },
  {
    id: 'faro',
    name: 'Faro',
    region: 'Algarve',
    coordinates: [-7.9304, 37.0194],
    description: 'Portal do sul de Portugal banhado pelo sol atlântico e pela Ria Formosa.',
    importance: 'Costa Sul e Aeroporto Internacional',
  },
  {
    id: 'coimbra',
    name: 'Coimbra',
    region: 'Centro',
    coordinates: [-8.4103, 40.2033],
    description: 'Cidade dos estudantes, lar de uma das mais antigas universidades do mundo.',
    importance: 'Núcleo Universitário Histórico',
  },
  {
    id: 'braga',
    name: 'Braga',
    region: 'Minho / Norte',
    coordinates: [-8.4265, 41.5454],
    description: 'A "Roma Portuguesa", vibrante centro tecnológico e religioso.',
    importance: 'Capital do Minho',
  },
  {
    id: 'evora',
    name: 'Évora',
    region: 'Alentejo',
    coordinates: [-7.9135, 38.5714],
    description: 'Patrimônio Mundial da UNESCO entre os sobreiros e planícies alentejanas.',
    importance: 'Coração Histórico do Alentejo',
  },
  {
    id: 'funchal',
    name: 'Funchal',
    region: 'Madeira (Região Autónoma)',
    coordinates: [-16.9241, 32.6669],
    description: 'Pérola do Atlântico, arquipélago vulcânico com floresta Laurissilva.',
    importance: 'Arquipélago Atlântico Sul',
  },
  {
    id: 'ponta-delgada',
    name: 'Ponta Delgada',
    region: 'Açores (Região Autónoma)',
    coordinates: [-25.6756, 37.7412],
    description: 'Capital do arquipélago açoriano, encravado no meio da cordilheira submarina atlântica.',
    importance: 'Arquipélago Atlântico Central',
  },
];

// ISO Numeric codes for Latin America
const LATIN_AMERICA_IDS = new Set([
  '076', // Brazil
  '032', // Argentina
  '152', // Chile
  '170', // Colombia
  '604', // Peru
  '862', // Venezuela
  '068', // Bolivia
  '218', // Ecuador
  '600', // Paraguay
  '858', // Uruguay
  '328', // Guyana
  '740', // Suriname
  '254', // French Guiana
  '484', // Mexico
  '591', // Panama
  '188', // Costa Rica
  '558', // Nicaragua
  '340', // Honduras
  '222', // El Salvador
  '320', // Guatemala
  '084', // Belize
  '192', // Cuba
  '214', // Dominican Republic
  '332', // Haiti
  '630', // Puerto Rico
  '388', // Jamaica
]);

// Context countries around Atlantic (for world backdrop)
const ATLANTIC_CONTEXT_IDS = new Set([
  '724', // Spain
  '250', // France
  '826', // UK
  '372', // Ireland
  '504', // Morocco
  '478', // Mauritania
  '686', // Senegal
  '132', // Cape Verde
  '840', // USA
  '124', // Canada
]);

// Parse topology once
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const topo = countriesData as any;
const allCountriesFc = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry>;

// Low-detail (110m) geometry for everything seen from afar: redrawn every frame,
// so it must stay light. The 50m set is only used for Iberia, where the camera zooms in.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const topo110 = countries110Data as any;
const countries110Fc = feature(topo110, topo110.objects.countries) as unknown as FeatureCollection<Geometry>;
const worldLandFc = feature(topo110, topo110.objects.land) as unknown as FeatureCollection<Geometry>;

// Filter Latin America
export const latinAmericaFeatures: Feature<Geometry>[] = countries110Fc.features.filter((f) => {
  const idStr = String(f.id ?? '').padStart(3, '0');
  return LATIN_AMERICA_IDS.has(idStr);
});

// Portugal feature
export const portugalFeature: Feature<Geometry> = allCountriesFc.features.find((f) => {
  return String(f.id ?? '').padStart(3, '0') === '620';
})!;

// Spain feature
export const spainFeature: Feature<Geometry> = allCountriesFc.features.find((f) => {
  return String(f.id ?? '').padStart(3, '0') === '724';
})!;

// Context features
export const atlanticContextFeatures: Feature<Geometry>[] = allCountriesFc.features.filter((f) => {
  const idStr = String(f.id ?? '').padStart(3, '0');
  return ATLANTIC_CONTEXT_IDS.has(idStr);
});

// World land features
export const worldLandFeatures: Feature<Geometry>[] = worldLandFc.features;

// Extract Mainland Portugal specifically (Polygon 1 in the MultiPolygon geometry)
export const getPortugalMainlandFeature = (): Feature<Polygon> | null => {
  if (!portugalFeature || portugalFeature.geometry.type !== 'MultiPolygon') {
    return null;
  }
  const multi = portugalFeature.geometry as MultiPolygon;
  // Mainland Portugal is polygon at index 1 with 186 coordinates spanning lat 37.01-42.14
  const mainlandCoords = multi.coordinates[1];
  if (!mainlandCoords) return null;

  return {
    type: 'Feature',
    id: '620-mainland',
    properties: {
      name: 'Portugal Continental',
    },
    geometry: {
      type: 'Polygon',
      coordinates: mainlandCoords,
    },
  };
};

export const portugalMainlandFeature = getPortugalMainlandFeature();

/**
 * Calculates great circle path coordinates between origin and destination
 */
export function getGreatCirclePath(
  start: [number, number],
  end: [number, number],
  steps: number = 100
): [number, number][] {
  const interpolator = geoInterpolate(start, end);
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push(interpolator(t));
  }
  return points;
}

/**
 * Calculates distance in kilometers between two geo coordinates
 */
export function getDistanceKm(start: [number, number], end: [number, number]): number {
  const rad = geoDistance(start, end);
  return Math.round(rad * 6371); // Earth radius ~6371 km
}

/**
 * Calculates geographic bearing (angle in degrees 0-360) from p1 to p2
 */
export function getBearing(start: [number, number], end: [number, number]): number {
  const [lon1, lat1] = [start[0] * (Math.PI / 180), start[1] * (Math.PI / 180)];
  const [lon2, lat2] = [end[0] * (Math.PI / 180), end[1] * (Math.PI / 180)];

  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}
