import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, ArrowRight, Sparkles, Filter, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface Project {
  id: string;
  number: string;
  title: string;
  category: 'Spatial 3D' | 'Digital' | 'Hardware' | 'Identidade';
  client: string;
  year: string;
  description: string;
  technologies: string[];
  gradientTheme: string;
}

const PROJECTS: Project[] = [
  {
    id: 'aura',
    number: '01',
    title: 'AURA',
    category: 'Spatial 3D',
    client: 'Acoustics Labs',
    year: '2026',
    description: 'Interface e sistema operacional espacial para hardware de áudio imersivo, gerando campos acústicos adaptativos em tempo real.',
    technologies: ['Three.js', 'WebAudio DSP', 'WebGL Shaders', 'Tactile Motion'],
    gradientTheme: 'from-neutral-800 via-neutral-900 to-black',
  },
  {
    id: 'kronos',
    number: '02',
    title: 'KRONOS ATELIER',
    category: 'Digital',
    client: 'Geneva Horlogerie',
    year: '2025',
    description: 'Experiência digital hiper-precisa para maison de alta relojoaria com desmontagem interativa 3D de turbilhões e complicações astronômicas.',
    technologies: ['GLTF 3D', 'Next-Gen Motion', 'Custom Physics', 'Micro-Haptics'],
    gradientTheme: 'from-stone-900 via-neutral-900 to-black',
  },
  {
    id: 'vortex',
    number: '03',
    title: 'VORTEX PAVILION',
    category: 'Spatial 3D',
    client: 'Bienal de Arquitetura',
    year: '2025',
    description: 'Direção criativa e gêmeo digital interativo para pavilhão paramétrico cinético em Milão com fachadas móveis de titânio.',
    technologies: ['Parametric CAD', 'Three.js Camera Rig', 'Raymarching'],
    gradientTheme: 'from-zinc-800 via-zinc-900 to-black',
  },
  {
    id: 'lumen',
    number: '04',
    title: 'LUMEN OS',
    category: 'Hardware',
    client: 'Lumen Industrial',
    year: '2024',
    description: 'Sistema operacional e aplicação móvel para iluminação escultural monolítica residencial e de galerias de arte contemporânea.',
    technologies: ['Embedded React', 'BLE Protocol', 'Spectral UI'],
    gradientTheme: 'from-neutral-800 via-black to-neutral-950',
  },
  {
    id: 'synapse',
    number: '05',
    title: 'SYNAPSE FRAMEWORK',
    category: 'Identidade',
    client: 'Neural Robotics Inc.',
    year: '2024',
    description: 'Identidade de marca, sistema visual generativo e documentação de design para pioneiros em robótica bípede autônoma.',
    technologies: ['Generative Identity', 'SVG Vector Engines', 'Design System'],
    gradientTheme: 'from-slate-900 via-neutral-950 to-black',
  },
  {
    id: 'aeon',
    number: '06',
    title: 'AEON EXPERIENTIAL',
    category: 'Digital',
    client: 'Tokyo Modern Museum',
    year: '2024',
    description: 'Instalação imersiva com projeção mapeada e controle interativo por sensores LiDAR espaciais.',
    technologies: ['Real-time WebGL', 'Sensory Tracking', 'Dynamic Soundscape'],
    gradientTheme: 'from-neutral-900 via-stone-950 to-black',
  },
];

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (selectedProject) {
          setSelectedProject(null);
        } else {
          sound.close();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedProject]);

  if (!isOpen) return null;

  const categories = ['Todos', 'Spatial 3D', 'Digital', 'Hardware', 'Identidade'];
  const filteredProjects =
    activeCategory === 'Todos'
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeCategory);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 backdrop-blur-xl bg-black/85">
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={() => {
            sound.close();
            onClose();
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-neutral-950/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] text-white"
        >
          {/* Titlebar */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-white/[0.03]">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full bg-red-500/80 cursor-pointer hover:opacity-80"
                onClick={() => {
                  sound.close();
                  onClose();
                }}
              />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80 cursor-pointer hover:opacity-80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80 cursor-pointer hover:opacity-80" />
              <span className="ml-3 font-mono-code text-xs text-neutral-400">
                ~/aquila/portfólio/selected_works_2026/
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.close();
                onClose();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              aria-label="Fechar pasta"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-3 bg-black/40">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    sound.click();
                    setActiveCategory(cat);
                  }}
                  className={`rounded-lg px-3 py-1 text-xs font-mono-code transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-white text-black font-semibold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="font-mono-code text-[11px] text-neutral-500">
              {filteredProjects.length} PROJETOS CATALOGADOS
            </div>
          </div>

          {/* Project List / Grid */}
          <div className="overflow-y-auto p-6 space-y-4">
            {selectedProject ? (
              /* Single Project Expanded Inspection View */
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => {
                    sound.click();
                    setSelectedProject(null);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-mono-code text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← Voltar para todos os projetos
                </button>

                <div className="rounded-2xl border border-white/20 bg-neutral-900/60 p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                    <div>
                      <span className="font-mono-code text-xs text-neutral-400">
                        {selectedProject.number} / {selectedProject.category} · {selectedProject.year}
                      </span>
                      <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mt-1">
                        {selectedProject.title}
                      </h3>
                    </div>

                    <div className="text-right sm:text-right font-mono-code text-xs text-neutral-400">
                      CLIENTE: <span className="text-white">{selectedProject.client}</span>
                    </div>
                  </div>

                  {/* Interactive Visual Graphic Area */}
                  <div className="relative h-48 sm:h-64 w-full overflow-hidden rounded-xl border border-white/10 bg-black flex items-center justify-center">
                    <div className="absolute inset-0 bg-grain opacity-50" />
                    <div className="relative flex flex-col items-center justify-center p-6 text-center">
                      <div className="h-16 w-16 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center mb-3">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <p className="font-mono-code text-xs uppercase tracking-widest text-neutral-400">
                        Renderização Espacial Ativa
                      </p>
                      <p className="mt-1 text-sm font-medium text-white">
                        {selectedProject.title} · Experiência Imersiva
                      </p>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed text-neutral-300">
                    {selectedProject.description}
                  </p>

                  <div>
                    <h4 className="font-mono-code text-xs text-neutral-400 uppercase tracking-wider mb-2">
                      Stack & Tecnologias de Ponta
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-mono-code text-neutral-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Project Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    whileHover={{ y: -3 }}
                    onClick={() => {
                      sound.open();
                      setSelectedProject(project);
                    }}
                    className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-neutral-900/50 p-5 transition-all hover:border-white/40 hover:bg-white/[0.04] cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono-code text-xs text-neutral-500 mb-2">
                        <span>{project.number}</span>
                        <span>{project.year}</span>
                      </div>

                      <h3 className="font-display text-xl font-bold tracking-tight text-white group-hover:text-neutral-100">
                        {project.title}
                      </h3>

                      <p className="mt-2 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                      <span className="font-mono-code text-[11px] text-neutral-400">
                        {project.category}
                      </span>
                      <div className="flex items-center gap-1 font-mono-code text-xs text-white opacity-60 group-hover:opacity-100 transition-opacity">
                        <span>Examinar</span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
