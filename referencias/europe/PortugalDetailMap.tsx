import React, { useState, useMemo } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import {
  PORTUGAL_CITIES,
  portugalMainlandFeature,
  portugalFeature,
  spainFeature,
  getDistanceKm,
  PortugalCity,
  CityHub,
} from '../utils/geoData';
import { MapPin, Compass, Navigation, Waves, Wind, Sparkles, X, Layers } from 'lucide-react';
import { sound } from '../utils/audio';
import type { MultiPolygon } from 'geojson';

interface PortugalDetailMapProps {
  origin: CityHub;
  onClose?: () => void;
  onReplayFlight?: () => void;
}

export const PortugalDetailMap: React.FC<PortugalDetailMapProps> = ({
  origin,
  onClose,
  onReplayFlight,
}) => {
  const [selectedCity, setSelectedCity] = useState<PortugalCity>(PORTUGAL_CITIES[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'geography' | 'connection'>('overview');

  const distanceKm = useMemo(() => {
    return getDistanceKm(origin.coordinates, selectedCity.coordinates);
  }, [origin, selectedCity]);

  // Main canvas / SVG projection for Continental Portugal
  const { mainlandPath, spainPath, azoresPaths, madeiraPaths, projection } = useMemo(() => {
    // Focus projection on mainland Portugal: longitude ~ -9.8 to -6.0, latitude ~ 36.8 to 42.3
    const width = 680;
    const height = 780;

    const proj = geoMercator()
      .center([-8.0, 39.6]) // Center of Portugal Continental
      .scale(6200) // High magnification for Portugal
      .translate([width / 2, height / 2]);

    const pathGen = geoPath().projection(proj);

    // Mainland
    const mainland = portugalMainlandFeature ? pathGen(portugalMainlandFeature) : '';
    // Adjacent Spain boundary for geographic realism
    const spain = spainFeature ? pathGen(spainFeature) : '';

    // Archipelago insets projections
    const multi = (portugalFeature?.geometry as MultiPolygon) || null;
    const madeiraPoly = multi ? multi.coordinates[0] : null;
    const azoresPolys = multi ? multi.coordinates.slice(2) : [];

    // Madeira projection
    const madeiraProj = geoMercator()
      .center([-16.9, 32.75])
      .scale(9000)
      .translate([60, 60]);
    const madeiraPathGen = geoPath().projection(madeiraProj);
    const madeira = madeiraPoly
      ? madeiraPathGen({
          type: 'Polygon',
          coordinates: madeiraPoly,
        })
      : '';

    // Azores projection
    const azoresProj = geoMercator()
      .center([-27.5, 38.5])
      .scale(3200)
      .translate([80, 70]);
    const azoresPathGen = geoPath().projection(azoresProj);
    const azores = azoresPolys
      .map((p) =>
        azoresPathGen({
          type: 'Polygon',
          coordinates: p,
        })
      )
      .filter(Boolean)
      .join(' ');

    return {
      mainlandPath: mainland,
      spainPath: spain,
      madeiraPaths: madeira,
      azoresPaths: azores,
      projection: proj,
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-[#030303] text-neutral-100 flex flex-col overflow-hidden select-none">
      {/* Subtle background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_40%,rgba(239,230,221,0.06)_0%,rgba(0,0,0,0.95)_75%)] pointer-events-none" />

      {/* Grid watermark */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #EFE6DD 1px, transparent 1px), linear-gradient(to bottom, #EFE6DD 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-900/80 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#EFE6DD] shadow-[0_0_10px_#EFE6DD]" />
          <div>
            <div className="text-[10px] tracking-[0.25em] text-[#DFCEBA] uppercase font-mono">
              Destino Alcançado // Europa
            </div>
            <h1 className="text-lg md:text-xl font-semibold tracking-wider text-neutral-100 uppercase font-serif">
              República Portuguesa
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onReplayFlight && (
            <button
              onClick={() => {
                sound.playClick();
                onReplayFlight();
              }}
              className="px-3 py-1.5 text-xs font-mono tracking-wider border border-neutral-800 hover:border-[#DFCEBA]/60 bg-neutral-950/80 hover:bg-neutral-900 text-neutral-300 hover:text-[#EFE6DD] transition-all flex items-center gap-2"
            >
              <Navigation className="w-3.5 h-3.5 text-[#DFCEBA]" />
              <span>REINICIAR VOO</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 border border-neutral-800 hover:border-neutral-600 bg-neutral-950 text-neutral-400 hover:text-white transition-colors"
              title="Voltar ao mapa global"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: The High-Precision Vector Map of Portugal */}
        <div className="relative flex-1 flex items-center justify-center p-4 min-h-[460px] lg:min-h-auto">
          {/* Compass Rose */}
          <div className="absolute top-6 left-6 flex flex-col items-center opacity-60 pointer-events-none">
            <Compass className="w-8 h-8 text-[#DFCEBA] animate-[spin_60s_linear_infinite]" />
            <span className="text-[9px] font-mono tracking-widest text-neutral-400 mt-1">N 39°30&apos;</span>
          </div>

          {/* Westernmost Point Label */}
          <div className="absolute top-28 left-4 md:left-8 max-w-[180px] p-2 bg-black/80 border border-neutral-900 text-[10px] font-mono text-neutral-400 backdrop-blur-sm pointer-events-none hidden sm:block">
            <div className="text-[#DFCEBA] font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#DFCEBA]" /> CABO DA ROCA
            </div>
            <div className="text-neutral-500 mt-0.5">38°47′N 9°30′W</div>
            <div className="text-[9px] text-neutral-400 italic mt-1 leading-tight">
              &quot;Onde a terra acaba e o mar começa&quot; — Camões
            </div>
          </div>

          {/* Main SVG Map */}
          <div className="relative w-full max-w-[580px] h-[520px] md:h-[620px]">
            <svg
              viewBox="0 0 680 780"
              className="w-full h-full drop-shadow-[0_0_35px_rgba(239,230,221,0.08)] overflow-visible"
            >
              <defs>
                {/* Beige linear glow gradient */}
                <linearGradient id="beigeBorderGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9F2" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#DFCEBA" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#A68A68" stopOpacity="0.5" />
                </linearGradient>

                <filter id="coastalGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Spain / Iberian Peninsula Background Outline */}
              {spainPath && (
                <path
                  d={spainPath}
                  fill="#080808"
                  stroke="#1c1c1c"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  className="transition-opacity duration-700"
                />
              )}

              {/* Mainland Portugal Land Fill */}
              {mainlandPath && (
                <>
                  {/* Subtle coastal ambient aura */}
                  <path
                    d={mainlandPath}
                    fill="none"
                    stroke="#DFCEBA"
                    strokeWidth="8"
                    strokeOpacity="0.12"
                    filter="url(#coastalGlow)"
                  />
                  {/* Real Mainland Portugal Shape */}
                  <path
                    d={mainlandPath}
                    fill="#111111"
                    stroke="url(#beigeBorderGlow)"
                    strokeWidth="1.8"
                    className="cursor-pointer transition-all duration-300 hover:fill-[#161616]"
                  />
                </>
              )}

              {/* Lat/Lon grid lines on map */}
              <g stroke="#222" strokeWidth="0.5" strokeDasharray="2 4">
                <line x1="60" y1="200" x2="620" y2="200" />
                <line x1="60" y1="400" x2="620" y2="400" />
                <line x1="60" y1="600" x2="620" y2="600" />
                <line x1="200" y1="50" x2="200" y2="730" />
                <line x1="400" y1="50" x2="400" y2="730" />
              </g>

              {/* City Markers on Portugal */}
              {PORTUGAL_CITIES.map((city) => {
                // If it's Azores or Madeira, handled in insets
                if (city.id === 'funchal' || city.id === 'ponta-delgada') return null;

                const coords = projection(city.coordinates);
                if (!coords) return null;
                const [cx, cy] = coords;
                const isSelected = selectedCity.id === city.id;
                const isLisbon = city.id === 'lisboa';

                return (
                  <g
                    key={city.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedCity(city);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Ripple on selected or Lisbon */}
                    {(isSelected || isLisbon) && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 16 : 10}
                        fill="none"
                        stroke="#DFCEBA"
                        strokeWidth="1"
                        className="animate-ping opacity-40"
                      />
                    )}

                    {/* Outer ring */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 6 : 4}
                      fill={isSelected ? '#EFE6DD' : '#000000'}
                      stroke={isSelected ? '#FFFFFF' : '#DFCEBA'}
                      strokeWidth={isSelected ? 2 : 1.5}
                      className="transition-all duration-300 group-hover:scale-125"
                    />

                    {/* Core pin */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 2.5 : 1.5}
                      fill={isSelected ? '#000000' : '#DFCEBA'}
                    />

                    {/* Text Label */}
                    <text
                      x={cx + (city.coordinates[0] > -8.5 ? 10 : -10)}
                      y={cy + 4}
                      textAnchor={city.coordinates[0] > -8.5 ? 'start' : 'end'}
                      className={`text-[11px] font-mono tracking-wider transition-colors ${
                        isSelected
                          ? 'fill-[#EFE6DD] font-bold drop-shadow-[0_0_6px_#DFCEBA]'
                          : 'fill-neutral-400 group-hover:fill-neutral-200'
                      }`}
                    >
                      {city.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Inset Box 1: Região Autónoma dos Açores */}
            <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 w-36 h-28 bg-black/90 border border-neutral-800 p-2 backdrop-blur-md">
              <div className="flex items-center justify-between text-[9px] font-mono text-[#DFCEBA] mb-1">
                <span>ARQUIPÉLAGO DOS AÇORES</span>
                <span className="text-[8px] text-neutral-500">9 ILHAS</span>
              </div>
              <svg viewBox="0 0 160 140" className="w-full h-20">
                {azoresPaths && (
                  <path
                    d={azoresPaths}
                    fill="#181818"
                    stroke="#DFCEBA"
                    strokeWidth="1"
                  />
                )}
                {/* Ponta Delgada marker */}
                <circle cx="95" cy="70" r="3" fill="#EFE6DD" />
                <text x="95" y="85" textAnchor="middle" className="text-[8px] font-mono fill-neutral-300">
                  P. DELGADA
                </text>
              </svg>
            </div>

            {/* Inset Box 2: Região Autónoma da Madeira */}
            <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-32 h-28 bg-black/90 border border-neutral-800 p-2 backdrop-blur-md">
              <div className="flex items-center justify-between text-[9px] font-mono text-[#DFCEBA] mb-1">
                <span>MADEIRA</span>
                <span className="text-[8px] text-neutral-500">ATLÂNTICO</span>
              </div>
              <svg viewBox="0 0 120 120" className="w-full h-20">
                {madeiraPaths && (
                  <path
                    d={madeiraPaths}
                    fill="#181818"
                    stroke="#DFCEBA"
                    strokeWidth="1"
                  />
                )}
                {/* Funchal marker */}
                <circle cx="65" cy="65" r="3" fill="#EFE6DD" />
                <text x="65" y="82" textAnchor="middle" className="text-[8px] font-mono fill-neutral-300">
                  FUNCHAL
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Right: Rich Telemetry & Deep-Dive Information Panel */}
        <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-neutral-900 bg-neutral-950/70 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            {/* Origin to Destination Ribbon */}
            <div className="p-4 border border-neutral-800/80 bg-black/60 rounded-none">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                <span>Rota Balística</span>
                <span className="text-[#DFCEBA]">{origin.country} ➔ Portugal</span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-neutral-400 font-mono">Origem</div>
                  <div className="text-base font-semibold text-neutral-100">{origin.name}</div>
                  <div className="text-[10px] font-mono text-neutral-500">
                    {origin.coordinates[1].toFixed(2)}° N/S, {Math.abs(origin.coordinates[0]).toFixed(2)}° W
                  </div>
                </div>

                <div className="flex flex-col items-center px-3">
                  <div className="text-[11px] font-mono font-bold text-[#EFE6DD]">
                    {distanceKm.toLocaleString('pt-BR')} km
                  </div>
                  <div className="w-16 h-[1px] bg-gradient-to-r from-neutral-700 via-[#DFCEBA] to-neutral-700 my-1" />
                  <div className="text-[9px] font-mono text-neutral-400">~9h voo direto</div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-neutral-400 font-mono">Destino</div>
                  <div className="text-base font-semibold text-[#EFE6DD]">{selectedCity.name}</div>
                  <div className="text-[10px] font-mono text-neutral-500">
                    {selectedCity.coordinates[1].toFixed(2)}° N, {Math.abs(selectedCity.coordinates[0]).toFixed(2)}° W
                  </div>
                </div>
              </div>
            </div>

            {/* City Selection Tabs */}
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase mb-2 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#DFCEBA]" />
                <span>Cidades & Regiões em Destaque</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {PORTUGAL_CITIES.slice(0, 6).map((city) => {
                  const isCur = selectedCity.id === city.id;
                  return (
                    <button
                      key={city.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedCity(city);
                      }}
                      className={`px-2 py-2 text-left border text-xs font-mono transition-all ${
                        isCur
                          ? 'border-[#DFCEBA] bg-[#DFCEBA]/10 text-[#EFE6DD]'
                          : 'border-neutral-900 bg-black/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      <div className="font-semibold truncate">{city.name}</div>
                      <div className="text-[9px] text-neutral-500 truncate">{city.region}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected City Details Card */}
            <div className="p-4 border border-neutral-800 bg-neutral-900/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-[#DFCEBA] tracking-wider">
                  {selectedCity.region}
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  {selectedCity.coordinates[1].toFixed(4)}° N, {Math.abs(selectedCity.coordinates[0]).toFixed(4)}° W
                </span>
              </div>

              <h3 className="text-xl font-serif font-bold text-neutral-100">
                {selectedCity.name}
              </h3>
              <p className="text-xs text-[#DFCEBA]/80 font-mono mt-0.5">
                {selectedCity.importance}
              </p>

              <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
                {selectedCity.description}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-neutral-900 text-xs font-mono">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-2 text-center transition-colors ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-[#DFCEBA] text-[#EFE6DD] font-semibold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Geografia
              </button>
              <button
                onClick={() => setActiveTab('geography')}
                className={`flex-1 py-2 text-center transition-colors ${
                  activeTab === 'geography'
                    ? 'border-b-2 border-[#DFCEBA] text-[#EFE6DD] font-semibold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Território
              </button>
              <button
                onClick={() => setActiveTab('connection')}
                className={`flex-1 py-2 text-center transition-colors ${
                  activeTab === 'connection'
                    ? 'border-b-2 border-[#DFCEBA] text-[#EFE6DD] font-semibold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Conexão Brasil/LatAm
              </button>
            </div>

            {/* Tab Body */}
            {activeTab === 'overview' && (
              <div className="space-y-3 text-xs text-neutral-300">
                <div className="grid grid-cols-2 gap-2 text-neutral-400">
                  <div className="p-2 border border-neutral-900 bg-black/40">
                    <div className="text-[10px] text-neutral-500 font-mono">Área Total</div>
                    <div className="text-sm font-semibold text-neutral-200 font-mono">92.212 km²</div>
                  </div>
                  <div className="p-2 border border-neutral-900 bg-black/40">
                    <div className="text-[10px] text-neutral-500 font-mono">Costa Atlântica</div>
                    <div className="text-sm font-semibold text-neutral-200 font-mono">1.793 km</div>
                  </div>
                  <div className="p-2 border border-neutral-900 bg-black/40">
                    <div className="text-[10px] text-neutral-500 font-mono">Fuso Horário</div>
                    <div className="text-sm font-semibold text-neutral-200 font-mono">WET (UTC+0 / +1)</div>
                  </div>
                  <div className="p-2 border border-neutral-900 bg-black/40">
                    <div className="text-[10px] text-neutral-500 font-mono">Diferença Brasil</div>
                    <div className="text-sm font-semibold text-neutral-200 font-mono">+3h a +4h</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'geography' && (
              <div className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                <p>
                  Portugal ocupa a fachada atlântica ocidental da Península Ibérica. O Rio Tejo divide o país naturalmente em duas regiões fisiográficas distintas: o norte montanhoso e verdejante, e o sul plano de vastas campinas douradas e falésias do Algarve.
                </p>
                <div className="p-2 bg-neutral-900/50 border border-neutral-800 text-[11px] font-mono text-[#DFCEBA]">
                  Ponto Extremo Ocidental: Cabo da Roca (38°47′N 9°30′W)
                </div>
              </div>
            )}

            {activeTab === 'connection' && (
              <div className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                <p>
                  A rota aérea entre a América Latina e Portugal constitui o principal corredor linguístico, histórico e tecnológico do Atlântico Sul e Médio.
                </p>
                <p className="text-neutral-400">
                  Mais de 25 voos diários conectam cidades como São Paulo, Rio de Janeiro, Salvador, Brasília, Recife, Fortaleza e Buenos Aires diretamente ao Aeroporto Humberto Delgado em Lisboa e Francisco Sá Carneiro no Porto.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-6 border-t border-neutral-900/80 flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#DFCEBA]" />
              Cartografia Real 1:50M
            </span>
            <span className="text-[#DFCEBA]">WGS 84 / Mercator</span>
          </div>
        </div>
      </div>
    </div>
  );
};
