import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ArrowLeft,
  Check,
  Loader2,
  Eye,
  FileText,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Trash2,
  Settings,
  User,
  Calendar,
  Tag,
  ChevronDown,
  Monitor,
  Smartphone,
  AlertCircle,
  ExternalLink,
  Globe,
  RefreshCw,
  Maximize2,
  Minimize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Highlighter
} from 'lucide-react';
import { useCMS, BlogPost } from '../context/CMSContext';

const TEXT_COLORS = [
  { name: 'Default', value: '#1e293b', class: 'bg-slate-800' },
  { name: 'Red', value: '#ef4444', class: 'bg-red-500' },
  { name: 'Orange', value: '#f97316', class: 'bg-orange-500' },
  { name: 'Yellow', value: '#ca8a04', class: 'bg-yellow-650' },
  { name: 'Green', value: '#10b981', class: 'bg-[#10b981]' },
  { name: 'Blue', value: '#3b82f6', class: 'bg-blue-500' },
  { name: 'Purple', value: '#8b5cf6', class: 'bg-purple-500' },
  { name: 'Pink', value: '#ec4899', class: 'bg-pink-500' },
];

const HL_COLORS = [
  { name: 'None', value: 'rgba(0,0,0,0)', class: 'border border-dashed border-slate-300 bg-transparent' },
  { name: 'Yellow Highlight', value: '#fef08a', class: 'bg-[#fef08a] text-slate-900' },
  { name: 'Green Highlight', value: '#bbf7d0', class: 'bg-[#bbf7d0] text-slate-900' },
  { name: 'Blue Highlight', value: '#bfdbfe', class: 'bg-[#bfdbfe] text-slate-900' },
  { name: 'Red Highlight', value: '#fecaca', class: 'bg-[#fecaca] text-slate-900' },
  { name: 'Purple Highlight', value: '#e9d5ff', class: 'bg-[#e9d5ff] text-slate-900' },
];

