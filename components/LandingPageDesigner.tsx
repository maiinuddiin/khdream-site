import React, { useState, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { getYouTubeId, getVimeoId } from '../lib/utils';
import { ArrowLeft, Image, Type, Camera, Send, Landmark, FileText, ChevronRight, Calendar, Star, ArrowRight, ShieldCheck, Clock, Zap, Globe, Plane, MapPin, Compass, Hotel, Youtube, User, Mail, Send as SendIcon, Share2, Trash2, GripVertical, Settings2, Check, X, Sliders, List, BarChart, Briefcase, MessageSquare, Users, Phone, Plus, Box, Code, Quote, CheckCircle2, Video, Play, Eye, EyeOff, Layers, MessageCircle, Maximize, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Palette, Square, Circle, Move, RotateCw, Type as TypeIcon, Layout as LayoutIcon, Image as ImageIcon, MousePointer2 } from 'lucide-react';
import { LandingPage, LandingPageBlock, useCMS } from '../context/CMSContext';
import { motion, AnimatePresence } from 'framer-motion';
import RichTextEditor from './RichTextEditor';
import ImageUpload from './ImageUpload';
import AbstractBackground from './AbstractBackground';
import Navbar from './Navbar';
import DraggablePanel from './DraggablePanel';
import BlockContent from './BlockContent';
import PageSettingsPanel from './PageSettingsPanel';
import SectionPropertiesPanel from './SectionPropertiesPanel';
import BlockPropertiesPanel from './BlockPropertiesPanel';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface LandingPageDesignerProps {
  page: LandingPage;
  onBack: () => void;
  onUpdate: (page: LandingPage, shouldSave?: boolean) => void;
}

const LandingPageDesigner: React.FC<LandingPageDesignerProps> = ({ page: initialPage, onBack, onUpdate }) => {
  const { data, saveChanges } = useCMS();
  const [page, setPage] = useState<LandingPage>(initialPage);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'animation'>('content');
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isUnsaved, setIsUnsaved] = useState(false);

  // Update local page when initialPage changes (e.g. if saved from outside)
  React.useEffect(() => {
    setPage(initialPage);
    setIsUnsaved(false);
  }, [initialPage.id]);

  const handlePublish = async () => {
    try {
      const updatedPage = { ...page, isPublished: true };
      
      // Update local state and context via parent
      onUpdate(updatedPage, true);
      setIsUnsaved(false);
    } catch (error) {
      console.error("Failed to publish:", error);
      alert("Failed to publish changes. Please try again.");
    }
  };

  const handleSaveDraft = async () => {
    try {
      // Update local state and context via parent
      onUpdate(page, true);
      setIsUnsaved(false);
      
      // If we want immediate save even for drafts, we could trigger it here
      // but for now we rely on the parent's dirty state or explicit publish
    } catch (error) {
      console.error("Failed to save draft:", error);
      alert("Failed to save draft. Please try again.");
    }
  };

  const updatePage = (updatedPage: LandingPage) => {
    setPage(updatedPage);
    setIsUnsaved(true);
    onUpdate(updatedPage);
  };

  // Close other panels when one is opened
  const toggleAddBlock = () => {
    setShowAddBlock(!showAddBlock);
    setShowPageSettings(false);
    setActiveBlockId(null);
    setActiveSectionId(null);
  };

  const togglePageSettings = () => {
    setShowPageSettings(!showPageSettings);
    setShowAddBlock(false);
    setActiveBlockId(null);
    setActiveSectionId(null);
  };

  const selectBlock = (blockId: string, sectionId: string) => {
    setActiveBlockId(blockId);
    setActiveSectionId(sectionId);
    setShowAddBlock(false);
    setShowPageSettings(false);
    setActiveTab('content');
  };

  const selectSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setActiveBlockId(null);
    setShowAddBlock(false);
    setShowPageSettings(false);
  };

  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

  const sections = page.sections || [];

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      order: sections.length,
      settings: {
        backgroundColor: '#ffffff',
        paddingTop: '4rem',
        paddingBottom: '4rem',
        fullWidth: false,
        containerWidth: 'max-w-7xl' as const
      },
      blocks: []
    };
    updatePage({ ...page, sections: [...sections, newSection] });
    setActiveSectionId(newSection.id);
    setActiveBlockId(null);
  };

  const updateSection = (id: string, updates: any) => {
    updatePage({
      ...page,
      sections: sections.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const removeSection = (id: string) => {
    updatePage({
      ...page,
      sections: sections.filter(s => s.id !== id)
    });
    if (activeSectionId === id) setActiveSectionId(null);
  };

  const moveBlock = (blockId: string, fromSectionId: string, toSectionId: string) => {
    if (fromSectionId === toSectionId) return;

    const fromSection = sections.find(s => s.id === fromSectionId);
    const toSection = sections.find(s => s.id === toSectionId);
    if (!fromSection || !toSection) return;

    const block = fromSection.blocks.find(b => b.id === blockId);
    if (!block) return;

    // Reset layout for the new section to avoid overlaps or weird positioning
    const movedBlock = {
      ...block,
      layout: { ...block.layout, x: 0, y: Infinity }
    };

    updatePage({
      ...page,
      sections: sections.map(s => {
        if (s.id === fromSectionId) {
          return { ...s, blocks: s.blocks.filter(b => b.id !== blockId) };
        }
        if (s.id === toSectionId) {
          return { ...s, blocks: [...s.blocks, movedBlock] };
        }
        return s;
      })
    });
    setActiveBlockId(blockId);
    setActiveSectionId(toSectionId);
  };

  const addBlock = (type: string, sectionId: string, parentId?: string) => {
    const newBlock: LandingPageBlock = {
      id: `block-${Date.now()}`,
      type,
      parentId,
      content: type === 'text' ? '<h2>New Section</h2><p>Add your content here...</p>' : 
               type === 'hero' ? { title: 'Hero Title', subtitle: 'Hero Subtitle', bgUrl: '', buttonText: '', link: '', buttonType: 'link', whatsapp: '', phone: '' } :
               type === 'button' ? { text: 'Click Me', link: '', type: 'link', whatsapp: '', phone: '', alignment: 'center' } :
               type === 'image' ? { url: '', caption: '' } :
               type === 'video' ? { url: '', poster: '', autoplay: false, loop: true, muted: true } :
               type === 'cta' ? { title: 'Call to Action', buttonText: 'Click Here', link: '', buttonType: 'link', whatsapp: '', phone: '' } :
               type === 'slider' ? { images: [] } :
               type === 'features' ? { items: [{ title: 'Feature 1', desc: 'Description', icon: 'Zap' }] } :
               type === 'stats' ? { items: [{ label: 'Stat 1', value: '100+' }] } :
               type === 'container' ? { backgroundColor: '#ffffff', padding: 24, borderRadius: 32, isClickable: false, link: '' } :
               type === 'onelink' ? { title: 'Connect With Our Socials', links: [{ platform: 'whatsapp', label: 'Chat on WhatsApp', url: 'https://wa.me/xxxxxx' }] } :
               type === 'branches' ? { title: 'Our Branch Locations', items: [{ name: 'Main Branch', phone: '+966 50 000 0000', locationUrl: 'https://maps.google.com', address: 'Olaya District, Riyadh' }] } :
               type === 'price-list' ? { title: 'Our Service Pricing', items: [{ name: 'Tourist Visa', desc: 'Processing & stamp fee', price: 'SAR 450' }] } :
               type === 'faq' ? { title: 'Frequently Asked Questions', items: [{ q: 'How long does visa stamp take?', a: 'Standard turnaround is 3-5 business days.' }] } :
               type === 'html' ? { code: '<div>Custom HTML</div>', css: '/* Custom CSS */', js: '// Custom JS' } : {},
      layout: {
        x: 0,
        y: Infinity,
        w: parentId ? 6 : 12,
        h: type === 'hero' ? 8 : type === 'text' ? 6 : type === 'slider' ? 6 : type === 'container' ? 4 : type === 'video' ? 8 : (type === 'onelink' || type === 'branches' || type === 'price-list' || type === 'faq') ? 6 : 4
      }
    };

    updatePage({
      ...page,
      sections: sections.map(s => s.id === sectionId ? { ...s, blocks: [...s.blocks, newBlock] } : s)
    });
    setActiveBlockId(newBlock.id);
    setActiveSectionId(sectionId);
  };

  const updateBlock = (blockId: string, sectionId: string, content: any) => {
    updatePage({
      ...page,
      sections: sections.map(s => s.id === sectionId ? {
        ...s,
        blocks: s.blocks.map(b => b.id === blockId ? { ...b, content } : b)
      } : s)
    });
  };

  const removeBlock = (blockId: string, sectionId: string) => {
    updatePage({
      ...page,
      sections: sections.map(s => s.id === sectionId ? {
        ...s,
        blocks: s.blocks.filter(b => b.id !== blockId)
      } : s)
    });
    if (activeBlockId === blockId) setActiveBlockId(null);
  };

  const updateBlockStyles = (blockId: string, sectionId: string, styles: any) => {
    updatePage({
      ...page,
      sections: sections.map(s => s.id === sectionId ? {
        ...s,
        blocks: s.blocks.map(b => b.id === blockId ? { ...b, styles: { ...(b.styles || {}), ...styles } } : b)
      } : s)
    });
  };

  const updateBlockAnimation = (blockId: string, sectionId: string, animation: any) => {
    updatePage({
      ...page,
      sections: sections.map(s => s.id === sectionId ? {
        ...s,
        blocks: s.blocks.map(b => b.id === blockId ? { ...b, animation: { ...(b.animation || {}), ...animation } } : b)
      } : s)
    });
  };

  const handleLayoutChange = (layout: any, sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const hasChanged = layout.some((l: any) => {
      const block = section.blocks.find(b => b.id === l.i);
      if (!block) return false;
      return (
        block.layout.x !== l.x ||
        block.layout.y !== l.y ||
        block.layout.w !== l.w ||
        block.layout.h !== l.h
      );
    });

    if (hasChanged) {
      const newBlocks = section.blocks.map(block => {
        const layoutItem = layout.find((l: any) => l.i === block.id);
        if (layoutItem) {
          return {
            ...block,
            layout: {
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h
            }
          };
        }
        return block;
      });

      updatePage({
        ...page,
        sections: sections.map(s => s.id === sectionId ? { ...s, blocks: newBlocks } : s)
      });
    }
  };

  const adjustBlockWidth = (blockId: string, sectionId: string, increment: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const block = section.blocks.find(b => b.id === blockId);
    if (!block) return;
    
    const currentW = block.layout?.w ?? 12;
    const nextW = Math.min(12, Math.max(1, currentW + increment));
    
    updatePage({
      ...page,
      sections: sections.map(s => s.id === sectionId ? {
        ...s,
        blocks: s.blocks.map(b => b.id === blockId ? { ...b, layout: { ...b.layout, w: nextW } } : b)
      } : s)
    });
  };

  const adjustBlockHeight = (blockId: string, sectionId: string, increment: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const block = section.blocks.find(b => b.id === blockId);
    if (!block) return;
    
    const currentH = block.layout?.h ?? 4;
    const nextH = Math.min(24, Math.max(1, currentH + increment));
    
    updatePage({
      ...page,
      sections: sections.map(s => s.id === sectionId ? {
        ...s,
        blocks: s.blocks.map(b => b.id === blockId ? { ...b, layout: { ...b.layout, h: nextH } } : b)
      } : s)
    });
  };

  const shiftBlockOrder = (blockId: string, sectionId: string, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const blockIndex = section.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;
    
    const newBlocks = [...section.blocks];
    if (direction === 'up' && blockIndex > 0) {
      const temp = newBlocks[blockIndex];
      newBlocks[blockIndex] = newBlocks[blockIndex - 1];
      newBlocks[blockIndex - 1] = temp;
    } else if (direction === 'down' && blockIndex < newBlocks.length - 1) {
      const temp = newBlocks[blockIndex];
      newBlocks[blockIndex] = newBlocks[blockIndex + 1];
      newBlocks[blockIndex + 1] = temp;
    } else {
      return;
    }
    
    const sequencedBlocks = newBlocks.map((b, i) => ({
      ...b,
      layout: { ...b.layout, y: i, x: 0 }
    }));

    updatePage({
      ...page,
      sections: sections.map(s => s.id === sectionId ? {
        ...s,
        blocks: sequencedBlocks
      } : s)
    });
  };

  const getColSpanClass = (w: number) => {
    const rounded = Math.min(12, Math.max(1, Math.round(w)));
    const spans: Record<number, string> = {
      1: 'col-span-12 sm:col-span-6 md:col-span-1',
      2: 'col-span-12 sm:col-span-6 md:col-span-2',
      3: 'col-span-12 sm:col-span-6 md:col-span-3',
      4: 'col-span-12 sm:col-span-6 md:col-span-4',
      5: 'col-span-12 md:col-span-5',
      6: 'col-span-12 md:col-span-6',
      7: 'col-span-12 md:col-span-7',
      8: 'col-span-12 md:col-span-8',
      9: 'col-span-12 md:col-span-9',
      10: 'col-span-12 md:col-span-10',
      11: 'col-span-12 md:col-span-11',
      12: 'col-span-12 md:col-span-12',
    };
    return spans[rounded] || 'col-span-12';
  };

  const layouts = useMemo(() => {
    const sectionLayouts: { [sectionId: string]: any } = {};
    sections.forEach(section => {
      sectionLayouts[section.id] = {
        lg: section.blocks.filter(b => !b.parentId).map(b => ({ i: b.id, ...b.layout }))
      };
    });
    return sectionLayouts;
  }, [sections]);

  const getAnimationVariants = (type: string) => {
    switch (type) {
      case 'fade': return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      case 'slideUp': return { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } };
      case 'slideDown': return { hidden: { opacity: 0, y: -50 }, visible: { opacity: 1, y: 0 } };
      case 'slideLeft': return { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } };
      case 'slideRight': return { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } };
      case 'zoomIn': return { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } };
      case 'zoomOut': return { hidden: { opacity: 0, scale: 1.2 }, visible: { opacity: 1, scale: 1 } };
      default: return { hidden: {}, visible: {} };
    }
  };

  const activeBlock = useMemo(() => {
    for (const section of sections) {
      const block = section.blocks.find(b => b.id === activeBlockId);
      if (block) return { block, sectionId: section.id };
    }
    return null;
  }, [sections, activeBlockId]);

  const activeSection = useMemo(() => {
    return sections.find(s => s.id === activeSectionId);
  }, [sections, activeSectionId]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#050508] flex flex-col overflow-hidden font-sans">
      {/* Floating Top Header */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10002] flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 px-4 py-2 rounded-2xl shadow-2xl">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-slate-400 hover:text-primary">
          <ArrowLeft size={18} />
        </button>
        <div className="h-6 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-1" />
        <div className="px-2">
          <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{page.title || 'Untitled Page'}</h2>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-none">Designer</p>
        </div>
        <div className="h-6 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-1" />
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`p-2 rounded-xl transition-all ${isPreviewMode ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
            title={isPreviewMode ? "Exit Preview" : "Enter Preview"}
          >
            {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button 
            onClick={togglePageSettings}
            className={`p-2 rounded-xl transition-all ${showPageSettings ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
            title="Page Settings"
          >
            <Settings2 size={16} />
          </button>
          <button 
            onClick={toggleAddBlock}
            className={`p-2 rounded-xl transition-all ${showAddBlock ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
            title="Add Block"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="h-6 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-1" />
        <div className="flex items-center gap-2">
          {isUnsaved && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Unsaved</span>
            </div>
          )}
          <button 
            onClick={handleSaveDraft}
            disabled={!isUnsaved}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg
              ${isUnsaved 
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm hover:scale-105 border border-slate-200 dark:border-zinc-700' 
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed opacity-50'}`}
          >
            Save Draft
          </button>
          <button 
            onClick={handlePublish}
            disabled={!isUnsaved}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg
              ${isUnsaved 
                ? 'bg-primary text-white shadow-primary/20 hover:scale-105' 
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed opacity-50'}`}
          >
            Publish
          </button>
        </div>
      </div>

      {/* Main Canvas - Full Screen */}
      <div className="flex-grow overflow-y-auto custom-scrollbar relative bg-slate-50 dark:bg-[#050508]">
        {isPreviewMode && !page.settings?.hideNavbar && (
          <Navbar 
            isScrolled={false}
            hasHero={true}
            theme={page.settings?.navbarSettings?.theme === 'auto' || !page.settings?.navbarSettings?.theme
              ? (sections[0]?.settings?.backgroundColor === '#ffffff' || !sections[0]?.settings?.backgroundColor ? 'light' : 'dark')
              : page.settings.navbarSettings.theme}
            toggleTheme={() => {}}
            t={(s) => s}
            pathname={window.location.pathname}
            links={page.settings?.navbarSettings?.links}
            customSettings={{
              logoUrl: page.settings?.navbarSettings?.logoUrl,
              isScrolledBg: page.settings?.navbarSettings?.isScrolledBg,
              isScrolledText: page.settings?.navbarSettings?.isScrolledText
            }}
            onHomeClick={() => {}}
            onBlogClick={() => {}}
            onOffersClick={() => {}}
            onLandingPageClick={() => {}}
            onAdminClick={() => {}}
            onLoginClick={() => {}}
          />
        )}
        <div className={`min-h-full transition-all duration-500 ${isPreviewMode ? (page.settings?.hideNavbar ? 'pt-0' : 'pt-[60px]') : 'pt-24 pb-32'}`}>
          {sections.length === 0 ? (
            <div className="max-w-7xl mx-auto px-4">
              <div className="h-[600px] border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[40px] flex flex-col items-center justify-center text-slate-300 space-y-4 bg-white dark:bg-zinc-900 shadow-2xl">
                <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center mb-4">
                  <Layers size={40} className="opacity-20" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest opacity-50 text-center px-8 max-w-xs">No sections added yet. Start by adding a section to your landing page.</p>
                <button 
                  onClick={addSection}
                  className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                >
                  Add Your First Section
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {sections.sort((a, b) => a.order - b.order).map((section) => (
                <div 
                  key={section.id}
                  className={`relative group/section transition-all ${!isPreviewMode && activeSectionId === section.id && !activeBlockId ? 'ring-2 ring-primary ring-offset-4 dark:ring-offset-[#050508]' : ''}`}
                  onClick={(e) => { e.stopPropagation(); if (!isPreviewMode) { selectSection(section.id); } }}
                >
                  {/* Section Controls */}
                  {!isPreviewMode && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-[10001] flex items-center gap-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl shadow-xl opacity-0 group-hover/section:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mr-2">{section.title}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); addBlock('text', section.id); }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-primary transition-colors"
                        title="Add Block"
                      >
                        <Plus size={12} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); selectSection(section.id); }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-primary transition-colors"
                        title="Section Settings"
                      >
                        <Settings2 size={12} />
                      </button>
                      <div className="w-[1px] h-3 bg-slate-200 dark:bg-zinc-800 mx-1" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

                  {/* Section Content */}
                  <section 
                    onDragOver={(e) => {
                      if (!isPreviewMode) {
                        e.preventDefault();
                        setDragOverSectionId(section.id);
                      }
                    }}
                    onDragLeave={() => {
                      setDragOverSectionId(null);
                    }}
                    onDrop={(e) => {
                      if (!isPreviewMode) {
                        e.preventDefault();
                        setDragOverSectionId(null);
                        
                        const blockType = e.dataTransfer.getData('blockType');
                        const blockId = e.dataTransfer.getData('blockId');
                        const fromSectionId = e.dataTransfer.getData('fromSectionId');
                        
                        if (blockType) {
                          addBlock(blockType as any, section.id);
                        } else if (blockId && fromSectionId) {
                          moveBlock(blockId, fromSectionId, section.id);
                        }
                      }
                    }}
                    className={`relative w-full overflow-hidden transition-all ${section.settings?.fullWidth ? '' : 'py-12 md:py-20'} ${dragOverSectionId === section.id ? 'ring-4 ring-primary/30 bg-primary/5' : ''}`}
                    style={{
                      backgroundColor: section.settings?.backgroundColor || 'transparent',
                      color: section.settings?.textColor || 'inherit',
                      paddingTop: section.settings?.paddingTop,
                      paddingBottom: section.settings?.paddingBottom,
                    }}
                  >
                    {section.settings?.backgroundImage && (
                      <div className="absolute inset-0 -z-10">
                        <img src={section.settings.backgroundImage || null} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-20" alt="" />
                      </div>
                    )}
                    {section.settings?.backgroundPattern && section.settings?.backgroundPattern !== 'none' && (
                      <AbstractBackground 
                        variant={section.settings.backgroundPattern as any} 
                        opacity="opacity-[0.15] dark:opacity-[0.2]" 
                        className="-z-[5]"
                      />
                    )}
                    
                    <div className={`mx-auto transition-all duration-500 ${
                      isPreviewMode 
                        ? (section.settings?.containerWidth || 'max-w-7xl') 
                        : (section.settings?.fullWidth 
                            ? 'max-w-none w-full px-0' 
                            : 'max-w-7xl bg-white dark:bg-zinc-900 shadow-2xl rounded-[40px] p-4 md:p-8 border border-slate-200 dark:border-zinc-800 overflow-hidden')
                    }`}>
                      {section.blocks.length === 0 ? (
                        <div className="h-40 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-slate-300 space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Section is empty. Add blocks to start designing.</p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); addBlock('text', section.id); }}
                            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                          >
                            Add Your First Block
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-12 gap-5 w-full items-start">
                          {[...section.blocks].sort((a,b) => (a.layout?.y ?? 0)*12 + (a.layout?.x ?? 0) - ((b.layout?.y ?? 0)*12 + (b.layout?.x ?? 0))).map((block) => {
                            const w = block.layout?.w ?? 12;
                            const h = block.layout?.h ?? 4;
                            const spanClass = getColSpanClass(w);
                            const isSelected = activeBlockId === block.id;

                            return (
                              <div 
                                key={block.id} 
                                className={`relative group/block w-full h-full transition-all border border-transparent rounded-[24px] ${spanClass}`}
                                style={{
                                  minHeight: `${h * 40}px`
                                }}
                              >
                                <motion.div 
                                  initial="hidden"
                                  whileInView="visible"
                                  viewport={{ once: block.animation?.once ?? true }}
                                  variants={getAnimationVariants(block.animation?.type || 'none')}
                                  transition={{ duration: block.animation?.duration || 0.5, delay: block.animation?.delay || 0 }}
                                  className={`w-full h-full relative overflow-hidden transition-all duration-300
                                    ${!isPreviewMode && isSelected ? 'ring-4 ring-primary ring-offset-2 dark:ring-offset-[#050508] z-40 scale-[1.01]' : ''}
                                    ${!isPreviewMode && !isSelected ? 'hover:ring-2 hover:ring-primary/20 hover:scale-[1.005] cursor-pointer' : ''}`}
                                  style={{
                                    backgroundColor: block.styles?.backgroundColor,
                                    color: block.styles?.textColor,
                                    fontFamily: block.styles?.fontFamily,
                                    textAlign: block.styles?.textAlign,
                                    padding: block.styles?.padding || '24px',
                                    borderRadius: block.styles?.borderRadius || '24px',
                                    boxShadow: block.styles?.boxShadow || 'none',
                                    borderWidth: block.styles?.borderWidth,
                                    borderColor: block.styles?.borderColor,
                                    borderStyle: block.styles?.borderWidth ? 'solid' : 'none',
                                    opacity: block.styles?.opacity,
                                    zIndex: block.styles?.zIndex,
                                  }}
                                  onClick={(e) => { e.stopPropagation(); if (!isPreviewMode) { selectBlock(block.id, section.id); } }}
                                >
                                  {/* Absolute Control Buttons Overlay */}
                                  {!isPreviewMode && (
                                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 transition-all duration-200 z-50
                                      ${isSelected ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'}`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {/* Scaling modifiers */}
                                      <div className="flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-1 shadow-xl backdrop-blur-md">
                                        <button 
                                          onClick={(e) => adjustBlockWidth(block.id, section.id, -1, e)}
                                          disabled={w <= 1}
                                          className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 disabled:opacity-30 text-[10px] font-black"
                                          title="Decrease Width"
                                        >
                                          W-
                                        </button>
                                        <span className="text-[8px] font-black uppercase text-slate-700 dark:text-zinc-300 px-1 select-none">
                                          {w}
                                        </span>
                                        <button 
                                          onClick={(e) => adjustBlockWidth(block.id, section.id, 1, e)}
                                          disabled={w >= 12}
                                          className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 disabled:opacity-30 text-[10px] font-black"
                                          title="Increase Width"
                                        >
                                          W+
                                        </button>
                                        <div className="w-[1px] h-3 bg-slate-200 dark:bg-zinc-800 mx-0.5" />
                                        <button 
                                          onClick={(e) => adjustBlockHeight(block.id, section.id, -1, e)}
                                          disabled={h <= 1}
                                          className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 disabled:opacity-30 text-[10px] font-black"
                                          title="Decrease Height"
                                        >
                                          H-
                                        </button>
                                        <span className="text-[8px] font-black uppercase text-slate-700 dark:text-zinc-300 px-1 select-none">
                                          {h}
                                        </span>
                                        <button 
                                          onClick={(e) => adjustBlockHeight(block.id, section.id, 1, e)}
                                          disabled={h >= 24}
                                          className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 disabled:opacity-30 text-[10px] font-black"
                                          title="Increase Height"
                                        >
                                          H+
                                        </button>
                                      </div>

                                      {/* Order Shifters */}
                                      <div className="flex items-center gap-0.5 bg-white/95 dark:bg-zinc-900/95 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-1 shadow-xl backdrop-blur-md">
                                        <button 
                                          onClick={(e) => shiftBlockOrder(block.id, section.id, 'up', e)}
                                          className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 hover:text-primary transition-colors text-[10px] font-black"
                                          title="Shift Up"
                                        >
                                          ▲
                                        </button>
                                        <button 
                                          onClick={(e) => shiftBlockOrder(block.id, section.id, 'down', e)}
                                          className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 hover:text-primary transition-colors text-[10px] font-black"
                                          title="Shift Down"
                                        >
                                          ▼
                                        </button>
                                      </div>

                                      {/* Standard Delete */}
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); removeBlock(block.id, section.id); }} 
                                        className="p-2 bg-white/95 dark:bg-zinc-900/95 shadow-xl rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200/80 dark:border-zinc-800/80 transition-colors"
                                        title="Delete block"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  )}
                                  
                                  <div className={`w-full h-full overflow-hidden ${!isPreviewMode ? 'pointer-events-none select-none' : ''}`}>
                                    <BlockContent block={block} page={page} />
                                  </div>
                                </motion.div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              ))}

              {/* Add Section Button at the bottom */}
              {!isPreviewMode && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <button 
                    onClick={addSection}
                    className="w-full py-12 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[40px] flex flex-col items-center justify-center text-slate-300 hover:text-primary hover:border-primary/50 transition-all bg-white/50 dark:bg-zinc-900/50 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Add New Section</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Add Block Menu */}
        <AnimatePresence>
          {showAddBlock && !isPreviewMode && (
            <DraggablePanel 
              key="add-block-panel"
              title="Add New Block" 
              onClose={() => setShowAddBlock(false)}
              initialPosition={{ x: 50, y: 100 }}
              width="w-72"
            >
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'hero', icon: <Maximize size={16} />, label: 'Hero Section' },
                  { type: 'text', icon: <Type size={16} />, label: 'Rich Text' },
                  { type: 'image', icon: <ImageIcon size={16} />, label: 'Single Image' },
                  { type: 'button', icon: <Send size={16} />, label: 'Action Button' },
                  { type: 'video', icon: <Video size={16} />, label: 'Video Player' },
                  { type: 'cta', icon: <Zap size={16} />, label: 'Call to Action' },
                  { type: 'slider', icon: <Sliders size={16} />, label: 'Image Slider' },
                  { type: 'features', icon: <List size={16} />, label: 'Features Grid' },
                  { type: 'stats', icon: <BarChart size={16} />, label: 'Statistics' },
                  { type: 'container', icon: <Box size={16} />, label: 'Container' },
                  { type: 'html', icon: <Code size={16} />, label: 'Custom HTML' },
                  { type: 'services', icon: <Briefcase size={16} />, label: 'Services List' },
                  { type: 'destinations', icon: <Globe size={16} />, label: 'Destinations' },
                  { type: 'blog', icon: <FileText size={16} />, label: 'Blog Posts' },
                  { type: 'reviews', icon: <MessageSquare size={16} />, label: 'Client Reviews' },
                  { type: 'onelink', icon: <Share2 size={16} />, label: 'OneLink Socials' },
                  { type: 'branches', icon: <MapPin size={16} />, label: 'Branches & Info' },
                  { type: 'price-list', icon: <List size={16} />, label: 'Service Prices' },
                  { type: 'faq', icon: <MessageSquare size={16} />, label: 'FAQ Accordion' },
                ].map((item) => (
                  <button
                    key={item.type}
                    draggable="true"
                    onDragStart={(e) => {
                      e.dataTransfer.setData('blockType', item.type);
                    }}
                    onClick={() => {
                      if (activeSectionId) {
                        addBlock(item.type, activeSectionId);
                        setShowAddBlock(false);
                      } else if (sections.length > 0) {
                        addBlock(item.type, sections[0].id);
                        setShowAddBlock(false);
                      } else {
                        // Create section first
                        const newSectionId = `section-${Date.now()}`;
                        const newSection = {
                          id: newSectionId,
                          title: 'Main Section',
                          order: 0,
                          settings: { backgroundColor: '#ffffff', paddingTop: '4rem', paddingBottom: '4rem', fullWidth: false, containerWidth: 'max-w-7xl' as const },
                          blocks: []
                        };
                        updatePage({ ...page, sections: [newSection] });
                        addBlock(item.type, newSectionId);
                        setShowAddBlock(false);
                      }
                    }}
                    className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl hover:border-primary hover:text-primary transition-all group cursor-grab active:cursor-grabbing"
                  >
                    <div className="mb-1 text-slate-400 group-hover:text-primary transition-colors scale-90">{item.icon}</div>
                    <span className="text-[7px] font-black uppercase tracking-widest text-center leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </DraggablePanel>
          )}
        </AnimatePresence>

        {/* Floating Properties Panel */}
        <AnimatePresence>
          {(activeBlock || activeSection || showPageSettings) && !isPreviewMode && (
            <DraggablePanel 
              key="properties-panel"
              title={showPageSettings ? "Page Settings" : activeBlock ? `${(activeBlock.block?.type || '').toUpperCase()} Properties` : "Section Properties"} 
              onClose={() => { setActiveBlockId(null); setActiveSectionId(null); setShowPageSettings(false); }}
              width="w-80"
              initialPosition={{ x: window.innerWidth - 350, y: 100 }}
            >
              <div className="space-y-4">
                {showPageSettings ? (
                  <PageSettingsPanel page={page} onUpdate={updatePage} />
                ) : activeBlock ? (
                  <BlockPropertiesPanel 
                    block={activeBlock.block} 
                    sectionId={activeBlock.sectionId}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    updateBlock={updateBlock}
                    updateBlockStyles={updateBlockStyles}
                    updateBlockAnimation={updateBlockAnimation}
                    removeBlock={removeBlock}
                    setActiveBlockId={setActiveBlockId}
                  />
                ) : activeSection ? (
                  <SectionPropertiesPanel 
                    section={activeSection}
                    updateSection={updateSection}
                  />
                ) : null}
              </div>
            </DraggablePanel>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LandingPageDesigner;
