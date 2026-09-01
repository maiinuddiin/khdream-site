import React from 'react';
import { LandingPage } from '../context/CMSContext';
import ImageUpload from './ImageUpload';
import { Type, ImageIcon, Palette, Layout, Eye, EyeOff, Settings2, Plus, ArrowLeft, Trash2, GripVertical, Layers, Maximize, Send, Video, Zap, Sliders, List, BarChart, Box, Code, Briefcase, Globe, FileText, MessageSquare, GripHorizontal, X, Maximize2, Minimize2, MessageCircle } from 'lucide-react';
import BackgroundPicker from './BackgroundPicker';

interface PageSettingsPanelProps {
  page: LandingPage;
  onUpdate: (page: LandingPage) => void;
}

const PageSettingsPanel: React.FC<PageSettingsPanelProps> = ({ page, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Title</label>
        <input 
          type="text" 
          value={page.title} 
          onChange={(e) => onUpdate({ ...page, title: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
          placeholder="Enter page title..."
        />
      </div>

      <div className="space-y-4">
        <BackgroundPicker 
          label="Page Background"
          config={page.settings?.backgroundConfig || { color: 'transparent' }}
          onChange={(cfg) => onUpdate({ 
            ...page, 
            settings: { 
              ...(page.settings || {}), 
              backgroundConfig: cfg
            } as any
          })}
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
            onClick={() => onUpdate({ ...page, settings: { ...(page.settings || {}), glassEffect: !page.settings?.glassEffect } })}
            className={`w-12 h-6 rounded-full transition-all relative ${page.settings?.glassEffect ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${page.settings?.glassEffect ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        
        {page.settings?.glassEffect && (
          <div className="pt-4 space-y-2 border-t border-slate-200 dark:border-zinc-700">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Blur Intensity</label>
            <input 
              type="text" 
              value={page.settings?.blurAmount || '12px'} 
              onChange={(e) => onUpdate({ ...page, settings: { ...(page.settings || {}), blurAmount: e.target.value } })}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold outline-none"
              placeholder="e.g. 8px, 20px"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Layout size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Full Width Layout</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Remove side padding</p>
          </div>
        </div>
        <button 
          onClick={() => onUpdate({ ...page, settings: { ...(page.settings || {}), fullWidth: !page.settings?.fullWidth } })}
          className={`w-12 h-6 rounded-full transition-all relative ${page.settings?.fullWidth ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${page.settings?.fullWidth ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <EyeOff size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Hide Navbar</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Hide main site navigation</p>
          </div>
        </div>
        <button 
          onClick={() => onUpdate({ ...page, settings: { ...(page.settings || {}), hideNavbar: !page.settings?.hideNavbar } })}
          className={`w-12 h-6 rounded-full transition-all relative ${page.settings?.hideNavbar ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${page.settings?.hideNavbar ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      {!page.settings?.hideNavbar && (
        <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Settings2 size={16} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Navbar Customization</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Navbar Theme</label>
              <select 
                value={page.settings?.navbarSettings?.theme || 'auto'} 
                onChange={(e) => onUpdate({ 
                  ...page, 
                  settings: { 
                    ...(page.settings || {}), 
                    navbarSettings: { ...(page.settings?.navbarSettings || {}), theme: e.target.value as any } 
                  } 
                })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold outline-none"
              >
                <option value="auto">Auto (Based on Page)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Custom Logo URL</label>
              <ImageUpload 
                value={page.settings?.navbarSettings?.logoUrl || ''} 
                onChange={(url) => onUpdate({ 
                  ...page, 
                  settings: { 
                    ...(page.settings || {}), 
                    navbarSettings: { ...(page.settings?.navbarSettings || {}), logoUrl: url } 
                  } 
                })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Background</label>
                <input 
                  type="color" 
                  value={page.settings?.navbarSettings?.isScrolledBg || '#ffffff'} 
                  onChange={(e) => onUpdate({ 
                    ...page, 
                    settings: { 
                      ...(page.settings || {}), 
                      navbarSettings: { ...(page.settings?.navbarSettings || {}), isScrolledBg: e.target.value } 
                    } 
                  })}
                  className="w-full h-8 rounded-lg border-none cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Text Color</label>
                <input 
                  type="color" 
                  value={page.settings?.navbarSettings?.isScrolledText || '#000000'} 
                  onChange={(e) => onUpdate({ 
                    ...page, 
                    settings: { 
                      ...(page.settings || {}), 
                      navbarSettings: { ...(page.settings?.navbarSettings || {}), isScrolledText: e.target.value } 
                    } 
                  })}
                  className="w-full h-8 rounded-lg border-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">WhatsApp Button</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Show in navbar</p>
                </div>
              </div>
              <button 
                onClick={() => onUpdate({ 
                  ...page, 
                  settings: { 
                    ...(page.settings || {}), 
                    navbarSettings: { 
                      ...(page.settings?.navbarSettings || {}), 
                      showWhatsapp: page.settings?.navbarSettings?.showWhatsapp === false ? true : false 
                    } 
                  } 
                })}
                className={`w-12 h-6 rounded-full transition-all relative ${page.settings?.navbarSettings?.showWhatsapp !== false ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${page.settings?.navbarSettings?.showWhatsapp !== false ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {page.settings?.navbarSettings?.showWhatsapp !== false && (
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Custom WhatsApp Number</label>
                <input 
                  type="text" 
                  value={page.settings?.navbarSettings?.whatsappNumber || ''} 
                  onChange={(e) => onUpdate({ 
                    ...page, 
                    settings: { 
                      ...(page.settings || {}), 
                      navbarSettings: { 
                        ...(page.settings?.navbarSettings || {}), 
                        whatsappNumber: e.target.value 
                      } 
                    } 
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold outline-none"
                  placeholder="e.g. 971501234567"
                />
                <p className="text-[8px] font-medium text-slate-400 italic">Leave empty to use default number</p>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Navbar Menu Items</label>
              <button 
                onClick={() => {
                  const newLink = { id: Date.now().toString(), label: 'New Link', url: '/', order: (page.settings?.navbarSettings?.links?.length || 0) };
                  onUpdate({
                    ...page,
                    settings: {
                      ...(page.settings || {}),
                      navbarSettings: {
                        ...(page.settings?.navbarSettings || {}),
                        links: [...(page.settings?.navbarSettings?.links || []), newLink]
                      }
                    }
                  });
                }}
                className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {(page.settings?.navbarSettings?.links || []).sort((a, b) => a.order - b.order).map((link, index) => (
                <div key={link.id} className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Item #{index + 1}</span>
                    <button 
                      onClick={() => {
                        onUpdate({
                          ...page,
                          settings: {
                            ...(page.settings || {}),
                            navbarSettings: {
                              ...(page.settings?.navbarSettings || {}),
                              links: page.settings?.navbarSettings?.links?.filter(l => l.id !== link.id)
                            }
                          }
                        });
                      }}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      onUpdate({
                        ...page,
                        settings: {
                          ...(page.settings || {}),
                          navbarSettings: {
                            ...(page.settings?.navbarSettings || {}),
                            links: page.settings?.navbarSettings?.links?.map(l => l.id === link.id ? { ...l, label: e.target.value } : l)
                          }
                        }
                      });
                    }}
                    placeholder="Label"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold outline-none"
                  />
                  <input 
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      onUpdate({
                        ...page,
                        settings: {
                          ...(page.settings || {}),
                          navbarSettings: {
                            ...(page.settings?.navbarSettings || {}),
                            links: page.settings?.navbarSettings?.links?.map(l => l.id === link.id ? { ...l, url: e.target.value } : l)
                          }
                        }
                      });
                    }}
                    placeholder="URL (e.g. /#services or https://...)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold outline-none"
                  />
                </div>
              ))}
              {(page.settings?.navbarSettings?.links || []).length === 0 && (
                <p className="text-[8px] font-bold text-slate-400 text-center py-2 uppercase tracking-widest">Using default site menu</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageSettingsPanel;
