'use client';

import { useState } from 'react';

interface BodyPart {
  id: string;
  name: string;
  symptoms: string[];
  path: string; // SVG path data
  color: string;
}

interface BodyMapProps {
  onSelectBodyPart: (symptoms: string[]) => void;
  selectedSymptoms?: string[];
}

export default function BodyMap({ onSelectBodyPart, selectedSymptoms = [] }: BodyMapProps) {
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Body parts with associated symptoms
  const frontBodyParts: BodyPart[] = [
    {
      id: 'head',
      name: 'Kepala',
      symptoms: ['Sakit kepala', 'Pusing', 'Penglihatan kabur'],
      path: 'M100,30 L100,20 L110,15 L120,20 L120,30 Q115,35 110,35 Q105,35 100,30',
      color: '#FF6B6B'
    },
    {
      id: 'throat',
      name: 'Tenggorokan',
      symptoms: ['Sakit tenggorokan', 'Batuk', 'Pilek'],
      path: 'M105,35 L115,35 L115,45 L105,45 Z',
      color: '#FF8787'
    },
    {
      id: 'chest',
      name: 'Dada',
      symptoms: ['Nyeri dada', 'Sesak napas', 'Batuk'],
      path: 'M95,45 L125,45 L130,70 L110,75 L90,70 Z',
      color: '#FF9999'
    },
    {
      id: 'stomach',
      name: 'Perut',
      symptoms: ['Sakit perut', 'Mual', 'Muntah', 'Diare'],
      path: 'M92,75 L128,75 L128,100 L92,100 Z',
      color: '#FFAA99'
    },
    {
      id: 'left-arm',
      name: 'Lengan Kiri',
      symptoms: ['Nyeri sendi', 'Kesemutan', 'Lemas'],
      path: 'M85,50 L75,60 L70,85 L75,90 L80,75 L90,60 Z',
      color: '#FFC299'
    },
    {
      id: 'right-arm',
      name: 'Lengan Kanan',
      symptoms: ['Nyeri sendi', 'Kesemutan', 'Lemas'],
      path: 'M135,50 L145,60 L150,85 L145,90 L140,75 L130,60 Z',
      color: '#FFC299'
    },
    {
      id: 'left-leg',
      name: 'Kaki Kiri',
      symptoms: ['Nyeri sendi', 'Bengkak', 'Kesemutan'],
      path: 'M95,100 L100,100 L105,150 L100,155 L95,150 Z',
      color: '#FFD699'
    },
    {
      id: 'right-leg',
      name: 'Kaki Kanan',
      symptoms: ['Nyeri sendi', 'Bengkak', 'Kesemutan'],
      path: 'M115,100 L120,100 L125,150 L120,155 L115,150 Z',
      color: '#FFD699'
    },
  ];

  const backBodyParts: BodyPart[] = [
    {
      id: 'back-head',
      name: 'Belakang Kepala',
      symptoms: ['Sakit kepala', 'Pusing'],
      path: 'M100,30 L100,20 L110,15 L120,20 L120,30 Q115,35 110,35 Q105,35 100,30',
      color: '#FF6B6B'
    },
    {
      id: 'neck',
      name: 'Leher Belakang',
      symptoms: ['Sakit leher', 'Nyeri sendi'],
      path: 'M105,35 L115,35 L115,45 L105,45 Z',
      color: '#FF8787'
    },
    {
      id: 'upper-back',
      name: 'Punggung Atas',
      symptoms: ['Nyeri punggung', 'Nyeri sendi', 'Lemas'],
      path: 'M95,45 L125,45 L125,70 L95,70 Z',
      color: '#FF9999'
    },
    {
      id: 'lower-back',
      name: 'Pinggang',
      symptoms: ['Sakit pinggang', 'Nyeri punggung', 'Nyeri sendi'],
      path: 'M95,70 L125,70 L125,100 L95,100 Z',
      color: '#FFAA99'
    },
  ];

  const currentBodyParts = activeView === 'front' ? frontBodyParts : backBodyParts;

  const handleBodyPartClick = (bodyPart: BodyPart) => {
    onSelectBodyPart(bodyPart.symptoms);
  };

  const isBodyPartActive = (bodyPart: BodyPart) => {
    return bodyPart.symptoms.some(symptom => selectedSymptoms.includes(symptom));
  };

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setActiveView('front')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeView === 'front'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Tampak Depan
        </button>
        <button
          onClick={() => setActiveView('back')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeView === 'back'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Tampak Belakang
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Klik bagian tubuh yang mengalami keluhan
      </div>

      {/* Body Diagram */}
      <div className="relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-8">
        <svg
          viewBox="0 0 220 180"
          className="w-full h-auto max-w-md mx-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Body outline */}
          <rect x="0" y="0" width="220" height="180" fill="transparent" />

          {/* Render body parts */}
          {currentBodyParts.map((bodyPart) => {
            const isActive = isBodyPartActive(bodyPart);
            const isHovered = hoveredPart === bodyPart.id;

            return (
              <g key={bodyPart.id}>
                <path
                  d={bodyPart.path}
                  fill={isActive ? '#0284c7' : (isHovered ? '#60a5fa' : bodyPart.color)}
                  stroke={isActive ? '#0369a1' : '#000'}
                  strokeWidth={isActive ? '2' : '1'}
                  opacity={isActive ? 1 : (isHovered ? 0.9 : 0.7)}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => handleBodyPartClick(bodyPart)}
                  onMouseEnter={() => setHoveredPart(bodyPart.id)}
                  onMouseLeave={() => setHoveredPart(null)}
                />
                {/* Label on hover */}
                {isHovered && (
                  <text
                    x="110"
                    y="10"
                    textAnchor="middle"
                    fill="#1f2937"
                    fontSize="8"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {bodyPart.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hovered Body Part Info */}
        {hoveredPart && (
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg">
            <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
              {currentBodyParts.find(bp => bp.id === hoveredPart)?.name}
            </p>
            <p className="text-xs text-primary-700 dark:text-primary-300 mt-1">
              Gejala terkait: {currentBodyParts.find(bp => bp.id === hoveredPart)?.symptoms.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-primary-600 rounded"></div>
            <span>Dipilih</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <span>Belum dipilih</span>
          </div>
        </div>
      </div>
    </div>
  );
}
