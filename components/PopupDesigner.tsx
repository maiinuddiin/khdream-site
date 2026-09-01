import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Image, Type, Camera, Send, Landmark, FileText, ChevronRight, Calendar, Star, ArrowRight, ShieldCheck, Clock, Zap, Globe, Plane, MapPin, Compass, Hotel, Youtube, User, Mail, Share2, Trash2, GripVertical, Settings2, Check, X, Sliders, List, Plus, Box, Code, Quote, CheckCircle2, Video, Play, Eye, EyeOff, Layers, MessageCircle, Maximize, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Palette, Square, Circle, Move, RotateCw } from 'lucide-react';
import { CustomPopup, LandingPageBlock, useCMS, LandingPageSection } from '../context/CMSContext';
import { motion, AnimatePresence } from 'framer-motion';
import RichTextEditor from './RichTextEditor';
import ImageUpload from './ImageUpload';
import AbstractBackground from './AbstractBackground';
import BlockContent from './BlockContent';
import SectionPropertiesPanel from './SectionPropertiesPanel';
import BlockPropertiesPanel from './BlockPropertiesPanel';
import { debounce } from 'lodash';

interface PopupDesignerProps {
  popup: CustomPopup;
  onBack: () => void;
  onUpdate: (popup: CustomPopup, shouldSave?: boolean) => void;
}