interface BlogStudioProps {
  post: BlogPost;
  isFullscreenBlog: boolean;
  setIsFullscreenBlog: (val: boolean) => void;
  blogEditorTab: 'edit' | 'preview';
  setBlogEditorTab: (tab: 'edit' | 'preview') => void;
  setPostToDelete: (post: BlogPost) => void;
  setEditingPostId: (id: string | null) => void;
  savePostData: (fields: Partial<BlogPost>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => void;
}

export const BlogStudio: React.FC<BlogStudioProps> = ({
  post,
  isFullscreenBlog,
  setIsFullscreenBlog,
  blogEditorTab,
  setBlogEditorTab,
  setPostToDelete,
  setEditingPostId,
  savePostData,
  handleFileUpload
}) => {
  // --- Local States for Post Editing Fields ---
  const [title, setTitle] = useState(post.title || '');
  const [subtitle, setSubtitle] = useState(post.subtitle || '');
  const [content, setContent] = useState(post.content || '');
  const [status, setStatus] = useState<BlogPost['status']>(post.status || 'Draft');
  const [category, setCategory] = useState(post.category || '');
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [featuredImage, setFeaturedImage] = useState(post.images?.[0] || '');
  const [slug, setSlug] = useState(post.id || '');
  const [seoTitle, setSeoTitle] = useState(post.seoMetaTitle || '');
  const [seoDescription, setSeoDescription] = useState(post.seoMetaDescription || '');
  const [publishDate, setPublishDate] = useState(post.date || '');
  const [author, setAuthor] = useState(post.authorName || 'KH Team');

  // Backup and Autosave State Management
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [pendingBackup, setPendingBackup] = useState<any | null>(null);

  // Link Insertion Dialog State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Preset Visual Banner dialog
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Responsive Drawer/Settings Panel State on Mobile
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Editor Ref for raw innerHTML interaction
  const editorRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef<boolean>(false);

  // --- Floating Selection & Image Popovers State ---
  const [textToolbar, setTextToolbar] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });

  const [imageToolbar, setImageToolbar] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetImg: HTMLImageElement | null;
  }>({ visible: false, x: 0, y: 0, targetImg: null });

  const [showTextColorPanel, setShowTextColorPanel] = useState(false);
  const [showBgColorPanel, setShowBgColorPanel] = useState(false);

  // Selection and Image popup event listeners
  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editorRef.current) return;
      const selection = window.getSelection();

      if (blogEditorTab !== 'edit') {
        setTextToolbar({ visible: false, x: 0, y: 0 });
        return;
      }

      if (!selection || selection.isCollapsed) {
        setTextToolbar(prev => prev.visible ? { ...prev, visible: false } : prev);
        setShowTextColorPanel(false);
        setShowBgColorPanel(false);
        return;
      }

      const rangeCount = selection.rangeCount;
      if (rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          const rect = range.getBoundingClientRect();
          if (rect && rect.width > 0 && rect.height > 0) {
            setTextToolbar({
              visible: true,
              x: rect.left + rect.width / 2,
              y: rect.top,
            });
            setImageToolbar(prev => prev.visible ? { ...prev, visible: false } : prev);
            return;
          }
        }
      }
      setTextToolbar(prev => prev.visible ? { ...prev, visible: false } : prev);
      setShowTextColorPanel(false);
      setShowBgColorPanel(false);
    };

    const handleScrollOrResize = () => {
      setTextToolbar(prev => prev.visible ? { ...prev, visible: false } : prev);
      setImageToolbar(prev => prev.visible ? { ...prev, visible: false } : prev);
      setShowTextColorPanel(false);
      setShowBgColorPanel(false);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [blogEditorTab]);

  // --- Reset Local Fields on Active Post Modification ---
  useEffect(() => {
    setTitle(post.title || '');
    setSubtitle(post.subtitle || '');
    setContent(post.content || '');
    setStatus(post.status || 'Draft');
    setCategory(post.category || '');
    setTags(post.tags || []);
    setFeaturedImage(post.images?.[0] || '');
    setSlug(post.id || '');
    setSeoTitle(post.seoMetaTitle || '');
    setSeoDescription(post.seoMetaDescription || '');
    setPublishDate(post.date || '');
    setAuthor(post.authorName || 'KH Team');
    setSaveStatus('saved');

    // Update innerHTML of the contenteditable only when switching posts
    if (editorRef.current) {
      editorRef.current.innerHTML = post.content || '';
    }

    // Check for existing unsaved draft backup in localStorage for this specific post
    const backup = localStorage.getItem(`kh_draft_backup_${post.id}`);
    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        // Only prompt if backup content is different from actual saved content
        if (parsed.content !== post.content || parsed.title !== post.title) {
          setPendingBackup(parsed);
        }
      } catch (err) {
        // ignore
      }
    } else {
      setPendingBackup(null);
    }
  }, [post.id]);

  // --- Restore Unsaved Local Backup ---
  const handleRestoreBackup = () => {
    if (pendingBackup) {
      setTitle(pendingBackup.title || '');
      setSubtitle(pendingBackup.subtitle || '');
      setContent(pendingBackup.content || '');
      setStatus(pendingBackup.status || 'Draft');
      setCategory(pendingBackup.category || '');
      setTags(pendingBackup.tags || []);
      setFeaturedImage(pendingBackup.featuredImage || '');
      setSlug(pendingBackup.slug || '');
      setSeoTitle(pendingBackup.seoTitle || '');
      setSeoDescription(pendingBackup.seoDescription || '');
      setPublishDate(pendingBackup.publishDate || '');
      setAuthor(pendingBackup.author || 'KH Team');

      if (editorRef.current) {
        editorRef.current.innerHTML = pendingBackup.content || '';
      }

      setSaveStatus('unsaved');
      setPendingBackup(null);
      // Immediately trigger save sequence
      triggerAutosave({
        title: pendingBackup.title,
        subtitle: pendingBackup.subtitle,
        content: pendingBackup.content,
        status: pendingBackup.status,
        category: pendingBackup.category,
        tags: pendingBackup.tags,
        images: pendingBackup.featuredImage ? [pendingBackup.featuredImage] : [],
        seoMetaTitle: pendingBackup.seoTitle,
        seoMetaDescription: pendingBackup.seoDescription,
        date: pendingBackup.publishDate,
        authorName: pendingBackup.author
      });
    }
  };

  const handleDismissBackup = () => {
    localStorage.removeItem(`kh_draft_backup_${post.id}`);
    setPendingBackup(null);
  };

  // --- HTML Elements Formatting ExecCommands (WYSIWYG NATIVE & IMMENSELY STABLE) ---
  const formatText = (command: string, value: string = '') => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    handleEditorContentChange();
  };

  // Special block format helper
  const formatBlock = (tag: string) => {
    formatText('formatBlock', tag);
  };

  // Check and apply custom Link insertion
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Try to restore user caret selection or insert link directly
    document.execCommand('createLink', false, linkUrl);
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
    handleEditorContentChange();
  };

  // Custom Image insertion inside content body
  const handleInsertImage = (url: string) => {
    if (!url.trim()) return;
    const imgHtml = `
      <figure class="my-6 max-w-full text-center group relative clear-both">
        <img src="${url}" class="rounded-2xl max-h-[480px] object-cover w-full mx-auto border border-slate-100 shadow-sm transition-all hover:shadow-md" alt="Inserted vacation visual asset" referrerPolicy="no-referrer" />
        <figcaption class="text-xs text-slate-400 mt-2 font-medium italic">Premium travel insights premium illustration</figcaption>
      </figure>
      <p><br/></p>
    `;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand('insertHTML', false, imgHtml);
    setShowImageModal(false);
    setImageUrlInput('');
    handleEditorContentChange();
  };

  // Image Upload inside insert prompt
  const handleFeaturedImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isInsideContent: boolean) => {
    setIsUploadingImage(true);
    handleFileUpload(e, (url: string) => {
      setIsUploadingImage(false);
      if (isInsideContent) {
        handleInsertImage(url);
      } else {
        setFeaturedImage(url);
        setSaveStatus('unsaved');
      }
    });
  };

  // --- Capture changes on content description input ---
  const handleEditorContentChange = () => {
    if (editorRef.current) {
      const htmlText = editorRef.current.innerHTML;
      setContent(htmlText);
      setSaveStatus('unsaved');
    }
  };

  // Handle Input triggers
  const onEditorInput = () => {
    isTypingRef.current = true;
    handleEditorContentChange();
  };

  const onEditorBlur = () => {
    isTypingRef.current = false;
  };

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      const rect = img.getBoundingClientRect();
      setImageToolbar({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top,
        targetImg: img,
      });
      setTextToolbar({ visible: false, x: 0, y: 0 });
    } else {
      setImageToolbar({ visible: false, x: 0, y: 0, targetImg: null });
    }
  };

  const updateImageStyling = (alignment?: 'left' | 'center' | 'right', width?: string) => {
    if (!imageToolbar.targetImg) return;
    const img = imageToolbar.targetImg;
    const figure = img.closest('figure');
    
    // Apply styling
    if (figure) {
      if (width) {
        figure.style.width = width;
        figure.style.maxWidth = '100%';
      }
      if (alignment) {
        figure.classList.remove('float-left', 'float-right', 'mx-auto', 'text-center', 'mr-auto', 'ml-auto', 'ml-0', 'mr-0');
        if (alignment === 'left') {
          figure.classList.add('float-left', 'mr-6', 'my-2');
          figure.style.display = 'block';
        } else if (alignment === 'right') {
          figure.classList.add('float-right', 'ml-6', 'my-2');
          figure.style.display = 'block';
        } else {
          figure.classList.add('mx-auto', 'text-center', 'my-6');
          figure.style.display = 'block';
        }
      }
    } else {
      if (width) {
        img.style.width = width;
        img.style.maxWidth = '100%';
      }
      if (alignment) {
        img.style.display = 'block';
        if (alignment === 'left') {
          img.style.float = 'left';
          img.style.margin = '10px 20px 10px 0';
        } else if (alignment === 'right') {
          img.style.float = 'right';
          img.style.margin = '10px 0 10px 20px';
        } else {
          img.style.float = 'none';
          img.style.margin = '20px auto';
        }
      }
    }
    
    handleEditorContentChange();
    
    setTimeout(() => {
      if (img) {
        const rect = img.getBoundingClientRect();
        setImageToolbar(prev => ({
          ...prev,
          x: rect.left + rect.width / 2,
          y: rect.top,
        }));
      }
    }, 100);
  };

  const deleteImage = () => {
    if (!imageToolbar.targetImg) return;
    const img = imageToolbar.targetImg;
    const figure = img.closest('figure');
    if (figure) {
      figure.remove();
    } else {
      img.remove();
    }
    setImageToolbar({ visible: false, x: 0, y: 0, targetImg: null });
    handleEditorContentChange();
  };

  const applyTextColor = (colorValue: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand('foreColor', false, colorValue);
    handleEditorContentChange();
  };

  const applyHighlightColor = (colorValue: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand('hiliteColor', false, colorValue);
    handleEditorContentChange();
  };

  const updateImageEffects = (options: {
    roundness?: 'none' | 'xl' | '3xl' | 'full';
    shadow?: 'none' | 'md' | '2xl';
    border?: 'none' | 'thin' | 'dashed';
  }) => {
    if (!imageToolbar.targetImg) return;
    const img = imageToolbar.targetImg;
    
    if (options.roundness !== undefined) {
      img.classList.remove('rounded-none', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full');
      if (options.roundness === 'none') {
        img.classList.add('rounded-none');
      } else if (options.roundness === 'xl') {
        img.classList.add('rounded-xl');
      } else if (options.roundness === '3xl') {
        img.classList.add('rounded-3xl');
      } else if (options.roundness === 'full') {
        img.classList.add('rounded-full');
      }
    }

    if (options.shadow !== undefined) {
      img.classList.remove('shadow-none', 'shadow-md', 'shadow-2xl');
      if (options.shadow === 'none') {
        img.classList.add('shadow-none');
      } else if (options.shadow === 'md') {
        img.classList.add('shadow-md');
      } else if (options.shadow === '2xl') {
        img.classList.add('shadow-2xl');
      }
    }

    if (options.border !== undefined) {
      img.classList.remove('border-none', 'border', 'border-slate-300', 'border-dashed', 'border-2', 'border-amber-400');
      if (options.border === 'none') {
        img.classList.add('border-none');
      } else if (options.border === 'thin') {
        img.classList.add('border', 'border-slate-300');
      } else if (options.border === 'dashed') {
        img.classList.add('border-2', 'border-dashed', 'border-amber-400');
      }
    }

    handleEditorContentChange();
  };

  // Save changes explicitly to parent state
  const triggerAutosave = useCallback((fieldsToSave: Partial<BlogPost>) => {
    setSaveStatus('saving');
    
    // Cleanup draft backup on successful save
    localStorage.removeItem(`kh_draft_backup_${post.id}`);

    try {
      savePostData({
        ...fieldsToSave,
        id: post.id
      });
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed autosaving blog data', err);
    }
  }, [post.id, savePostData]);

  // --- Autosave Monitoring Trigger with 5 seconds Debounce ---
  useEffect(() => {
    const isStateChanged = 
      title !== (post.title || '') ||
      subtitle !== (post.subtitle || '') ||
      content !== (post.content || '') ||
      status !== (post.status || 'Draft') ||
      category !== (post.category || '') ||
      JSON.stringify(tags) !== JSON.stringify(post.tags || []) ||
      featuredImage !== (post.images?.[0] || '') ||
      slug !== (post.id || '') ||
      seoTitle !== (post.seoMetaTitle || '') ||
      seoDescription !== (post.seoMetaDescription || '') ||
      publishDate !== (post.date || '') ||
      author !== (post.authorName || 'KH Team');

    if (!isStateChanged) return;

    setSaveStatus('unsaved');

    // Create temporary backup in localStorage to aid recovery on reload
    const localBackupBytes = {
      title,
      subtitle,
      content,
      status,
      category,
      tags,
      featuredImage,
      slug,
      seoTitle,
      seoDescription,
      publishDate,
      author,
      updatedAt: Date.now()
    };
    localStorage.setItem(`kh_draft_backup_${post.id}`, JSON.stringify(localBackupBytes));

    const timeout = setTimeout(() => {
      // Avoid saving completely empty posts accidentally
      if (!title.trim() && !content.trim()) return;

      triggerAutosave({
        title,
        subtitle,
        content,
        status,
        category,
        tags,
        images: featuredImage ? [featuredImage] : [],
        seoMetaTitle: seoTitle,
        seoMetaDescription: seoDescription,
        date: publishDate,
        authorName: author
      });
    }, 5000);

    return () => clearTimeout(timeout);
  }, [
    title, subtitle, content, status, category, tags, featuredImage, 
    slug, seoTitle, seoDescription, publishDate, author, post.id, triggerAutosave
  ]);

  // Warn user before leaving page with unsaved modifications
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'unsaved') {
        const warning = 'Your draft currently has unsaved modifications. Are you sure you choose to navigate away?';
        e.returnValue = warning;
        return warning;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  // Word count dynamic calculations
  const totalWords = useMemo(() => {
    const txt = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!txt) return 0;
    return txt.split(' ').filter(Boolean).length;
  }, [content]);

  // Read time dynamic calculations
  const countReadingTime = useMemo(() => {
    return Math.max(1, Math.round(totalWords / 200));
  }, [totalWords]);

  // Tags adder helpers
  const handleAddTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const splitTags = trimmed.split(',').map(t => t.trim()).filter(Boolean);
    const uniqueTags = Array.from(new Set([...tags, ...splitTags]));
    setTags(uniqueTags);
    setTagInput('');
    setSaveStatus('unsaved');
  };

  const handleKeyPressTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
    setSaveStatus('unsaved');
  };

  // Simple clean trigger for manual Save Button
  const handleManualSave = (targetStatus?: BlogPost['status']) => {
    const postStatus = targetStatus || status;
    if (targetStatus) {
      setStatus(targetStatus);
    }

    triggerAutosave({
      title,
      subtitle,
      content,
      status: postStatus,
      category,
      tags,
      images: featuredImage ? [featuredImage] : [],
      seoMetaTitle: seoTitle,
      seoMetaDescription: seoDescription,
      date: publishDate,
      authorName: author
    });
  };

  return (
    <div 
      id="blog-studio-core-rebuild" 
      className={`w-full flex flex-col bg-[#F8FAFC] dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-sans select-none antialiased relative transition-all duration-300 ${
        isFullscreenBlog 
          ? 'fixed inset-0 z-[350] h-screen w-screen overflow-hidden' 
          : 'min-h-[92vh]'
      }`}
    >
      
      {/* 1. TOP DENTAL-WHITE CONTROL HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800/80 px-4 md:px-8 py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (saveStatus === 'unsaved') {
                if (confirm('Your travel blog draft contains unsaved changes. Navigate back anyway?')) {
                  setEditingPostId(null);
                }
              } else {
                setEditingPostId(null);
              }
            }}
            className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl transition-all border border-slate-200/50 dark:border-zinc-700/55 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            title="Return to Articles Directory"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">Active Document Workspace</h1>
            <input 
              type="text" 
              value={title || 'Untitled Draft'} 
              onChange={(e) => {
                setTitle(e.target.value);
                setSaveStatus('unsaved');
              }}
              className="font-bold text-sm bg-transparent border-0 mt-0.5 p-0 outline-none focus:ring-0 w-44 md:w-64 text-slate-900 dark:text-white truncate"
              placeholder="Enter Title..."
            />
          </div>

          {/* Sync save Status Indicators */}
          <div className="flex items-center pl-3 border-l border-slate-200 dark:border-zinc-800">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold leading-none animate-pulse">
                <Loader2 size={13} className="animate-spin" />
                <span>Autosaving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-450 text-xs font-black">
                <Check size={14} className="stroke-[3]" />
                <span className="hidden sm:inline">Saved {lastSavedTime ? `at ${lastSavedTime}` : '(Syncrecord OK)'}</span>
                <span className="sm:hidden">Saved</span>
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="hidden sm:inline">Unsaved Draft Progress</span>
                <span className="sm:hidden">Unsaved</span>
              </span>
            )}
          </div>
        </div>

        {/* Top Header Deck Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFullscreenBlog(!isFullscreenBlog)}
            className={`p-2 rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 active:scale-95`}
            title={isFullscreenBlog ? "Exit Fullscreen Immersive Mode" : "Fullscreen Immersive Mode"}
          >
            {isFullscreenBlog ? <Minimize2 size={14} className="text-amber-500" /> : <Maximize2 size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setBlogEditorTab(blogEditorTab === 'edit' ? 'preview' : 'edit')}
            className={`px-4.5 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700/80 ${
              blogEditorTab === 'preview'
                ? 'bg-amber-500 border-transparent text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700'
            }`}
          >
            <Eye size={14} />
            <span>{blogEditorTab === 'preview' ? 'Edit Canvas' : 'Preview Live'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleManualSave('Draft')}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-black uppercase tracking-wide rounded-xl border border-slate-200 dark:border-zinc-700 transition-all"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleManualSave('Published')}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Publish Post</span>
          </button>

          {/* Settings button on mobile toggle */}
          <button
            type="button"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="md:hidden p-2.5 bg-slate-100 dark:bg-zinc-855 rounded-xl text-slate-500 border border-slate-200"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* --- PENDING SAVED BACKUP RESTORER NOTIFICATION BANNER --- */}
      {pendingBackup && (
        <div className="w-full bg-amber-50 border-b border-amber-200 text-amber-900 px-6 py-3 flex items-center justify-between gap-3 font-sans shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-amber-600 shrink-0" size={18} />
            <span className="text-xs md:text-sm font-semibold">
              We recovered an unsaved local backup that differs from your cloud copy (Updated: {new Date(pendingBackup.updatedAt).toLocaleTimeString()}). Restoring can fetch your lost data!
            </span>
          </div>
          <div className="flex items-center gap-2 font-black text-xs uppercase shrink-0">
            <button 
              onClick={handleRestoreBackup} 
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition-all"
            >
              Restore Draft
            </button>
            <button 
              onClick={handleDismissBackup} 
              className="text-amber-700 hover:text-amber-900 px-3 py-1.5 rounded-lg"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN LAYOUT DECK WRAPPER */}
      <div className="flex-1 w-full flex overflow-hidden relative">
        
        {/* UPPER WRITING CHASSIS AND SETTINGS CARD AREA */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 md:py-10 px-4 md:px-8 max-w-[850px] mx-auto">
          
          {/* STATIC LAYOUT COMPOSITOR CARDS */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 shadow-xs p-6 md:p-12 space-y-6 relative">
            
            {/* INLINE COVER PREVIEW AND SETTER */}
            {featuredImage ? (
              <div className="relative group aspect-[21/9] rounded-2xl overflow-hidden bg-slate-900 border border-slate-100">
                <img src={featuredImage} className="w-full h-full object-cover" alt="Article graphic cover file banner" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                  <label className="bg-white text-slate-950 hover:bg-slate-100 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-md transition-all">
                    Change Banner
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleFeaturedImageUpload(e, false)} 
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage('');
                      setSaveStatus('unsaved');
                    }}
                    className="bg-rose-600 hover:bg-rose-505 text-white px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md transition-all"
                  >
                    Delete Cover
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-[21/9] rounded-2xl border border-dashed border-slate-250 dark:border-zinc-800 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-zinc-900/10 text-center p-6">
                <ImageIcon className="text-slate-350 dark:text-zinc-700 mb-2" size={24} />
                <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold mb-3">Add featured graphic cover image to boost visitor reader CTR reviews</p>
                <div className="flex gap-2">
                  <label className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-black uppercase cursor-pointer transition-all">
                    Upload image
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleFeaturedImageUpload(e, false)} 
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage('https://images.unsplash.com/photo-1627581177651-78939c636f3c?w=1200&q=80');
                      setSaveStatus('unsaved');
                    }}
                    className="bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-350 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all"
                  >
                    Preset Graphic
                  </button>
                </div>
              </div>
            )}

            {blogEditorTab === 'preview' ? (
              /* --- LIVE PREVIEW MODE --- */
              <article className="prose max-w-none prose-slate dark:prose-invert font-sans text-left space-y-6 pt-4">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest pb-2 border-b border-slate-100">
                  <Globe size={13} className="text-indigo-500" />
                  <span>Interactive Reader Simulator Workspace Rendering</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase font-sans text-slate-900 dark:text-white mt-4">
                  {title || 'Untitled Exclusive Story'}
                </h1>

                {subtitle && (
                  <p className="text-lg italic text-slate-500 border-l-4 border-amber-500 pl-4 py-1 leading-relaxed">
                    {subtitle}
                  </p>
                )}

                <div 
                  className="prose-slate text-slate-800 dark:text-zinc-200 mt-6 space-y-4 text-base sm:text-lg leading-relaxed pt-2"
                  dangerouslySetInnerHTML={{ __html: content || '<p className="text-slate-400 italic">No content written yet...</p>' }}
                />

                {/* Tags inside preview */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-6 border-t border-slate-100 mt-10">
                    {tags.map((tg, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-50 dark:bg-zinc-850 text-slate-500 dark:text-zinc-400 text-xs font-bold rounded-lg border border-slate-200/50">
                        #{tg}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ) : (
              /* --- EDIT CANVAS WRITER WORKSPACE --- */
              <div className="space-y-6 text-left relative pt-2">
                
                {/* 1. ARTICLE TITLE INPUT */}
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setSaveStatus('unsaved');
                  }}
                  className="w-full text-3xl sm:text-4xl md:text-5xl font-black tracking-tight outline-none border-0 p-0 text-slate-900 dark:text-white placeholder:text-slate-200 focus:ring-0 font-sans uppercase uppercase-override"
                  placeholder="Enter Premium Title..."
                  id="canvas-main-title-input"
                />

                {/* 2. SUBTITLE / EXCERPT */}
                <textarea
                  value={subtitle}
                  onChange={(e) => {
                    setSubtitle(e.target.value);
                    setSaveStatus('unsaved');
                  }}
                  rows={2}
                  className="w-full mt-2 text-base sm:text-lg italic leading-relaxed text-slate-500 placeholder:text-slate-350 outline-none border-0 p-0 resize-none focus:ring-0 focus:outline-none"
                  placeholder="Add a catchy, professional travel description summary here..."
                  id="canvas-excerpt-input"
                />

                <div className="h-[1.5px] bg-slate-100 dark:bg-zinc-800 my-4" />

                {/* 3. FORMATTING STICKY / FLOATING FORMAT BAR */}
                <div className="sticky top-18 z-30 transition-all flex items-center flex-wrap gap-1 md:gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-lg mt-4 max-w-full overflow-x-auto select-none no-scrollbar">
                  <button type="button" onClick={() => formatText('bold')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors" title="Bold"><Bold size={13} /></button>
                  <button type="button" onClick={() => formatText('italic')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors" title="Italic"><Italic size={13} /></button>
                  <button type="button" onClick={() => formatText('underline')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors" title="Underline"><Underline size={13} /></button>
                  <div className="w-[1px] h-4.5 bg-slate-805 mx-1" />
                  
                  <button type="button" onClick={() => formatBlock('<h1>')} className="p-2 hover:bg-slate-805 rounded-lg text-slate-300 hover:text-white transition-colors" title="H1 Title"><Heading1 size={13} /></button>
                  <button type="button" onClick={() => formatBlock('<h2>')} className="p-2 hover:bg-slate-805 rounded-lg text-slate-300 hover:text-white transition-colors" title="H2 Heading"><Heading2 size={13} /></button>
                  <button type="button" onClick={() => formatBlock('<h3>')} className="p-2 hover:bg-slate-805 rounded-lg text-slate-300 hover:text-white transition-colors" title="H3 Subheading"><Heading3 size={13} /></button>
                  <button type="button" onClick={() => formatBlock('<p>')} className="p-2 hover:bg-slate-805 text-xs font-black text-slate-300 hover:text-white transition-colors" title="Regular Paragraph">P</button>
                  <div className="w-[1px] h-4.5 bg-slate-805 mx-1" />

                  <button type="button" onClick={() => formatText('insertUnorderedList')} className="p-2 hover:bg-slate-805 rounded-lg text-slate-300 hover:text-white transition-colors" title="Bullet List"><List size={13} /></button>
                  <button type="button" onClick={() => formatText('insertOrderedList')} className="p-2 hover:bg-slate-805 rounded-lg text-slate-300 hover:text-white transition-colors" title="Numbered List"><ListOrdered size={13} /></button>
                  <button type="button" onClick={() => formatBlock('<blockquote>')} className="p-2 hover:bg-slate-805 rounded-lg text-slate-300 hover:text-white transition-colors" title="Block Quote"><Quote size={13} /></button>
                  <button type="button" onClick={() => formatText('insertHorizontalRule')} className="p-2 hover:bg-slate-850 rounded-lg text-slate-300 hover:text-white transition-colors" title="Horizontal Divider"><Minus size={13} /></button>
                  <div className="w-[1px] h-4.5 bg-slate-805 mx-1" />

                  <button 
                    type="button" 
                    onClick={() => {
                      const selStr = window.getSelection()?.toString();
                      setLinkText(selStr || '');
                      setShowLinkModal(true);
                    }} 
                    className="p-2 hover:bg-slate-805 rounded-lg text-slate-300 hover:text-white transition-colors" 
                    title="Insert Link"
                  >
                    <LinkIcon size={13} />
                  </button>
                  <button type="button" onClick={() => setShowImageModal(true)} className="p-2 hover:bg-slate-805 rounded-lg text-slate-300 hover:text-white transition-colors" title="Insert Graphic Image"><ImageIcon size={13} /></button>
                  <div className="w-[1px] h-4.5 bg-slate-805 mx-1" />

                  <button type="button" onClick={() => formatText('undo')} className="p-2 hover:bg-slate-805 rounded-lg text-slate-300 override:text-zinc-50 hover:text-white transition-colors" title="Undo"><Undo2 size={13} /></button>
                  <button type="button" onClick={() => formatText('redo')} className="p-2 hover:bg-slate-805 rounded-lg text-slate-300 hover:text-white transition-colors" title="Redo"><Redo2 size={13} /></button>
                </div>

                {/* 4. MAIN NATIVE CONTENTEDITABLE - ZERO CURSOR JUMPS - MAXIMUM PERFORMANCE */}
                <div 
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={onEditorInput}
                  onBlur={onEditorBlur}
                  onClick={handleEditorClick}
                  className="outline-none focus:outline-none min-h-[480px] text-lg leading-relaxed text-slate-800 dark:text-zinc-200 placeholder:text-slate-300 w-full prose prose-slate dark:prose-invert font-sans pt-4 no-scrollbar pb-10"
                  data-placeholder="Start writing your beautiful post here..."
                  id="canvas-rich-text-editor-field"
                />
              </div>
            )}

            {/* LOWER CANVAS METRIC BAR */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none select-none">
              <div className="flex items-center gap-4">
                <span>{totalWords} Words</span>
                <span>{countReadingTime} Min Read</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Auto-sync connected</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. RIGHT SIDEBAR: HIGH END METADATA PANEL SETTINGS */}
        <aside className={`hidden md:flex w-[295px] shrink-0 border-l border-slate-200/85 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex-col overflow-y-auto p-5 space-y-5 no-scrollbar select-none z-10 transition-all duration-300 ${
          isFullscreenBlog ? 'h-full sticky top-0' : 'h-[92vh] sticky top-18'
        }`}>
          
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Settings size={13} className="text-amber-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Post Configuration Layout</h3>
          </div>

          {/* Status field select */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Post Status Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as BlogPost['status']);
                  setSaveStatus('unsaved');
                }}
                className="w-full pl-3.5 pr-8 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 rounded-xl text-xs font-semibold outline-none appearance-none focus:border-amber-500"
              >
                <option value="Draft">Draft</option>
                <option value="Review">In Review</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Published">Published Live</option>
                <option value="Archived">Archived</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Category Input */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Category Taxonomy</label>
            <input
              type="text"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSaveStatus('unsaved');
              }}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 rounded-xl text-xs font-semibold outline-none focus:border-amber-500"
              placeholder="e.g. Luxury Tour, Flight secrets..."
            />
          </div>

          {/* Tags collection component */}
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Search & Tag Entities</label>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyPressTag}
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-750 rounded-xl text-xs font-semibold outline-none focus:border-amber-500"
                placeholder="Press ENTER to add"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {tags.map((tg, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-300/30">
                    <span>#{tg}</span>
                    <button type="button" onClick={() => handleRemoveTag(idx)} className="text-amber-700 hover:text-slate-950 font-normal">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Slug URL configuration */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">SEO slug custom permalink</label>
            <div className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl border border-slate-200/70 text-slate-400 dark:text-zinc-500 text-[10px] font-semibold truncate select-none">
              <span className="shrink-0 font-medium">/blog/</span>
              <input
                type="text"
                value={slug}
                disabled
                className="flex-1 bg-transparent p-0 border-0 outline-none select-all text-slate-600 dark:text-zinc-350 font-mono text-[9.5px]"
                title="Slug is synchronized with Post ID"
              />
            </div>
          </div>

          {/* Publish Date and Author */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Publish Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => {
                    setPublishDate(e.target.value);
                    setSaveStatus('unsaved');
                  }}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Agent Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => {
                  setAuthor(e.target.value);
                  setSaveStatus('unsaved');
                }}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-xs font-semibold outline-none focus:border-amber-500"
                placeholder="Author Name"
              />
            </div>
          </div>

          <div className="h-[1.5px] bg-slate-100 dark:bg-zinc-800" />

          {/* SEO meta title and SEO desc */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Globe size={13} />
              <span className="text-[9.5px] font-black uppercase tracking-wider">Search Engine Optimization</span>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-404 text-slate-400 block">SEO Meta Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => {
                  setSeoTitle(e.target.value);
                  setSaveStatus('unsaved');
                }}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 rounded-xl text-xs font-semibold outline-none focus:border-amber-500"
                placeholder={title || "SEO Title Meta"}
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">SEO Meta Description</label>
              <textarea
                value={seoDescription}
                onChange={(e) => {
                  setSeoDescription(e.target.value);
                  setSaveStatus('unsaved');
                }}
                rows={3}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 rounded-xl text-xs font-semibold outline-none focus:border-amber-500 resize-none font-sans"
                placeholder={subtitle || "Meta description for snippet layouts"}
              />
            </div>
          </div>

        </aside>
      </div>

      {/* 4. MODALS & SLICK DECK MODAL DIALOGS */}
      
      {/* A. Dynamic Link insertion modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[195] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form 
            onSubmit={handleInsertLink} 
            className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 p-5 space-y-4 text-left shadow-lg"
          >
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-semibold text-sm">Insert Custom Destination Link</h3>
              <button type="button" onClick={() => setShowLinkModal(false)} className="text-slate-400 font-bold">&times;</button>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase">Redirect URL Path</label>
                <input
                  type="url"
                  placeholder="e.g. https://khtravels.com/packages"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800 border rounded-xl text-xs outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase">Display Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Tour packages"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800 border rounded-xl text-xs outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 text-xs font-bold uppercase">
              <button 
                type="button" 
                onClick={() => setShowLinkModal(false)} 
                className="px-3.5 py-2 hover:bg-slate-50 rounded-lg text-slate-550"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg"
              >
                Insert Link
              </button>
            </div>
          </form>
        </div>
      )}

      {/* B. Dynamic Image insertion / media vault picker modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-[195] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 p-5 space-y-4 text-left shadow-lg">
            
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-semibold text-sm">Vault Asset Image Composer</h3>
              <button type="button" onClick={() => setShowImageModal(false)} className="text-slate-400 font-bold">&times;</button>
            </div>

            {/* URL text insertion option */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase">Graphic Image Web URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="e.g. https://images.unsplash.com/photo-1627581177651"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-zinc-805 border rounded-xl text-xs outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleInsertImage(imageUrlInput)}
                  className="px-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase"
                >
                  Insert Source
                </button>
              </div>
            </div>

            <div className="my-[1.5px] h-[1px] bg-slate-100 flex items-center justify-center text-[10px] text-slate-350 uppercase select-none font-bold">
              <span className="bg-white px-2">Or Upload local file asset</span>
            </div>

            {/* Upload file directly to insert inside editor */}
            <div className="space-y-2">
              <label className="h-24 rounded-2xl border border-dashed border-slate-250 dark:border-zinc-700 hover:border-amber-500 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-zinc-900/20 text-center transition-all p-4">
                <Loader2 size={24} className={`text-amber-500 animate-spin ${isUploadingImage ? 'block' : 'hidden'}`} />
                <ImageIcon className={`text-slate-350 dark:text-zinc-600 ${isUploadingImage ? 'hidden' : 'block'}`} size={24} />
                <span className="text-[10px] font-black uppercase mt-2">Select JPEG/PNG picture</span>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFeaturedImageUpload(e, true)} 
                />
              </label>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase">Royal Saudi Vacation Presets</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  'https://images.unsplash.com/photo-1627581177651-78939c636f3c?w=400',
                  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
                  'https://images.unsplash.com/photo-1582233479366-6d38bc390a08?w=400',
                  'https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?w=400'
                ].map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleInsertImage(img)}
                    className="aspect-square rounded-lg overflow-hidden bg-zinc-950 cursor-pointer border border-slate-200 hover:scale-105 active:scale-95 transition-all text-center"
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 text-xs font-bold uppercase">
              <button 
                type="button" 
                onClick={() => setShowImageModal(false)} 
                className="px-3.5 py-2 hover:bg-slate-50 text-slate-550 rounded-lg"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* C. MOBILE SIDEBAR/SETTINGS DEEPLINK DRAWER */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-[195] bg-slate-900/60 flex justify-end md:hidden animate-in fade-in">
          <div className="w-[300px] h-full bg-white dark:bg-zinc-900 shadow-xl overflow-y-auto p-5 space-y-4 text-left flex flex-col">
            
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm uppercase">Article Configurations</h3>
              <button type="button" onClick={() => setShowSettingsDrawer(false)} className="text-slate-400 text-lg font-bold">&times;</button>
            </div>

            {/* mobile settings form duplicate to fit beautifully */}
            <div className="space-y-4 flex-1">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Post Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as BlogPost['status']);
                    setSaveStatus('unsaved');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none"
                >
                  <option value="Draft">Draft</option>
                  <option value="Review">In Review</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Published">Published Live</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSaveStatus('unsaved');
                  }}
                  placeholder="e.g. Premium Tour"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Publish Date</label>
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => {
                    setPublishDate(e.target.value);
                    setSaveStatus('unsaved');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => {
                    setAuthor(e.target.value);
                    setSaveStatus('unsaved');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">SEO Meta Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => {
                    setSeoTitle(e.target.value);
                    setSaveStatus('unsaved');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400">SEO Description</label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => {
                    setSeoDescription(e.target.value);
                    setSaveStatus('unsaved');
                  }}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none resize-none font-sans"
                />
              </div>
            </div>

            <button
              onClick={() => {
                handleManualSave();
                setShowSettingsDrawer(false);
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Apply Configurations
            </button>

          </div>
        </div>
      )}

      {/* D. TEXT SELECTION FLOATING BUBBLE TOOLBAR */}
      {textToolbar.visible && (
        <div 
          className="fixed z-[1000] flex flex-col bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-1.5 gap-1.5 -translate-x-1/2 -translate-y-[135%] animate-in fade-in zoom-in-95 duration-100 ease-out select-none"
          style={{ left: textToolbar.x, top: textToolbar.y }}
        >
          {/* Main Action Row */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); formatText('bold'); }}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Bold"
            >
              <Bold size={13} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); formatText('italic'); }}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Italic"
            >
              <Italic size={13} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); formatText('underline'); }}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Underline"
            >
              <Underline size={13} />
            </button>

            <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />

            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); formatBlock('<h1>'); }}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="H1 Title"
            >
              <Heading1 size={13} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); formatBlock('<h2>'); }}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="H2 Group"
            >
              <Heading2 size={13} />
            </button>

            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); formatText('insertUnorderedList'); }}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Bullet List"
            >
              <List size={13} />
            </button>

            <button
              type="button"
              onMouseDown={(e) => { 
                e.preventDefault(); 
                const selStr = window.getSelection()?.toString();
                setLinkText(selStr || '');
                setShowLinkModal(true);
              }}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Insert Link"
            >
              <LinkIcon size={13} />
            </button>

            <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />

            {/* Custom Color toggles */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowTextColorPanel(!showTextColorPanel);
                setShowBgColorPanel(false);
              }}
              className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${showTextColorPanel ? 'bg-amber-500 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              title="Text Foreground Color"
            >
              <Palette size={13} />
            </button>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowBgColorPanel(!showBgColorPanel);
                setShowTextColorPanel(false);
              }}
              className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${showBgColorPanel ? 'bg-amber-500 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              title="Text Highlight Background"
            >
              <Highlighter size={13} />
            </button>
          </div>

          {/* Color Palettes Grid Deck */}
          {showTextColorPanel && (
            <div className="flex items-center gap-1.5 px-1.5 py-1 border-t border-slate-800/80 animate-in fade-in duration-150">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider mr-1">Color:</span>
              <div className="flex gap-1">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyTextColor(c.value);
                      setShowTextColorPanel(false);
                    }}
                    className={`w-4 h-4 rounded-full ${c.class} hover:scale-125 transition-transform border border-white/20 shadow-sm cursor-pointer`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {showBgColorPanel && (
            <div className="flex items-center gap-1.5 px-1.5 py-1 border-t border-slate-800/80 animate-in fade-in duration-150">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider mr-1">Highlight:</span>
              <div className="flex gap-1">
                {HL_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyHighlightColor(c.value);
                      setShowBgColorPanel(false);
                    }}
                    className={`w-4 h-4 rounded-full ${c.class} hover:scale-125 transition-transform border border-white/20 shadow-sm cursor-pointer`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-slate-900" />
        </div>
      )}

      {/* E. CLICKED IMAGE FLOATING CONTROLS TOOLBAR */}
      {imageToolbar.visible && (
        <div 
          className="fixed z-[1000] flex flex-col bg-slate-900 border border-slate-850 text-white rounded-2xl shadow-2xl p-2.5 gap-2 -translate-x-1/2 -translate-y-[135%] animate-in fade-in zoom-in-95 duration-100 ease-out select-none animate-fadeIn"
          style={{ left: imageToolbar.x, top: imageToolbar.y }}
        >
          {/* Deck 1: Sizes & Alignment & Delete */}
          <div className="flex items-center gap-2 text-xs">
            {/* Sizes */}
            <div className="flex items-center gap-0.5">
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider mr-1 px-1">Size:</span>
              {['25%', '33%', '50%', '75%', '100%', 'Auto'].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => updateImageStyling(undefined, sz === 'Auto' ? 'auto' : sz)}
                  className="px-1.5 py-0.5 text-[9px] font-black uppercase hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition-all cursor-pointer"
                  title={`Resize image container to ${sz}`}
                >
                  {sz === 'Auto' ? 'Nat' : sz}
                </button>
              ))}
            </div>

            <div className="w-[1.5px] h-4 bg-slate-800" />

            {/* Alignment presets */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateImageStyling('left')}
                className="p-1 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition-all Cursor-pointer"
                title="Align Left"
              >
                <AlignLeft size={13} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateImageStyling('center')}
                className="p-1 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition-all Cursor-pointer"
                title="Align Center"
              >
                <AlignCenter size={13} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateImageStyling('right')}
                className="p-1 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition-all Cursor-pointer"
                title="Align Right"
              >
                <AlignRight size={13} />
              </button>
            </div>

            <div className="w-[1.5px] h-4 bg-slate-800" />

            {/* Delete Image Block */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={deleteImage}
              className="p-1 hover:bg-rose-950 rounded-md text-rose-405 hover:text-white transition-all cursor-pointer ml-auto"
              title="Delete Image Block"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Deck 2: Card Custom Framing & Style presets */}
          <div className="flex flex-wrap items-center gap-2.5 border-t border-slate-800/80 pt-2 text-[8px] tracking-wide font-bold">
            {/* Roundness */}
            <div className="flex items-center gap-1">
              <span className="font-semibold uppercase text-slate-500 mr-0.5">Round:</span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateImageEffects({ roundness: 'none' })}
                className="px-1.5 py-0.5 text-[8px] hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-all cursor-pointer uppercase"
                title="Sharp / Classic magazine border"
              >
                Sharp
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateImageEffects({ roundness: 'xl' })}
                className="px-1.5 py-0.5 text-[8px] hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-all cursor-pointer uppercase"
                title="Rounded xl border"
              >
                xl
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateImageEffects({ roundness: '3xl' })}
                className="px-1.5 py-0.5 text-[8px] hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-all cursor-pointer uppercase"
                title="Rounded 3xl rounded corner"
              >
                3xl
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateImageEffects({ roundness: 'full' })}
                className="px-1.5 py-0.5 text-[8px] hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-all cursor-pointer uppercase"
                title="Pill/Profile circular avatar"
              >
                Full
              </button>
            </div>

            <div className="w-[1px] h-3.5 bg-slate-850" />

            {/* Elevation Shadow */}
            <div className="flex items-center gap-1">
              <span className="font-semibold uppercase text-slate-500 mr-0.5">Shadow:</span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateImageEffects({ shadow: 'none' })}
                className="px-1.5 py-0.5 text-[8px] hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-all cursor-pointer uppercase"
                title="Flat card style shadow"
              >
                Flat
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateImageEffects({ shadow: 'md' })}
                className="px-1.5 py-0.5 text-[8px] hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-all cursor-pointer uppercase"
                title="Classy card shadow"
              >
                Soft
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateImageEffects({ shadow: '2xl' })}
                className="px-1.5 py-0.5 text-[8px] hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-all cursor-pointer uppercase"
                title="Polaroid 3D layered floating"
              >
                3D Float
              </button>
            </div>

            <div className="w-[1px] h-3.5 bg-slate-850" />

            {/* Notebook Border */}
            <div className="flex items-center gap-1">
              <span className="font-semibold uppercase text-slate-500 mr-0.5">Frame:</span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateImageEffects({ border: 'none' })}
                className="px-1.5 py-0.5 text-[8px] hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-all cursor-pointer uppercase"
                title="Borderless card design"
              >
                None
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateImageEffects({ border: 'thin' })}
                className="px-1.5 py-0.5 text-[8px] hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-all cursor-pointer uppercase"
                title="Durable book outline border"
              >
                Line
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateImageEffects({ border: 'dashed' })}
                className="px-1.5 py-0.5 text-[8px] hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-all cursor-pointer uppercase"
                title="Creative warm travelers outline"
              >
                Dashed
              </button>
            </div>
          </div>

          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-slate-900" />
        </div>
      )}

    </div>
  );
};
