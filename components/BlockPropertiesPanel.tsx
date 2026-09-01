import React from 'react';
import { LandingPageBlock } from '../context/CMSContext';
import ImageUpload from './ImageUpload';
import RichTextEditor from './RichTextEditor';
import { Palette, Type, Zap, Layout, Sliders, List, BarChart, Box, Code, Video, Send, ImageIcon, Maximize, Globe, FileText, MessageSquare, Trash2, Plus, Star, Facebook, Instagram, Youtube, Twitter, Linkedin, Building2, Phone, MapPin, HelpCircle, Share2, Mail } from 'lucide-react';

interface BlockPropertiesPanelProps {
  block: LandingPageBlock;
  sectionId: string;
  activeTab: 'content' | 'design' | 'animation';
  setActiveTab: (tab: 'content' | 'design' | 'animation') => void;
  updateBlock: (blockId: string, sectionId: string, content: any) => void;
  updateBlockStyles: (blockId: string, sectionId: string, styles: any) => void;
  updateBlockAnimation: (blockId: string, sectionId: string, animation: any) => void;
  removeBlock: (blockId: string, sectionId: string) => void;
  setActiveBlockId: (blockId: string | null) => void;
}

const BlockPropertiesPanel: React.FC<BlockPropertiesPanelProps> = ({ 
  block, 
  sectionId, 
  activeTab, 
  setActiveTab, 
  updateBlock, 
  updateBlockStyles, 
  updateBlockAnimation,
  removeBlock,
  setActiveBlockId
}) => {
  const updateContent = (updates: any) => {
    updateBlock(block.id, sectionId, { ...block.content, ...updates });
  };

  const updateStyles = (updates: any) => {
    updateBlockStyles(block.id, sectionId, updates);
  };

  const updateAnimation = (updates: any) => {
    updateBlockAnimation(block.id, sectionId, updates);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
        {(['content', 'design', 'animation'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-grow py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${
              activeTab === tab 
                ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'content' && (
        <div className="space-y-4">
          {block.type === 'text' && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Text Content</label>
              <RichTextEditor 
                value={block.content} 
                onChange={(content) => updateBlock(block.id, sectionId, content)} 
              />
            </div>
          )}

          {block.type === 'hero' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Title</label>
                <input 
                  type="text" 
                  value={block.content.title} 
                  onChange={(e) => updateContent({ title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subtitle</label>
                <textarea 
                  value={block.content.subtitle} 
                  onChange={(e) => updateContent({ subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none h-20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Background Type</label>
                <select 
                  value={block.content.bgType || 'image'} 
                  onChange={(e) => updateContent({ bgType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="image">Image</option>
                  <option value="video">Video URL</option>
                </select>
              </div>
              {block.content.bgType === 'video' ? (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Background Video URL</label>
                  <input 
                    type="text" 
                    value={block.content.bgVideoUrl || ''} 
                    onChange={(e) => updateContent({ bgVideoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                    placeholder="YouTube, Vimeo or MP4 link"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Background Image</label>
                  <ImageUpload 
                    value={block.content.bgUrl || ''} 
                    onChange={(url) => updateContent({ bgUrl: url })}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Button Text</label>
                  <input 
                    type="text" 
                    value={block.content.buttonText || ''} 
                    onChange={(e) => updateContent({ buttonText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Button Link</label>
                  <input 
                    type="text" 
                    value={block.content.link || ''} 
                    onChange={(e) => updateContent({ link: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {block.type === 'image' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Image</label>
                <ImageUpload 
                  value={block.content.url} 
                  onChange={(url) => updateContent({ url })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Caption</label>
                <input 
                  type="text" 
                  value={block.content.caption} 
                  onChange={(e) => updateContent({ caption: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                />
              </div>
            </div>
          )}

          {block.type === 'video' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Video URL</label>
                <input 
                  type="text" 
                  value={block.content.url} 
                  onChange={(e) => updateContent({ url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                  placeholder="YouTube, Vimeo or MP4 link"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => updateContent({ autoplay: !block.content.autoplay })}
                  className={`p-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${block.content.autoplay ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400'}`}
                >
                  Autoplay
                </button>
                <button 
                  onClick={() => updateContent({ loop: !block.content.loop })}
                  className={`p-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${block.content.loop ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400'}`}
                >
                  Loop
                </button>
                <button 
                  onClick={() => updateContent({ muted: !block.content.muted })}
                  className={`p-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${block.content.muted ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400'}`}
                >
                  Muted
                </button>
              </div>
            </div>
          )}

          {block.type === 'button' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Button Text</label>
                <input 
                  type="text" 
                  value={block.content.text} 
                  onChange={(e) => updateContent({ text: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Link</label>
                <input 
                  type="text" 
                  value={block.content.link} 
                  onChange={(e) => updateContent({ link: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alignment</label>
                <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      onClick={() => updateContent({ alignment: align })}
                      className={`flex-grow py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${
                        block.content.alignment === align 
                          ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {block.type === 'features' && (
            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feature Items</label>
              {(block.content.items || []).map((item: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-4 relative group">
                  <button 
                    onClick={() => {
                      const newItems = [...block.content.items];
                      newItems.splice(idx, 1);
                      updateContent({ items: newItems });
                    }}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                  <input 
                    type="text" 
                    value={item.title} 
                    onChange={(e) => {
                      const newItems = [...block.content.items];
                      newItems[idx].title = e.target.value;
                      updateContent({ items: newItems });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-black uppercase tracking-tight outline-none"
                    placeholder="Title"
                  />
                  <textarea 
                    value={item.desc} 
                    onChange={(e) => {
                      const newItems = [...block.content.items];
                      newItems[idx].desc = e.target.value;
                      updateContent({ items: newItems });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold outline-none h-20"
                    placeholder="Description"
                  />
                </div>
              ))}
              <button 
                onClick={() => updateContent({ items: [...(block.content.items || []), { title: 'New Feature', desc: 'Description', icon: 'Zap' }] })}
                className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={12} /> Add Feature
              </button>
            </div>
          )}

          {block.type === 'stats' && (
            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statistic Items</label>
              {(block.content.items || []).map((item: any, idx: number) => (
                <div key={idx} className="grid grid-cols-2 gap-2 p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 relative group">
                  <button 
                    onClick={() => {
                      const newItems = [...block.content.items];
                      newItems.splice(idx, 1);
                      updateContent({ items: newItems });
                    }}
                    className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-zinc-900 shadow-lg rounded-full text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Trash2 size={10} />
                  </button>
                  <input 
                    type="text" 
                    value={item.label} 
                    onChange={(e) => {
                      const newItems = [...block.content.items];
                      newItems[idx].label = e.target.value;
                      updateContent({ items: newItems });
                    }}
                    className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-black uppercase tracking-tight outline-none"
                    placeholder="Label"
                  />
                  <input 
                    type="text" 
                    value={item.value} 
                    onChange={(e) => {
                      const newItems = [...block.content.items];
                      newItems[idx].value = e.target.value;
                      updateContent({ items: newItems });
                    }}
                    className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-black uppercase tracking-tight outline-none"
                    placeholder="Value"
                  />
                </div>
              ))}
              <button 
                onClick={() => updateContent({ items: [...(block.content.items || []), { label: 'New Stat', value: '100+' }] })}
                className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={12} /> Add Statistic
              </button>
            </div>
          )}

          {block.type === 'container' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Background Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={block.content.backgroundColor || '#ffffff'} 
                    onChange={(e) => updateContent({ backgroundColor: e.target.value })}
                    className="w-12 h-12 rounded-xl border-none cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={block.content.backgroundColor || '#ffffff'} 
                    onChange={(e) => updateContent({ backgroundColor: e.target.value })}
                    className="flex-grow px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono uppercase"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Padding</label>
                  <input 
                    type="number" 
                    value={block.content.padding || 0} 
                    onChange={(e) => updateContent({ padding: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Border Radius</label>
                  <input 
                    type="number" 
                    value={block.content.borderRadius || 0} 
                    onChange={(e) => updateContent({ borderRadius: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {block.type === 'html' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HTML Code</label>
                <textarea 
                  value={block.content.code} 
                  onChange={(e) => updateContent({ code: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-[10px] font-mono outline-none h-48"
                  spellCheck={false}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CSS Styles</label>
                <textarea 
                  value={block.content.css} 
                  onChange={(e) => updateContent({ css: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-[10px] font-mono outline-none h-32"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {block.type === 'onelink' && (
            <div className="space-y-6 block">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Social Group Hub Title</label>
                <input 
                  type="text" 
                  value={block.content.title || ''} 
                  onChange={(e) => updateContent({ title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                  placeholder="Connect With Our Socials"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Social Media Links</label>
                {(block.content.links || []).map((lnk: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-3 relative group/lnk">
                    <button 
                      onClick={() => {
                        const newLinks = [...block.content.links];
                        newLinks.splice(idx, 1);
                        updateContent({ links: newLinks });
                      }}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-150 dark:hover:bg-zinc-700 rounded-lg opacity-0 group-hover/lnk:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                    
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Social Platform</label>
                      <select
                        value={lnk.platform || 'website'}
                        onChange={(e) => {
                          const newLinks = [...block.content.links];
                          newLinks[idx].platform = e.target.value;
                          updateContent({ links: newLinks });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="youtube">YouTube</option>
                        <option value="tiktok">TikTok</option>
                        <option value="twitter">X / Twitter</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="email">Email</option>
                        <option value="website">Custom Website</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Button Label</label>
                      <input 
                        type="text" 
                        value={lnk.label || ''} 
                        onChange={(e) => {
                          const newLinks = [...block.content.links];
                          newLinks[idx].label = e.target.value;
                          updateContent({ links: newLinks });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none"
                        placeholder="e.g. Chat on WhatsApp"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Destination URL</label>
                      <input 
                        type="text" 
                        value={lnk.url || ''} 
                        onChange={(e) => {
                          const newLinks = [...block.content.links];
                          newLinks[idx].url = e.target.value;
                          updateContent({ links: newLinks });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => updateContent({ links: [...(block.content.links || []), { platform: 'whatsapp', label: 'Chat on WhatsApp', url: '' }] })}
                  className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={12} /> Add Social Link
                </button>
              </div>
            </div>
          )}

          {block.type === 'branches' && (
            <div className="space-y-6 block">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Branches Section Title</label>
                <input 
                  type="text" 
                  value={block.content.title || ''} 
                  onChange={(e) => updateContent({ title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                  placeholder="Our Branches"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Offices and Locations</label>
                {(block.content.items || []).map((branch: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-3 relative group/brn">
                    <button 
                      onClick={() => {
                        const newBranches = [...block.content.items];
                        newBranches.splice(idx, 1);
                        updateContent({ items: newBranches });
                      }}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-150 dark:hover:bg-zinc-700 rounded-lg opacity-0 group-hover/brn:opacity-100 transition-opacity animate-fade-in"
                    >
                      <Trash2 size={12} />
                    </button>
                    
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Branch Office Name</label>
                      <input 
                        type="text" 
                        value={branch.name || ''} 
                        onChange={(e) => {
                          const newBranches = [...block.content.items];
                          newBranches[idx].name = e.target.value;
                          updateContent({ items: newBranches });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none"
                        placeholder="e.g. Riyadh Main Office"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Contact Phone / Mobile</label>
                      <input 
                        type="text" 
                        value={branch.phone || ''} 
                        onChange={(e) => {
                          const newBranches = [...block.content.items];
                          newBranches[idx].phone = e.target.value;
                          updateContent({ items: newBranches });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none"
                        placeholder="e.g. +966 50 123 4567"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Physical Address Details</label>
                      <input 
                        type="text" 
                        value={branch.address || ''} 
                        onChange={(e) => {
                          const newBranches = [...block.content.items];
                          newBranches[idx].address = e.target.value;
                          updateContent({ items: newBranches });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none"
                        placeholder="e.g. Olaya Main Street, Riyadh"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Google Map URL</label>
                      <input 
                        type="text" 
                        value={branch.locationUrl || ''} 
                        onChange={(e) => {
                          const newBranches = [...block.content.items];
                          newBranches[idx].locationUrl = e.target.value;
                          updateContent({ items: newBranches });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none"
                        placeholder="e.g. https://maps.google.com/..."
                      />
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => updateContent({ items: [...(block.content.items || []), { name: 'New Branch Office', phone: '', locationUrl: '', address: '' }] })}
                  className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={12} /> Add New Branch
                </button>
              </div>
            </div>
          )}

          {block.type === 'price-list' && (
            <div className="space-y-6 block">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Price List Section Title</label>
                <input 
                  type="text" 
                  value={block.content.title || ''} 
                  onChange={(e) => updateContent({ title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                  placeholder="Common Services Pricing"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Works & Prices</label>
                {(block.content.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-3 relative group/pri">
                    <button 
                      onClick={() => {
                        const newItems = [...block.content.items];
                        newItems.splice(idx, 1);
                        updateContent({ items: newItems });
                      }}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-150 dark:hover:bg-zinc-700 rounded-lg opacity-0 group-hover/pri:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                    
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Service Name / Work Title</label>
                      <input 
                        type="text" 
                        value={item.name || ''} 
                        onChange={(e) => {
                          const newItems = [...block.content.items];
                          newItems[idx].name = e.target.value;
                          updateContent({ items: newItems });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none"
                        placeholder="e.g. Tourist Visa Booking"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Service Description / Spec</label>
                      <textarea 
                        value={item.desc || ''} 
                        onChange={(e) => {
                          const newItems = [...block.content.items];
                          newItems[idx].desc = e.target.value;
                          updateContent({ items: newItems });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none h-16 resize-none"
                        placeholder="e.g. Complete documentation & submission guidance"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Price Tag / Currency</label>
                      <input 
                        type="text" 
                        value={item.price || ''} 
                        onChange={(e) => {
                          const newItems = [...block.content.items];
                          newItems[idx].price = e.target.value;
                          updateContent({ items: newItems });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none"
                        placeholder="e.g. SAR 450"
                      />
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => updateContent({ items: [...(block.content.items || []), { name: 'New Travel Service', desc: '', price: 'SAR 150' }] })}
                  className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={12} /> Add Price Item
                </button>
              </div>
            </div>
          )}

          {block.type === 'faq' && (
            <div className="space-y-6 block">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">FAQ Accordion Section Title</label>
                <input 
                  type="text" 
                  value={block.content.title || ''} 
                  onChange={(e) => updateContent({ title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                  placeholder="Frequently Asked Questions"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Question and Answer Pairs</label>
                {(block.content.items || []).map((faqItem: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-3 relative group/faq">
                    <button 
                      onClick={() => {
                        const newFAQs = [...block.content.items];
                        newFAQs.splice(idx, 1);
                        updateContent({ items: newFAQs });
                      }}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-150 dark:hover:bg-zinc-700 rounded-lg opacity-0 group-hover/faq:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                    
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Question Text</label>
                      <input 
                        type="text" 
                        value={faqItem.q || ''} 
                        onChange={(e) => {
                          const newFAQs = [...block.content.items];
                          newFAQs[idx].q = e.target.value;
                          updateContent({ items: newFAQs });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-black tracking-tight"
                        placeholder="e.g. How long does the tourist visa take?"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Answer Explanation Text</label>
                      <textarea 
                        value={faqItem.a || ''} 
                        onChange={(e) => {
                          const newFAQs = [...block.content.items];
                          newFAQs[idx].a = e.target.value;
                          updateContent({ items: newFAQs });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold h-20 resize-none"
                        placeholder="Detail Answer Description..."
                      />
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => updateContent({ items: [...(block.content.items || []), { q: 'New Question?', a: 'Detail answer explanation here.' }] })}
                  className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={12} /> Add FAQ Item
                </button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to delete this block?')) {
                  removeBlock(block.id, sectionId);
                  setActiveBlockId(null);
                }
              }}
              className="w-full py-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={12} />
              Delete Block
            </button>
          </div>
        </div>
      )}

      {activeTab === 'design' && (
        <div className="space-y-4">
          {block.type !== 'button' && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Background Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={block.styles?.backgroundColor || '#ffffff'} 
                  onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border-none cursor-pointer"
                />
                <input 
                  type="text" 
                  value={block.styles?.backgroundColor || '#ffffff'} 
                  onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
                  className="flex-grow px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono uppercase"
                />
              </div>
            </div>
          )}

          {block.type === 'button' && (
            <>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Button Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={block.styles?.buttonColor || '#000000'} 
                    onChange={(e) => updateStyles({ buttonColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border-none cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={block.styles?.buttonColor || '#000000'} 
                    onChange={(e) => updateStyles({ buttonColor: e.target.value })}
                    className="flex-grow px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono uppercase"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Button Text Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={block.styles?.buttonTextColor || '#ffffff'} 
                    onChange={(e) => updateStyles({ buttonTextColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border-none cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={block.styles?.buttonTextColor || '#ffffff'} 
                    onChange={(e) => updateStyles({ buttonTextColor: e.target.value })}
                    className="flex-grow px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </>
          )}

          {block.type !== 'button' && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Text Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={block.styles?.textColor || '#000000'} 
                  onChange={(e) => updateStyles({ textColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border-none cursor-pointer"
                />
                <input 
                  type="text" 
                  value={block.styles?.textColor || '#000000'} 
                  onChange={(e) => updateStyles({ textColor: e.target.value })}
                  className="flex-grow px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono uppercase"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Padding</label>
              <input 
                type="text" 
                value={block.styles?.padding || ''} 
                onChange={(e) => updateStyles({ padding: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                placeholder="e.g. 20px"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Border Radius</label>
              <input 
                type="text" 
                value={block.styles?.borderRadius || ''} 
                onChange={(e) => updateStyles({ borderRadius: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                placeholder="e.g. 12px"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Text Alignment</label>
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  onClick={() => updateStyles({ textAlign: align })}
                  className={`flex-grow py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    block.styles?.textAlign === align 
                      ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Z-Index</label>
            <input 
              type="number" 
              value={block.styles?.zIndex || 0} 
              onChange={(e) => updateStyles({ zIndex: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
            />
          </div>
        </div>
      )}

      {activeTab === 'animation' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Animation Type</label>
            <select 
              value={block.animation?.type || 'none'} 
              onChange={(e) => updateAnimation({ type: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
            >
              <option value="none">None</option>
              <option value="fade">Fade In</option>
              <option value="slideUp">Slide Up</option>
              <option value="slideDown">Slide Down</option>
              <option value="slideLeft">Slide Left</option>
              <option value="slideRight">Slide Right</option>
              <option value="zoomIn">Zoom In</option>
              <option value="zoomOut">Zoom Out</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration (s)</label>
              <input 
                type="number" 
                step="0.1"
                value={block.animation?.duration || 0.5} 
                onChange={(e) => updateAnimation({ duration: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Delay (s)</label>
              <input 
                type="number" 
                step="0.1"
                value={block.animation?.delay || 0} 
                onChange={(e) => updateAnimation({ delay: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Zap size={14} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white leading-none">Once Only</p>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">Animate only on first view</p>
              </div>
            </div>
            <button 
              onClick={() => updateAnimation({ once: block.animation?.once === false ? true : false })}
              className={`w-10 h-5 rounded-full transition-all relative ${block.animation?.once !== false ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${block.animation?.once !== false ? 'left-5.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockPropertiesPanel;