const PopupDesigner: React.FC<PopupDesignerProps> = ({ popup: initialPopup, onBack, onUpdate }) => {
  const { data, saveChanges } = useCMS();
  const [popup, setPopup] = useState<CustomPopup>(initialPopup);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'animation'>('content');
  const [showPopupSettings, setShowPopupSettings] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isUnsaved, setIsUnsaved] = useState(false);

  // Buffer and debounce onUpdate propagation to the high-overhead parent main console
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const debouncedOnUpdate = useMemo(() => {
    return debounce((p: CustomPopup) => {
      onUpdateRef.current(p);
    }, 300);
  }, []);

  useEffect(() => {
    setPopup(initialPopup);
    setIsUnsaved(false);
    return () => {
      debouncedOnUpdate.cancel();
    };
  }, [initialPopup.id, debouncedOnUpdate]);

  const updatePopup = (updatedPopup: CustomPopup, immediate = false) => {
    setPopup(updatedPopup);
    setIsUnsaved(true);
    if (immediate) {
      debouncedOnUpdate.cancel();
      onUpdateRef.current(updatedPopup);
    } else {
      debouncedOnUpdate(updatedPopup);
    }
  };

  const handlePublish = async () => {
    try {
      const updatedPopup = { ...popup, isPublished: true };
      debouncedOnUpdate.cancel();
      onUpdateRef.current(updatedPopup, true);
      setIsUnsaved(false);
    } catch (error) {
      console.error("Failed to publish:", error);
      alert("Failed to publish changes. Please try again.");
    }
  };

  const handleSaveDraft = async () => {
    try {
      debouncedOnUpdate.cancel();
      onUpdateRef.current(popup, true);
      setIsUnsaved(false);
    } catch (error) {
      console.error("Failed to save draft:", error);
      alert("Failed to save draft. Please try again.");
    }
  };

  const toggleAddBlock = () => {
    setShowAddBlock(!showAddBlock);
    setShowPopupSettings(false);
    setActiveBlockId(null);
    setActiveSectionId(null);
  };

  const togglePopupSettings = () => {
    setShowPopupSettings(!showPopupSettings);
    setShowAddBlock(false);
    setActiveBlockId(null);
    setActiveSectionId(null);
  };

  const selectBlock = (blockId: string, sectionId: string) => {
    setActiveBlockId(blockId);
    setActiveSectionId(sectionId);
    setShowAddBlock(false);
    setShowPopupSettings(false);
    setActiveTab('content');
  };

  const selectSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setActiveBlockId(null);
    setShowAddBlock(false);
    setShowPopupSettings(false);
  };

  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const sections = popup.sections || [];

  const addSection = () => {
    const newSection: LandingPageSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      order: sections.length,
      settings: {
        backgroundColor: '#ffffff',
        paddingTop: '2rem',
        paddingBottom: '2rem',
        fullWidth: true,
        containerWidth: 'full'
      },
      blocks: []
    };
    updatePopup({ ...popup, sections: [...sections, newSection] }, true);
    setActiveSectionId(newSection.id);
    setActiveBlockId(null);
  };

  const updateSection = (id: string, updates: any) => {
    updatePopup({
      ...popup,
      sections: sections.map(s => s.id === id ? { ...s, ...updates } : s)
    }, false);
  };

  const removeSection = (id: string) => {
    updatePopup({
      ...popup,
      sections: sections.filter(s => s.id !== id)
    }, true);
    if (activeSectionId === id) setActiveSectionId(null);
  };

  const moveBlock = (blockId: string, fromSectionId: string, toSectionId: string) => {
    if (fromSectionId === toSectionId) return;

    const fromSection = sections.find(s => s.id === fromSectionId);
    const toSection = sections.find(s => s.id === toSectionId);
    if (!fromSection || !toSection) return;

    const block = fromSection.blocks.find(b => b.id === blockId);
    if (!block) return;

    const movedBlock = {
      ...block,
      layout: { ...block.layout, x: 0, y: Infinity }
    };

    updatePopup({
      ...popup,
      sections: sections.map(s => {
        if (s.id === fromSectionId) {
          return { ...s, blocks: s.blocks.filter(b => b.id !== blockId) };
        }
        if (s.id === toSectionId) {
          return { ...s, blocks: [...s.blocks, movedBlock] };
        }
        return s;
      })
    }, true);
    setActiveBlockId(blockId);
    setActiveSectionId(toSectionId);
  };

  const addBlock = (type: string, sectionId: string, parentId?: string) => {
    const newBlock: LandingPageBlock = {
      id: `block-${Date.now()}`,
      type,
      parentId,
      content: type === 'text' ? '<h2>Popup Offer Title</h2><p>Describe your high-converting special offer here...</p>' : 
               type === 'hero' ? { title: 'Special Headline', subtitle: 'Hurry up! Limited offer', bgUrl: '', buttonText: 'Claim Now', link: '', buttonType: 'link', whatsapp: '', phone: '' } :
               type === 'button' ? { text: 'Claim Offer', link: '', type: 'link', whatsapp: '', phone: '', alignment: 'center' } :
               type === 'image' ? { url: '', caption: '' } :
               type === 'video' ? { url: '', poster: '', autoplay: true, loop: true, muted: true } :
               type === 'cta' ? { title: 'Limited Time Deal', buttonText: 'Secure Spot', link: '', buttonType: 'whatsapp', whatsapp: '', phone: '' } :
               type === 'slider' ? { images: [] } :
               type === 'features' ? { items: [{ title: 'Exclusive Access', desc: 'Secure premium visa consulting', icon: 'ShieldCheck' }] } :
               type === 'stats' ? { items: [{ label: 'Satisfied Users', value: '4.8★' }] } :
               type === 'container' ? { backgroundColor: '#f8fafc', padding: 16, borderRadius: 24, isClickable: false, link: '' } :
               type === 'html' ? { code: '<div style="text-align:center;">Custom HTML Widget</div>', css: '', js: '' } : {},
      layout: {
        x: 0,
        y: Infinity,
        w: parentId ? 6 : 12,
        h: type === 'hero' ? 6 : type === 'text' ? 4 : type === 'slider' ? 5 : type === 'container' ? 3 : type === 'video' ? 6 : 3
      }
    };

    updatePopup({
      ...popup,
      sections: sections.map(s => s.id === sectionId ? { ...s, blocks: [...s.blocks, newBlock] } : s)
    }, true);
    setActiveBlockId(newBlock.id);
    setActiveSectionId(sectionId);
  };

  const updateBlock = (blockId: string, sectionId: string, content: any) => {
    updatePopup({
      ...popup,
      sections: sections.map(s => s.id === sectionId ? {
        ...s,
        blocks: s.blocks.map(b => b.id === blockId ? { ...b, content } : b)
      } : s)
    }, false);
  };

  const removeBlock = (blockId: string, sectionId: string) => {
    updatePopup({
      ...popup,
      sections: sections.map(s => s.id === sectionId ? {
        ...s,
        blocks: s.blocks.filter(b => b.id !== blockId)
      } : s)
    }, true);
    if (activeBlockId === blockId) setActiveBlockId(null);
  };

  const updateBlockStyles = (blockId: string, sectionId: string, styles: any) => {
    updatePopup({
      ...popup,
      sections: sections.map(s => s.id === sectionId ? {
        ...s,
        blocks: s.blocks.map(b => b.id === blockId ? { ...b, styles: { ...(b.styles || {}), ...styles } } : b)
      } : s)
    }, false);
  };

  const updateBlockAnimation = (blockId: string, sectionId: string, animation: any) => {
    updatePopup({
      ...popup,
      sections: sections.map(s => s.id === sectionId ? {
        ...s,
        blocks: s.blocks.map(b => b.id === blockId ? { ...b, animation: { ...(b.animation || {}), ...animation } } : b)
      } : s)
    }, false);
  };

  const getColSpanClass = (w: number) => {
    switch (w) {
      case 1: return 'col-span-1';
      case 2: return 'col-span-2';
      case 3: return 'col-span-3';
      case 4: return 'col-span-4';
      case 5: return 'col-span-5';
      case 6: return 'col-span-6';
      case 7: return 'col-span-7';
      case 8: return 'col-span-8';
      case 9: return 'col-span-9';
      case 10: return 'col-span-10';
      case 11: return 'col-span-11';
      default: return 'col-span-12';
    }
  };

  const getAnimationVariants = (type: string) => {
    switch (type) {
      case 'fade': return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      case 'slideUp': return { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
      case 'slideDown': return { hidden: { opacity: 0, y: -30 }, visible: { opacity: 1, y: 0 } };
      case 'slideLeft': return { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } };
      case 'slideRight': return { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } };
      case 'zoomIn': return { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } };
      case 'zoomOut': return { hidden: { opacity: 0, scale: 1.05 }, visible: { opacity: 1, scale: 1 } };
      default: return { hidden: {}, visible: {} };
    }
  };

  // Safe fetch block
  const selectedBlock = useMemo(() => {
    if (!activeBlockId || !activeSectionId) return null;
    const s = sections.find(s => s.id === activeSectionId);
    return s ? s.blocks.find(b => b.id === activeBlockId) || null : null;
  }, [activeBlockId, activeSectionId, sections]);

  // Safe fetch section
  const selectedSection = useMemo(() => {
    if (!activeSectionId || activeBlockId) return null;
    return sections.find(s => s.id === activeSectionId) || null;
  }, [activeSectionId, activeBlockId, sections]);

  const popupWidthClass = (() => {
    const w = popup.settings?.width || 'md';
    switch (w) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case 'full': return 'max-w-full m-4';
      default: return 'max-w-xl'; // md
    }
  })();

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050508] text-slate-900 dark:text-slate-100 flex flex-col font-montserrat">
      {/* Top Banner Control */}
      <div className="border-b border-slate-200 dark:border-zinc-850 px-6 py-4 flex items-center justify-between bg-white dark:bg-zinc-900 shadow-sm relative z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              debouncedOnUpdate.flush();
              onBack();
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black uppercase tracking-wider">{popup.title || 'Untitled Popup'}</h1>
              {isUnsaved && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved changes" />
              )}
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Trigger Link Target: <span className="text-primary font-mono lowercase">popup:{popup.slug || popup.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
              isPreviewMode 
                ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' 
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-slate-300'
            }`}
          >
            {isPreviewMode ? <EyeOff size={12} /> : <Eye size={12} />}
            {isPreviewMode ? 'Exit Preview' : 'Interactive Preview'}
          </button>

          <button 
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-7.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-700 dark:text-zinc-300"
          >
            Save Draft
          </button>

          <button 
            onClick={handlePublish}
            className="px-5 py-2 bg-primary hover:brightness-110 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-primary/25"
          >
            Publish Live
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar - Only when not in preview */}
        {!isPreviewMode && (
          <div className="w-72 border-r border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 overflow-y-auto p-5 flex flex-col space-y-6 relative z-20">
            <div>
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Popup Configurator</h2>
              <div className="space-y-4">
                <button 
                  onClick={togglePopupSettings}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                    showPopupSettings 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                      : 'border-slate-150 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                      <Settings2 size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white group-hover:text-primary transition-colors">Frame & Backdrop</p>
                      <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Popup Dimensions & Blurs</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={toggleAddBlock}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all group lg:min-h-[72px] ${
                    showAddBlock 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                      : 'border-slate-150 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                      <Plus size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white group-hover:text-primary transition-colors">Insert Content Block</p>
                      <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Drag or click to place layout</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={addSection}
                  className="w-full py-4 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 hover:border-primary text-slate-400 hover:text-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-primary/5"
                >
                  <Plus size={14} /> Add Layout Row
                </button>
              </div>
            </div>

            {/* Render block list when Add Block is active */}
            {showAddBlock && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Available Row Blocks</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'text', label: 'Rich Text', icon: Type },
                    { type: 'image', label: 'Single Image', icon: Image },
                    { type: 'button', label: 'Action Button', icon: Send },
                    { type: 'video', label: 'Video Embed', icon: Video },
                    { type: 'slider', label: 'Photo Slider', icon: Image },
                    { type: 'features', label: 'Feature Tags', icon: Zap },
                    { type: 'stats', label: 'Stat Counters', icon: Star },
                    { type: 'container', label: 'Styled Box', icon: Box },
                    { type: 'html', label: 'Custom HTML', icon: Code },
                  ].map(item => (
                    <div 
                      key={item.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('blockType', item.type);
                      }}
                      onClick={() => {
                        // Add to first section or create one if none
                        if (sections.length === 0) {
                          const newSecId = `section-${Date.now()}`;
                          const newSec: LandingPageSection = {
                            id: newSecId,
                            title: 'Main Section',
                            order: 0,
                            settings: { backgroundColor: '#ffffff', paddingTop: '1.5rem', paddingBottom: '1.5rem', fullWidth: true, containerWidth: 'full' },
                            blocks: []
                          };
                          updatePopup({
                            ...popup,
                            sections: [newSec]
                          });
                          addBlock(item.type, newSecId);
                        } else {
                          addBlock(item.type, sections[0].id);
                        }
                      }}
                      className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-150 dark:border-zinc-700 hover:border-primary hover:bg-primary/5 transition-all text-center cursor-grab active:cursor-grabbing group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 shadow-sm mx-auto flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors mb-2">
                        <item.icon size={16} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200 block">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show Popup settings panel style parameters */}
            {showPopupSettings && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-5">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Popup Attributes</h3>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Popup Internal Title</label>
                  <input 
                    type="text"
                    value={popup.title || ''}
                    onChange={(e) => updatePopup({ ...popup, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 px-4 py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="E.g. Visa Special Support Popup"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Slug Identifier (Link Trigger)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-xs text-slate-400 font-bold">popup:</span>
                    <input 
                      type="text"
                      value={popup.slug || ''}
                      onChange={(e) => updatePopup({ ...popup, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 pl-16 pr-4 py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="special-offer"
                    />
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider ml-1 mt-1">When any button is linked to <span className="text-primary font-mono lowercase">popup:{popup.slug || popup.id}</span>, this modal triggers.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Popup Visual Width</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['sm', 'md', 'lg', 'xl', 'full'] as const).map(w => (
                      <button
                        key={w}
                        onClick={() => updatePopup({ ...popup, settings: { ...(popup.settings || {}), width: w } })}
                        className={`py-2 rounded-lg text-[8px] font-black uppercase border transition-all ${
                          (popup.settings?.width || 'md') === w
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-slate-50 dark:bg-zinc-800 text-slate-400 border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Close Button</p>
                    <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Show closing X icon</p>
                  </div>
                  <button 
                    onClick={() => updatePopup({ ...popup, settings: { ...(popup.settings || {}), showCloseButton: popup.settings?.showCloseButton === false ? true : false } })}
                    className={`w-10 h-5 rounded-full transition-all relative ${popup.settings?.showCloseButton !== false ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${popup.settings?.showCloseButton !== false ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Backdrop Blur</p>
                    <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Blur main page background</p>
                  </div>
                  <button 
                    onClick={() => updatePopup({ ...popup, settings: { ...(popup.settings || {}), backdropBlur: popup.settings?.backdropBlur === false ? true : false } })}
                    className={`w-10 h-5 rounded-full transition-all relative ${popup.settings?.backdropBlur !== false ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${popup.settings?.backdropBlur !== false ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Overlay Tint Color</label>
                  <input 
                    type="color"
                    value={popup.settings?.backdropColor || '#000000'}
                    onChange={(e) => updatePopup({ ...popup, settings: { ...(popup.settings || {}), backdropColor: e.target.value } })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 h-10 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Center Live Sandbox Section */}
        <div className="flex-1 overflow-auto bg-[#121216]/95 relative flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-0">
          {/* Virtual background backdrop */}
          <div 
            className="absolute inset-0 transition-all duration-300"
            style={{
              backgroundColor: popup.settings?.backdropColor || 'rgba(0,0,0,0.65)',
              backdropFilter: popup.settings?.backdropBlur !== false ? 'blur(8px)' : 'none'
            }}
          />

          {/* Centered Modal Container */}
          <div 
            className={`w-full relative shadow-2xl rounded-[40px] border border-slate-200 dark:border-zinc-800 overflow-hidden text-slate-900 dark:text-white transition-all duration-300 ease-out z-10 bg-white dark:bg-zinc-950 ${popupWidthClass}`}
            style={{
              maxHeight: '94vh',
              overflowY: 'auto'
            }}
          >
            {/* Close button placement inside builder */}
            {popup.settings?.showCloseButton !== false && (
              <div className="absolute top-5 right-5 z-50">
                <button className="p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded-full text-slate-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors cursor-not-allowed">
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            )}

            {/* Render Empty State Helper */}
            {sections.length === 0 && (
              <div className="py-24 px-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Layers size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-zinc-200">Themed Canvas is Empty</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Insert a layout row structure to drop action blocks inside</p>
                </div>
                {!isPreviewMode && (
                  <button 
                    onClick={addSection}
                    className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 text"
                  >
                    Insert First Row
                  </button>
                )}
              </div>
            )}

            {/* Map Sections */}
            {sections.map(section => (
              <div 
                key={section.id}
                onClick={() => !isPreviewMode && selectSection(section.id)}
                className={`relative transition-all ${!isPreviewMode ? 'hover:outline-2 hover:outline-dashed hover:outline-primary cursor-pointer' : ''} ${
                  !isPreviewMode && activeSectionId === section.id && !activeBlockId ? 'outline-2 outline-solid outline-primary' : ''
                }`}
              >
                {/* Visual section action toolbar inside builder */}
                {!isPreviewMode && activeSectionId === section.id && !activeBlockId && (
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 p-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg z-55">
                    <span className="text-[8px] font-black text-slate-400 uppercase px-2 tracking-wider">Row Layout</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                      className="p-1 px-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}

                <section 
                  onDragOver={(e) => {
                    if (!isPreviewMode) {
                      e.preventDefault();
                      setDragOverSectionId(section.id);
                    }
                  }}
                  onDragLeave={() => setDragOverSectionId(null)}
                  onDrop={(e) => {
                    if (!isPreviewMode) {
                      e.preventDefault();
                      setDragOverSectionId(null);
                      const blockType = e.dataTransfer.getData('blockType');
                      if (blockType) addBlock(blockType, section.id);
                    }
                  }}
                  className={`relative w-full overflow-hidden transition-all py-6 md:py-8 ${dragOverSectionId === section.id ? 'bg-primary/5' : ''}`}
                  style={{
                    backgroundColor: section.settings?.backgroundColor || 'transparent',
                    color: section.settings?.textColor || 'inherit',
                  }}
                >
                  <div className="max-w-7xl mx-auto px-4">
                    {section.blocks.length === 0 ? (
                      <div className="py-8 border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drop elements here</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-12 gap-4 w-full items-start">
                        {[...section.blocks].sort((a, b) => {
                          const ay = a.layout?.y ?? 0;
                          const ax = a.layout?.x ?? 0;
                          const by = b.layout?.y ?? 0;
                          const bx = b.layout?.x ?? 0;
                          const valA = ay === Infinity ? 1000000 + ax : ay * 12 + ax;
                          const valB = by === Infinity ? 1000000 + bx : by * 12 + bx;
                          return valA - valB;
                        }).map(block => {
                          const w = block.layout?.w ?? 12;
                          const h = block.layout?.h ?? 4;
                          const isSelected = activeBlockId === block.id;

                          return (
                            <div 
                              key={block.id}
                              onClick={(e) => {
                                if (isPreviewMode) return;
                                e.stopPropagation();
                                selectBlock(block.id, section.id);
                              }}
                              className={`${getColSpanClass(w)} relative transition-all rounded-[24px] ${
                                !isPreviewMode ? 'hover:outline-2 hover:outline-dashed hover:outline-primary cursor-pointer' : ''
                              } ${!isPreviewMode && isSelected ? 'ring-4 ring-primary scale-[0.99] z-45' : ''}`}
                              style={{ minHeight: `${h * 40}px` }}
                            >
                              {/* Block options header in builder */}
                              {!isPreviewMode && isSelected && (
                                <div className="absolute -top-3 left-4 flex items-center gap-1 p-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-1.5">
                                  <span className="text-[7.5px] font-black text-slate-400 uppercase px-1.5 tracking-wider">{block.type} Element</span>
                                  <div className="w-[1px] h-3 bg-slate-150 dark:bg-zinc-800" />
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); removeBlock(block.id, section.id); }}
                                    className="p-1 text-slate-400 hover:text-red-500 rounded-lg"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              )}

                              <div 
                                className="w-full h-full"
                                style={{
                                  backgroundColor: block.styles?.backgroundColor,
                                  color: block.styles?.textColor,
                                  borderRadius: block.styles?.borderRadius,
                                  padding: block.styles?.padding,
                                }}
                              >
                                <BlockContent block={block} page={popup as any} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            ))}
          </div>
        </div>

        {/* Right Properties Panel sidebar - Only when element selected */}
        {!isPreviewMode && (activeBlockId || activeSectionId) && (
          <div className="w-72 border-l border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 overflow-y-auto p-5 flex flex-col space-y-6 relative z-20">
            {selectedBlock ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Block Settings</span>
                    <h3 className="text-[11px] font-black uppercase text-slate-800 dark:text-zinc-200">{selectedBlock.type} Properties</h3>
                  </div>
                  <button onClick={() => { setActiveBlockId(null); setActiveSectionId(null); }} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400">
                    <X size={14} />
                  </button>
                </div>

                <BlockPropertiesPanel
                  block={selectedBlock}
                  sectionId={activeSectionId!}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  updateBlock={updateBlock}
                  updateBlockStyles={updateBlockStyles}
                  updateBlockAnimation={updateBlockAnimation}
                  removeBlock={removeBlock}
                  setActiveBlockId={setActiveBlockId}
                />
              </div>
            ) : selectedSection ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Section Context</span>
                    <h3 className="text-[11px] font-black uppercase text-slate-800 dark:text-zinc-200">Row Customizer</h3>
                  </div>
                  <button onClick={() => setActiveSectionId(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400">
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Background Color</label>
                    <input 
                      type="color"
                      value={selectedSection.settings?.backgroundColor || '#ffffff'}
                      onChange={(e) => updateSection(selectedSection.id, { 
                        settings: { ...(selectedSection.settings || {}), backgroundColor: e.target.value }
                      })}
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Row Content Color Scheme</label>
                    <input 
                      type="color"
                      value={selectedSection.settings?.textColor || '#000000'}
                      onChange={(e) => updateSection(selectedSection.id, { 
                        settings: { ...(selectedSection.settings || {}), textColor: e.target.value }
                      })}
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupDesigner;
