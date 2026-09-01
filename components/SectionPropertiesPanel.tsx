import React from 'react';
import { LandingPageSection } from '../context/CMSContext';
import ImageUpload from './ImageUpload';
import { Layout, Maximize2, Minimize2, Palette, Type } from 'lucide-react';
import BackgroundPicker from './BackgroundPicker';

interface SectionPropertiesPanelProps {
  section: LandingPageSection;
  updateSection: (id: string, updates: any) => void;
}

const SectionPropertiesPanel: React.FC<SectionPropertiesPanelProps> = ({ section, updateSection }) => {
  const updateSettings = (updates: any) => {
    updateSection(section.id, {
      settings: { ...(section.settings || {}), ...updates }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section Title (Internal)</label>
        <input 
          type="text" 
          value={section.title} 
          onChange={(e) => updateSection(section.id, { title: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
        />
      </div>

      <div className="space-y-4">
        <BackgroundPicker 
          label="Background Theme"
          config={section.settings?.backgroundConfig || { color: 'transparent' }}
          onChange={(cfg) => updateSettings({ backgroundConfig: cfg })}
        />
      </div>

      <div className="space-y-4 p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Palette size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Glass Effect</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Frosted glass blur</p>
            </div>
          </div>
          <button 
            onClick={() => updateSettings({ glassEffect: !section.settings?.glassEffect })}
            className={`w-12 h-6 rounded-full transition-all relative ${section.settings?.glassEffect ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${section.settings?.glassEffect ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        
        {section.settings?.glassEffect && (
          <div className="pt-4 space-y-2 border-t border-slate-200 dark:border-zinc-700">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Blur Intensity</label>
            <input 
              type="text" 
              value={section.settings?.blurAmount || '12px'} 
              onChange={(e) => updateSettings({ blurAmount: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold outline-none"
              placeholder="e.g. 8px, 20px"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Padding Top</label>
          <input 
            type="text" 
            value={section.settings?.paddingTop || '4rem'} 
            onChange={(e) => updateSettings({ paddingTop: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
            placeholder="e.g. 4rem, 100px"
          />
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Padding Bottom</label>
          <input 
            type="text" 
            value={section.settings?.paddingBottom || '4rem'} 
            onChange={(e) => updateSettings({ paddingBottom: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
            placeholder="e.g. 4rem, 100px"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Layout size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Full Width Section</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Remove side padding</p>
          </div>
        </div>
        <button 
          onClick={() => updateSettings({ fullWidth: !section.settings?.fullWidth })}
          className={`w-12 h-6 rounded-full transition-all relative ${section.settings?.fullWidth ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${section.settings?.fullWidth ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Container Width</label>
        <select 
          value={section.settings?.containerWidth || 'max-w-7xl'} 
          onChange={(e) => updateSettings({ containerWidth: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
        >
          <option value="max-w-3xl">Narrow (3xl)</option>
          <option value="max-w-5xl">Medium (5xl)</option>
          <option value="max-w-7xl">Standard (7xl)</option>
          <option value="max-w-none">Full Width</option>
        </select>
      </div>
    </div>
  );
};

export default SectionPropertiesPanel;
