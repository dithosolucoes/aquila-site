export type CaseVisual = 'globe' | 'orbits' | 'polyhedron' | 'grid' | 'contour' | 'rays' | 'dots';

export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  client: string;
  year: string;
  description: string;
  technologies: string[];
  visual: CaseVisual;
  /** Cases with a live, launchable experience. */
  experience?: 'europe-us';
}

export const CASES: CaseStudy[] = [
  {
    id: 'europe-us',
    title: 'Europe US',
    category: 'Experiência',
    client: 'Europe US',
    year: '2026',
    description:
      'Experiência interativa cinematográfica da América Latina a Portugal: uma rota precisa sobre o globo, do embarque ao pouso, com as regiões e cidades portuguesas surgindo na chegada.',
    technologies: ['Canvas 2D', 'D3 Geo', 'Web Audio'],
    visual: 'globe',
    experience: 'europe-us',
  },
  {
    id: 'aura',
    title: 'Aura',
    category: 'Spatial 3D',
    client: 'Acoustics Labs',
    year: '2026',
    description:
      'Interface e sistema operacional espacial para hardware de áudio imersivo, gerando campos acústicos adaptativos em tempo real.',
    technologies: ['Three.js', 'WebAudio DSP', 'WebGL Shaders', 'Tactile Motion'],
    visual: 'orbits',
  },
  {
    id: 'kronos',
    title: 'Kronos Atelier',
    category: 'Digital',
    client: 'Geneva Horlogerie',
    year: '2025',
    description:
      'Experiência digital hiper-precisa para maison de alta relojoaria com desmontagem interativa 3D de turbilhões e complicações astronômicas.',
    technologies: ['GLTF 3D', 'Next-Gen Motion', 'Custom Physics', 'Micro-Haptics'],
    visual: 'polyhedron',
  },
  {
    id: 'vortex',
    title: 'Vortex Pavilion',
    category: 'Spatial 3D',
    client: 'Bienal de Arquitetura',
    year: '2025',
    description:
      'Direção criativa e gêmeo digital interativo para pavilhão paramétrico cinético em Milão com fachadas móveis de titânio.',
    technologies: ['Parametric CAD', 'Three.js Camera Rig', 'Raymarching'],
    visual: 'grid',
  },
  {
    id: 'lumen',
    title: 'Lumen OS',
    category: 'Hardware',
    client: 'Lumen Industrial',
    year: '2024',
    description:
      'Sistema operacional e aplicação móvel para iluminação escultural monolítica residencial e de galerias de arte contemporânea.',
    technologies: ['Embedded React', 'BLE Protocol', 'Spectral UI'],
    visual: 'rays',
  },
  {
    id: 'synapse',
    title: 'Synapse Framework',
    category: 'Identidade',
    client: 'Neural Robotics Inc.',
    year: '2024',
    description:
      'Identidade de marca, sistema visual generativo e documentação de design para pioneiros em robótica bípede autônoma.',
    technologies: ['Generative Identity', 'SVG Vector Engines', 'Design System'],
    visual: 'contour',
  },
  {
    id: 'aeon',
    title: 'Aeon Experiential',
    category: 'Digital',
    client: 'Tokyo Modern Museum',
    year: '2024',
    description: 'Instalação imersiva com projeção mapeada e controle interativo por sensores LiDAR espaciais.',
    technologies: ['Real-time WebGL', 'Sensory Tracking', 'Dynamic Soundscape'],
    visual: 'dots',
  },
];
