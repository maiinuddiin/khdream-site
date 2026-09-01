import React from 'react';
import { BackgroundConfig } from '../context/CMSContext';
import ImageUpload from './ImageUpload';
import { Palette, Layers, Grid, Image as ImageIcon, Type } from 'lucide-react';

interface BackgroundPickerProps {
  label: string;
  config: BackgroundConfig;
  onChange: (config: BackgroundConfig) => void;
}

const BackgroundPicker: React.FC<BackgroundPickerProps> = ({ label, config, onChange }) => {
  const updateConfig = (updates: Partial<BackgroundConfig>) => {
    onChange({ ...config, ...updates });
  };

  const toggleLayer = (layer: 'color' | 'gradient' | 'image' | 'pattern') => {
    const currentLayers = config.enabledLayers || [];
    const newLayers = currentLayers.includes(layer)
      ? currentLayers.filter(l => l !== layer)
      : [...currentLayers, layer];
    updateConfig({ enabledLayers: newLayers });
  };

  const patterns = [
    { id: 'none', label: 'None' },
    { id: 'lines', label: 'Lines' },
    { id: 'grid', label: 'Grid' },
    { id: 'waves', label: 'Waves' },
    { id: 'circles', label: 'Circles' },
    { id: 'geometric', label: 'Geometric' },
    { id: 'halftone', label: 'Halftone' },
    { id: 'soft-grid', label: 'Soft Grid' },
    { id: 'mesh', label: 'Mesh' },
    { id: 'topo', label: 'Topographic' },
    { id: 'noise', label: 'Noise' },
    { id: 'refined-grid', label: 'Refined Grid' },
    { id: 'map', label: 'Map Pattern' },
    { id: 'travel-icons', label: 'Travel Icons' },
    { id: 'glass-blobs', label: 'Glass Blobs' },
    { id: 'modern-triangles', label: 'Modern Triangles' },
    { id: 'circuit', label: 'Circuit Board' },
  ];

  return (
    <div className="space-y-4 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="flex gap-1 p-1 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
          {[
            { id: 'color', icon: Palette, title: 'Color Layer' },
            { id: 'gradient', icon: Layers, title: 'Gradient Layer' },
            { id: 'image', icon: ImageIcon, title: 'Image Layer' },
            { id: 'pattern', icon: Grid, title: 'Pattern Layer' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => toggleLayer(type.id as any)}
              className={`p-1.5 rounded-md transition-all ${config.enabledLayers?.includes(type.id as any) ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'}`}
              title={type.title}
            >
              <type.icon size={12} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {config.enabledLayers?.includes('color') && (
          <div className="space-y-2 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 animate-in slide-in-from-top-2">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Background Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={config.color || '#ffffff'}
                onChange={(e) => updateConfig({ color: e.target.value })}
                className="w-10 h-10 rounded-lg border-none cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={config.color || '#ffffff'}
                onChange={(e) => updateConfig({ color: e.target.value })}
                className="flex-1 bg-slate-50 dark:bg-zinc-800 px-3 py-2 rounded-lg text-xs font-mono border border-slate-100 dark:border-zinc-700 outline-none"
                placeholder="#ffffff"
              />
            </div>
          </div>
        )}

        {config.enabledLayers?.includes('gradient') && (
          <div className="space-y-2 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 animate-in slide-in-from-top-2">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Background Gradient</label>
            <input
              type="text"
              value={config.gradient || 'linear-gradient(to right, #000000, #444444)'}
              onChange={(e) => updateConfig({ gradient: e.target.value })}
              className="w-full bg-slate-50 dark:bg-zinc-800 px-3 py-2 rounded-lg text-xs font-mono border border-slate-100 dark:border-zinc-700 outline-none mb-2"
              placeholder="linear-gradient(...)"
            />
            <div 
              className="h-8 rounded-lg w-full border border-slate-200 dark:border-zinc-800" 
              style={{ background: config.gradient || 'linear-gradient(to right, #000000, #444444)' }} 
            />
          </div>
        )}

        {config.enabledLayers?.includes('image') && (
          <div className="space-y-4 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 animate-in slide-in-from-top-2">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Background Image</label>
            <ImageUpload
              label=""
              value={config.image}
              onChange={(url) => updateConfig({ image: url })}
            />
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Image Opacity</label>
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">{Math.round((config.imageOpacity ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={config.imageOpacity ?? 1}
                onChange={(e) => updateConfig({ imageOpacity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}

        {config.enabledLayers?.includes('pattern') && (
          <div className="space-y-4 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 animate-in slide-in-from-top-2">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Background Pattern</label>
            <select
              value={config.pattern || 'none'}
              onChange={(e) => updateConfig({ pattern: e.target.value as any })}
              className="w-full bg-slate-50 dark:bg-zinc-800 px-3 py-2 rounded-lg text-xs font-bold border border-slate-100 dark:border-zinc-700 outline-none"
            >
              {patterns.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pattern Opacity</label>
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">{Math.round((config.patternOpacity ?? 0.05) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={config.patternOpacity ?? 0.05}
                onChange={(e) => updateConfig({ patternOpacity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}

        {(!config.enabledLayers || config.enabledLayers.length === 0) && (
          <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-xl">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">No background layers enabled</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundPicker;
