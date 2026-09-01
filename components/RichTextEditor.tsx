import React, { useEffect, useMemo, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { debounce } from 'lodash';
import { Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Type, Eraser, Palette, ChevronDown, Check, Maximize2, Minimize2 } from 'lucide-react';

// Custom Quill Image Blot to support native inline styling, width, height, and alignment (float) features
const ImageFormatBase = Quill.import('formats/image') as any;

class CustomImageBlot extends ImageFormatBase {
  static create(value: any) {
    const node = super.create(value);
    
    let src = '';
    let width = '';
    let height = '';
    let style = '';
    let align = '';

    if (typeof value === 'string') {
      src = value;
    } else if (value && typeof value === 'object') {
      src = value.src || '';
      width = value.width || '';
      height = value.height || '';
      style = value.style || '';
      align = value.align || '';
    }

    node.setAttribute('src', src);
    if (width) node.setAttribute('width', width);
    if (height) node.setAttribute('height', height);
    if (style) node.setAttribute('style', style);
    if (align) node.setAttribute('align', align);

    return node;
  }

  static formats(domNode: HTMLElement) {
    return {
      src: domNode.getAttribute('src') || '',
      width: domNode.getAttribute('width') || '',
      height: domNode.getAttribute('height') || '',
      style: domNode.getAttribute('style') || '',
      align: domNode.getAttribute('align') || '',
    };
  }

  format(name: string, value: any) {
    if (['width', 'height', 'style', 'align'].indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }

  static value(domNode: HTMLElement) {
    return {
      src: domNode.getAttribute('src') || '',
      width: domNode.getAttribute('width') || '',
      height: domNode.getAttribute('height') || '',
      style: domNode.getAttribute('style') || '',
      align: domNode.getAttribute('align') || '',
    };
  }
}

CustomImageBlot.blotName = 'image';
CustomImageBlot.tagName = 'img';
Quill.register(CustomImageBlot, true);

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  className?: string;
  placeholder?: string;
  minimal?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  postId?: string; // Track active post to safely refresh content
}

interface ImageResizerOverlayProps {
  selectedImage: HTMLImageElement;
  overlayStyle: { top: number; left: number; width: number; height: number };
  onResize: (width: string | number, height?: string | number) => void;
  onAlign: (alignment: 'left' | 'center' | 'right') => void;
  onClose: () => void;
  onDelete?: () => void;
}

const ImageResizerOverlay: React.FC<ImageResizerOverlayProps> = ({
  selectedImage,
  overlayStyle,
  onResize,
  onAlign,
  onClose,
  onDelete
}) => {
  const dragStartRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const startDrag = (e: React.MouseEvent, handle: 'se' | 's' | 'e' | 'sw' | 'ne' | 'nw') => {
    e.preventDefault();
    e.stopPropagation();
    
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: overlayStyle.width,
      h: overlayStyle.height,
    };
    
    const aspectRatio = overlayStyle.width / overlayStyle.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.x;
      const dy = moveEvent.clientY - dragStartRef.current.y;
      
      let newWidth = dragStartRef.current.w;
      let newHeight = dragStartRef.current.h;

      if (handle === 'se') {
        newWidth = Math.max(50, dragStartRef.current.w + dx);
        newHeight = Math.max(50, dragStartRef.current.h + dy);
        if (moveEvent.shiftKey) {
          newHeight = newWidth / aspectRatio;
        }
      } else if (handle === 's') {
        newHeight = Math.max(50, dragStartRef.current.h + dy);
      } else if (handle === 'e') {
        newWidth = Math.max(50, dragStartRef.current.w + dx);
      } else if (handle === 'sw') {
        newWidth = Math.max(50, dragStartRef.current.w - dx);
        newHeight = Math.max(50, dragStartRef.current.h + dy);
        if (moveEvent.shiftKey) {
          newHeight = newWidth / aspectRatio;
        }
      } else if (handle === 'ne') {
        newWidth = Math.max(50, dragStartRef.current.w + dx);
        newHeight = Math.max(50, dragStartRef.current.h - dy);
        if (moveEvent.shiftKey) {
          newHeight = newWidth / aspectRatio;
        }
      } else if (handle === 'nw') {
        newWidth = Math.max(50, dragStartRef.current.w - dx);
        newHeight = Math.max(50, dragStartRef.current.h - dy);
        if (moveEvent.shiftKey) {
          newHeight = newWidth / aspectRatio;
        }
      }

      onResize(newWidth, newHeight);
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      className="absolute border-2 border-amber-500 pointer-events-none z-[110]"
      style={{
        top: `${overlayStyle.top}px`,
        left: `${overlayStyle.left}px`,
        width: `${overlayStyle.width}px`,
        height: `${overlayStyle.height}px`,
      }}
    >
      <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
      
      {/* SE handle */}
      <div 
        className="absolute w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-full cursor-se-resize pointer-events-auto shadow-md"
        style={{ right: '-7px', bottom: '-7px' }}
        onMouseDown={(e) => startDrag(e, 'se')}
      />
      {/* S handle */}
      <div 
        className="absolute w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-full cursor-s-resize pointer-events-auto shadow-md"
        style={{ left: 'calc(50% - 7px)', bottom: '-7px' }}
        onMouseDown={(e) => startDrag(e, 's')}
      />
      {/* E handle */}
      <div 
        className="absolute w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-full cursor-e-resize pointer-events-auto shadow-md"
        style={{ right: '-7px', top: 'calc(50% - 7px)' }}
        onMouseDown={(e) => startDrag(e, 'e')}
      />
      {/* SW handle */}
      <div 
        className="absolute w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-full cursor-sw-resize pointer-events-auto shadow-md"
        style={{ left: '-7px', bottom: '-7px' }}
        onMouseDown={(e) => startDrag(e, 'sw')}
      />
      {/* NE handle */}
      <div 
        className="absolute w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-full cursor-ne-resize pointer-events-auto shadow-md"
        style={{ right: '-7px', top: '-7px' }}
        onMouseDown={(e) => startDrag(e, 'ne')}
      />
      {/* NW handle */}
      <div 
        className="absolute w-3.5 h-3.5 bg-white border-2 border-amber-600 rounded-full cursor-nw-resize pointer-events-auto shadow-md"
        style={{ left: '-7px', top: '-7px' }}
        onMouseDown={(e) => startDrag(e, 'nw')}
      />

      <div 
        className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-slate-950 border border-slate-800 text-white text-[10px] font-bold px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-3 select-none pointer-events-auto whitespace-nowrap"
      >
        <span className="text-zinc-400 font-mono">
          {Math.round(overlayStyle.width)}px
        </span>
        
        {/* Width presets */}
        <div className="flex items-center gap-1 border-l border-white/10 pl-2.5">
          <button
            type="button"
            onClick={() => onResize('100%', 'auto')}
            className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] hover:bg-zinc-700 text-white cursor-pointer"
            title="Full Width"
          >
            100%
          </button>
          <button
            type="button"
            onClick={() => onResize('50%', 'auto')}
            className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] hover:bg-zinc-700 text-white cursor-pointer"
            title="Half Width"
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => onResize('33%', 'auto')}
            className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] hover:bg-zinc-700 text-white cursor-pointer"
            title="Third Width"
          >
            33%
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-l border-white/10 pl-2.5">
          <button 
            type="button"
            onClick={() => onAlign('left')}
            className="px-2 py-0.5 rounded hover:bg-white/10 text-[9px] cursor-pointer text-slate-300 hover:text-white"
            title="Align Left"
          >
            ◀ Left
          </button>
          <button 
            type="button"
            onClick={() => onAlign('center')}
            className="px-2 py-0.5 rounded hover:bg-white/10 text-[9px] cursor-pointer text-slate-300 hover:text-white"
            title="Align Center"
          >
            ▲ Center
          </button>
          <button 
            type="button"
            onClick={() => onAlign('right')}
            className="px-2 py-0.5 rounded hover:bg-white/10 text-[9px] cursor-pointer text-slate-300 hover:text-white"
            title="Align Right"
          >
            Right ▶
          </button>
        </div>

        {onDelete && (
          <button 
            type="button"
            onClick={onDelete}
            className="text-rose-500 hover:text-rose-400 transition-colors uppercase text-[9px] border-l border-white/10 pl-2.5 cursor-pointer font-black flex items-center gap-1.5"
            title="Delete image from narrative"
          >
            <span>🗑️</span>
            <span>Delete</span>
          </button>
        )}

        <button 
          type="button"
          onClick={onClose}
          className="text-amber-400 hover:text-amber-350 transition-colors uppercase text-[9px] border-l border-white/10 pl-2.5 cursor-pointer font-black"
        >
          Done
        </button>
      </div>
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  className = "", 
  placeholder = "", 
  minimal = false,
  onImageUpload,
  postId
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  
  // Track previous ID to know when to force reset Quill content
  const prevPostIdRef = useRef<string | undefined>(postId);
  
  // State for image operations
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  
  useEffect(() => {
    selectedImageRef.current = selectedImage;
  }, [selectedImage]);

  const [overlayStyle, setOverlayStyle] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // States for text bubble formatting toolbar (MS Word style)
  const [textToolbarStyle, setTextToolbarStyle] = useState<{ top: number; left: number; index: number; length: number } | null>(null);
  const [activeFormats, setActiveFormats] = useState<any>({});
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Close fullscreen on ESC key
  useEffect(() => {
    if (!isFullscreen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Handle auto-saving / debounced state update to parent
  const debouncedOnChange = useMemo(
    () => debounce((content: string) => {
      onChangeRef.current(content);
    }, 400),
    []
  );

  // A clean helper function to natively delete the image in Quill and sync DOM
  const deleteSelectedImage = () => {
    const img = selectedImageRef.current;
    if (!img) return;

    if (quillRef.current) {
      const blot = Quill.find(img) as any;
      if (blot) {
        const index = quillRef.current.getIndex(blot);
        if (index >= 0) {
          quillRef.current.deleteText(index, 1, 'user');
          setSelectedImage(null);
          selectedImageRef.current = null;
          const html = quillRef.current.root.innerHTML || '';
          onChangeRef.current(html);
          return;
        }
      }
    }

    // Direct DOM fallback if blot fails
    img.remove();
    setSelectedImage(null);
    selectedImageRef.current = null;
    if (quillRef.current) {
      quillRef.current.update('user');
      const html = quillRef.current.root.innerHTML || '';
      onChangeRef.current(html);
    }
  };

  const deleteSelectedImageRef = useRef(deleteSelectedImage);
  useEffect(() => {
    deleteSelectedImageRef.current = deleteSelectedImage;
  });

  const updateOverlayPosition = () => {
    if (!selectedImage || !wrapperRef.current) {
      setOverlayStyle(null);
      return;
    }
    const img = selectedImage;
    const wrapper = wrapperRef.current;
    
    const imgRect = img.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    
    setOverlayStyle({
      top: imgRect.top - wrapperRect.top,
      left: imgRect.left - wrapperRect.left,
      width: imgRect.width,
      height: imgRect.height
    });
  };

  // Re-sync overlay on resize and scroll
  useEffect(() => {
    if (!selectedImage || !containerRef.current) return;
    
    const container = containerRef.current;
    const qlEditor = container.querySelector('.ql-editor');
    
    const handleScrollAndResize = () => {
      updateOverlayPosition();
    };
    
    window.addEventListener('resize', handleScrollAndResize, { passive: true });
    if (qlEditor) qlEditor.addEventListener('scroll', handleScrollAndResize, { passive: true });
    
    updateOverlayPosition();
    const timer = setTimeout(updateOverlayPosition, 50);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleScrollAndResize);
      if (qlEditor) qlEditor.removeEventListener('scroll', handleScrollAndResize);
    };
  }, [selectedImage]);

  // Click outside to deselect image and text bubble selection
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      const target = e.target as HTMLElement;
      
      if (!wrapperRef.current.contains(target) && 
          !target.closest('.rich-text-editor-container') && 
          !target.closest('.rich-text-bubble-toolbar')) {
        setSelectedImage(null);
        setTextToolbarStyle(null);
        setShowColorPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleGlobalClick);
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, []);

  // Initialize Quill instance
  useEffect(() => {
    if (containerRef.current && !quillRef.current) {
      containerRef.current.innerHTML = '';
      
      const editorContainer = document.createElement('div');
      containerRef.current.appendChild(editorContainer);
      
      const toolbarOptions = minimal ? [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }],
        ['clean']
      ] : [
        [{ 'header': [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ];

      const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
          const file = input.files?.[0];
          if (file) {
            if (onImageUpload) {
              try {
                const url = await onImageUpload(file);
                insertImage(url);
              } catch (err) {
                console.error("Image upload failed:", err);
                alert("Upload failed. Please verify your connection.");
              }
            } else {
              const reader = new FileReader();
              reader.onload = () => {
                const url = reader.result as string;
                insertImage(url);
              };
              reader.readAsDataURL(file);
            }
          }
        };
      };

      const insertImage = (url: string) => {
        if (!quillRef.current) return;
        const range = quillRef.current.getSelection();
        if (range) {
          quillRef.current.insertEmbed(range.index, 'image', url);
          quillRef.current.setSelection(range.index + 1);
        } else {
          quillRef.current.insertEmbed(quillRef.current.getLength(), 'image', url);
        }
        debouncedOnChange(quillRef.current.root.innerHTML || '');
      };

      quillRef.current = new Quill(editorContainer, {
        theme: 'snow',
        placeholder: placeholder || "Write story details...",
        modules: {
          toolbar: minimal ? toolbarOptions : {
            container: toolbarOptions,
            handlers: {
              image: imageHandler
            }
          },
        },
      });

      // Hook up editor change events
      quillRef.current.on('text-change', () => {
        if (quillRef.current) {
          const html = quillRef.current.root.innerHTML || '';
          debouncedOnChange(html);
        }
      });

      quillRef.current.on('selection-change', (range) => {
        if (range && range.length > 0) {
          if (!quillRef.current) return;
          const text = quillRef.current.getText(range.index, range.length).trim();
          if (text === '') {
            setTextToolbarStyle(null);
            return;
          }

          const bounds = quillRef.current.getBounds(range.index, range.length);
          if (bounds) {
            const formats = quillRef.current.getFormat(range.index, range.length);
            setActiveFormats(formats);

            // Determine overlay position above the selection
            setTextToolbarStyle({
              top: bounds.top - 54, // comfortably above
              left: Math.max(10, bounds.left + (bounds.width / 2) - 160), // centered with safe margins
              index: range.index,
              length: range.length
            });
          }
        } else {
          // Keep if clicking inside the bubble toolbar (handled via mouseup/mousedown events)
          const activeEl = document.activeElement;
          if (activeEl && activeEl.closest('.rich-text-bubble-toolbar')) {
            return;
          }
          setTextToolbarStyle(null);
          setShowColorPicker(false);
        }
      });

      const handleEditorClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target && target.tagName === 'IMG') {
          setSelectedImage(target as HTMLImageElement);
        } else {
          setSelectedImage(null);
        }
      };

      const handleEditorKeyDown = (e: KeyboardEvent) => {
        if (selectedImageRef.current && (e.key === 'Backspace' || e.key === 'Delete')) {
          e.preventDefault();
          e.stopPropagation();
          deleteSelectedImageRef.current();
        }
      };

      quillRef.current.root.addEventListener('click', handleEditorClick);
      quillRef.current.root.addEventListener('keydown', handleEditorKeyDown);

      // Pre-load content
      if (value) {
        quillRef.current.root.innerHTML = value;
      }
    }
    
    return () => {
      debouncedOnChange.cancel();
      if (quillRef.current) {
        if (containerRef.current) containerRef.current.innerHTML = '';
        quillRef.current = null;
      }
    };
  }, [minimal, placeholder, debouncedOnChange, onImageUpload]);

  // RESET or Load initial content ONLY when switching active post id is detected!
  // This is the silver-bullet which avoids any typing stutter, lagging, cursor hopping, or text drops!
  useEffect(() => {
    if (postId !== prevPostIdRef.current) {
      prevPostIdRef.current = postId;
      setSelectedImage(null);
      if (quillRef.current) {
        quillRef.current.root.innerHTML = value || '';
      }
    }
  }, [postId, value]);

  // Global keydown to intercept and delete selected image directly on Backspace or Delete press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
        e.stopPropagation();
        deleteSelectedImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [selectedImage]);

  return (
    <div ref={wrapperRef} className={`relative rich-text-editor-container flat-editor-theme w-full ${isFullscreen ? 'rich-text-editor-container-fullscreen fixed inset-0 z-[120] p-6 md:p-12 bg-[#fafafa] dark:bg-zinc-950 flex flex-col h-screen overflow-hidden' : ''}`}>
      {isFullscreen && (
        <style>{`
          .rich-text-editor-container-fullscreen {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
          }
          .rich-text-editor-container-fullscreen .rich-text-editor {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            height: calc(100vh - 180px) !important;
          }
          .rich-text-editor-container-fullscreen .ql-container {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            min-height: unset !important;
            max-height: unset !important;
            height: 100% !important;
          }
          .rich-text-editor-container-fullscreen .ql-editor {
            flex: 1 !important;
            min-height: unset !important;
            max-height: unset !important;
            height: 100% !important;
            overflow-y: auto !important;
          }
        `}</style>
      )}

      {isFullscreen && (
        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-200 dark:border-zinc-800 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">DISTRACTION-FREE FULLSCREEN WRITER</span>
          </div>
          <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">ESC to Return</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-[8px] right-[10px] z-[130] p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 active:scale-95"
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Writing Option"}
      >
        {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
      </button>

      <div className={`rich-text-editor ${className}`} ref={containerRef} />
      {selectedImage && overlayStyle && (
        <ImageResizerOverlay 
          selectedImage={selectedImage}
          overlayStyle={overlayStyle}
          onResize={(newWidth, newHeight) => {
            const widthVal = typeof newWidth === 'string' ? newWidth : `${Math.round(newWidth)}px`;
            const heightVal = newHeight ? (typeof newHeight === 'string' ? newHeight : `${Math.round(newHeight)}px`) : undefined;
            
            selectedImage.style.width = widthVal;
            selectedImage.setAttribute('width', widthVal);
            if (heightVal && heightVal !== 'auto') {
              selectedImage.style.height = heightVal;
              selectedImage.setAttribute('height', heightVal);
            } else {
              selectedImage.style.height = 'auto';
              selectedImage.removeAttribute('height');
            }
            
            const currentStyle = selectedImage.getAttribute('style') || '';
            
            if (quillRef.current) {
              const blot = Quill.find(selectedImage) as any;
              if (blot && typeof blot.format === 'function') {
                blot.format('width', widthVal);
                if (heightVal && heightVal !== 'auto') {
                  blot.format('height', heightVal);
                } else {
                  blot.format('height', null);
                }
                blot.format('style', currentStyle);
              }
              quillRef.current.update();
              const html = quillRef.current.root.innerHTML;
              onChangeRef.current(html);
            }
            updateOverlayPosition();
          }}
          onAlign={(alignment) => {
            if (alignment === 'left') {
              selectedImage.style.float = 'left';
              selectedImage.style.display = 'inline-block';
              selectedImage.style.margin = '10px 20px 10px 0px';
              selectedImage.style.clear = 'both';
            } else if (alignment === 'right') {
              selectedImage.style.float = 'right';
              selectedImage.style.display = 'inline-block';
              selectedImage.style.margin = '10px 0px 10px 20px';
              selectedImage.style.clear = 'both';
            } else {
              selectedImage.style.float = 'none';
              selectedImage.style.display = 'block';
              selectedImage.style.margin = '15px auto';
              selectedImage.style.clear = 'both';
            }
            
            const currentStyle = selectedImage.getAttribute('style') || '';
            
            if (quillRef.current) {
              const blot = Quill.find(selectedImage) as any;
              if (blot && typeof blot.format === 'function') {
                blot.format('style', currentStyle);
              }
              quillRef.current.update();
              const html = quillRef.current.root.innerHTML;
              onChangeRef.current(html);
            }
            updateOverlayPosition();
          }}
          onClose={() => setSelectedImage(null)}
          onDelete={() => {
            deleteSelectedImage();
          }}
        />
      )}
      {textToolbarStyle && (
        <div 
          className="border border-slate-700/60 text-white rounded-xl shadow-2xl flex items-center p-1.5 gap-1.5 absolute z-[120] rich-text-bubble-toolbar animate-fadeIn hover:border-slate-500 transition-all"
          style={{
            top: `${textToolbarStyle.top}px`,
            left: `${textToolbarStyle.left}px`,
            backgroundColor: '#0f172a'
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* Bold */}
          <button
            type="button"
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ${activeFormats.bold ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-200'}`}
            onClick={() => {
              if (quillRef.current) {
                const active = activeFormats.bold;
                quillRef.current.formatText(textToolbarStyle.index, textToolbarStyle.length, 'bold', !active, 'user');
                setActiveFormats(prev => ({ ...prev, bold: !active }));
                debouncedOnChange(quillRef.current.root.innerHTML);
              }
            }}
            title="Bold"
          >
            <Bold size={14} />
          </button>

          {/* Italic */}
          <button
            type="button"
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ${activeFormats.italic ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-200'}`}
            onClick={() => {
              if (quillRef.current) {
                const active = activeFormats.italic;
                quillRef.current.formatText(textToolbarStyle.index, textToolbarStyle.length, 'italic', !active, 'user');
                setActiveFormats(prev => ({ ...prev, italic: !active }));
                debouncedOnChange(quillRef.current.root.innerHTML);
              }
            }}
            title="Italic"
          >
            <Italic size={14} />
          </button>

          {/* Underline */}
          <button
            type="button"
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ${activeFormats.underline ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-200'}`}
            onClick={() => {
              if (quillRef.current) {
                const active = activeFormats.underline;
                quillRef.current.formatText(textToolbarStyle.index, textToolbarStyle.length, 'underline', !active, 'user');
                setActiveFormats(prev => ({ ...prev, underline: !active }));
                debouncedOnChange(quillRef.current.root.innerHTML);
              }
            }}
            title="Underline"
          >
            <Underline size={14} />
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ${activeFormats.strike ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-200'}`}
            onClick={() => {
              if (quillRef.current) {
                const active = activeFormats.strike;
                quillRef.current.formatText(textToolbarStyle.index, textToolbarStyle.length, 'strike', !active, 'user');
                setActiveFormats(prev => ({ ...prev, strike: !active }));
                debouncedOnChange(quillRef.current.root.innerHTML);
              }
            }}
            title="Strikethrough"
          >
            <Strikethrough size={14} />
          </button>

          <div className="w-[1px] h-4 bg-slate-700/60 select-none self-center" />

          {/* Heading 1 Toggle */}
          <button
            type="button"
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ${activeFormats.header === 1 ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-200'}`}
            onClick={() => {
              if (quillRef.current) {
                const currentHeader = activeFormats.header;
                const nextVal = currentHeader === 1 ? false : 1;
                quillRef.current.formatText(textToolbarStyle.index, textToolbarStyle.length, 'header', nextVal, 'user');
                setActiveFormats(prev => ({ ...prev, header: nextVal }));
                debouncedOnChange(quillRef.current.root.innerHTML);
              }
            }}
            title="Heading 1"
          >
            <Heading1 size={14} />
          </button>

          {/* Heading 2 Toggle */}
          <button
            type="button"
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ${activeFormats.header === 2 ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-200'}`}
            onClick={() => {
              if (quillRef.current) {
                const currentHeader = activeFormats.header;
                const nextVal = currentHeader === 2 ? false : 2;
                quillRef.current.formatText(textToolbarStyle.index, textToolbarStyle.length, 'header', nextVal, 'user');
                setActiveFormats(prev => ({ ...prev, header: nextVal }));
                debouncedOnChange(quillRef.current.root.innerHTML);
              }
            }}
            title="Heading 2"
          >
            <Heading2 size={14} />
          </button>

          {/* Clear formatting */}
          <button
            type="button"
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-rose-400 cursor-pointer`}
            onClick={() => {
              if (quillRef.current) {
                quillRef.current.formatText(textToolbarStyle.index, textToolbarStyle.length, 'bold', false, 'user');
                quillRef.current.formatText(textToolbarStyle.index, textToolbarStyle.length, 'italic', false, 'user');
                quillRef.current.formatText(textToolbarStyle.index, textToolbarStyle.length, 'underline', false, 'user');
                quillRef.current.formatText(textToolbarStyle.index, textToolbarStyle.length, 'strike', false, 'user');
                quillRef.current.formatText(textToolbarStyle.index, textToolbarStyle.length, 'header', false, 'user');
                quillRef.current.formatText(textToolbarStyle.index, textToolbarStyle.length, 'color', false, 'user');
                setActiveFormats({});
                debouncedOnChange(quillRef.current.root.innerHTML);
              }
            }}
            title="Clear formatting"
          >
            <Eraser size={14} />
          </button>

          <div className="w-[1px] h-4 bg-slate-700/60 select-none self-center" />

          {/* Text Color Picker Selector */}
          <div className="relative flex items-center">
            <button
              type="button"
              className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer ${activeFormats.color ? 'text-amber-400' : 'text-slate-200'}`}
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Text Color"
            >
              <Palette size={14} />
              <ChevronDown size={10} className="opacity-60" />
            </button>

            {showColorPicker && (
              <div 
                className="absolute top-9 left-0 bg-slate-950 border border-slate-800 p-2 rounded-xl shadow-2xl flex gap-1.5 z-[130] rich-text-bubble-color-picker"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {[
                  { name: 'Default', value: false, label: 'T', cssColor: '#ffffff' },
                  { name: 'Red', value: '#e11d48', label: 'R', cssColor: '#e11d48' },
                  { name: 'Blue', value: '#2563eb', label: 'B', cssColor: '#2563eb' },
                  { name: 'Green', value: '#16a34a', label: 'G', cssColor: '#16a34a' },
                  { name: 'Amber', value: '#d97706', label: 'A', cssColor: '#d97706' },
                  { name: 'Purple', value: '#9333ea', label: 'P', cssColor: '#9333ea' }
                ].map((col) => {
                  const isSelected = activeFormats.color === col.value || (!activeFormats.color && col.value === false);
                  return (
                    <button
                      key={col.name}
                      type="button"
                      className="w-5.5 h-5.5 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 text-[9px] font-black"
                      style={{ 
                        backgroundColor: col.cssColor, 
                        color: col.value === false ? '#000000' : '#ffffff',
                        border: isSelected ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.2)'
                      }}
                      onClick={() => {
                        if (quillRef.current) {
                          quillRef.current.formatText(textToolbarStyle.index, textToolbarStyle.length, 'color', col.value, 'user');
                          setActiveFormats(prev => ({ ...prev, color: col.value }));
                          debouncedOnChange(quillRef.current.root.innerHTML);
                          setShowColorPicker(false);
                        }
                      }}
                      title={col.name}
                    >
                      {isSelected && <span className="text-[7px] font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
