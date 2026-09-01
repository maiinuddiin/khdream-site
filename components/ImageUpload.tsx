import React, { useState, useRef } from 'react';
import { Upload, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { getYouTubeId, getVimeoId } from '../lib/utils';

interface ImageUploadProps {
  onChange: (url: string) => void;
  value?: string;
  label?: string;
  recommendedSize?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onChange, value, label, recommendedSize }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 100MB for videos/resources)
    if (file.size > 100 * 1024 * 1024) {
      alert('File is too large. Please select a file under 100MB.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('kh_admin_token');

    if (!token) {
      setIsUploading(false);
      alert('Your session has expired or you are not authorized. Please log in again.');
      return;
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-admin-token': token
        },
        body: formData,
      }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        onChange(data.url);
      } else if (!response || response.status === 404) {
        // Fallback for static environments (GitHub Pages)
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            onChange(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        let errorMessage = 'Upload failed';
        let errorData: any = {};
        
        try {
          const text = await response.text();
          try {
            errorData = JSON.parse(text);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = text.slice(0, 100) || `Server error ${response.status}`;
          }
        } catch (e) {
          errorMessage = `Connection error (${response.status})`;
        }
        
        // Handle session expiration
        if (response.status === 401 || response.status === 403) {
          const isExpired = errorData.code === 'SESSION_EXPIRED' || 
                           errorMessage.toLowerCase().includes('expired') || 
                           errorMessage.toLowerCase().includes('authorized') ||
                           errorMessage.toLowerCase().includes('session');
          
          if (isExpired || token) {
            errorMessage = "Session expired or invalid. Please log in again.";
            localStorage.removeItem('kh_dream_session');
            localStorage.removeItem('kh_admin_token');
          }
        }
        
        console.error('Upload failed:', errorMessage);
        // Fallback to FileReader if server rejected
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            onChange(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.warn('Network upload unavailable, falling back to local base64 preview:', error);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          onChange(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    const oldValue = value;
    onChange('');
    
    // If it's an internal upload, try to delete it from the host storage too
    if (oldValue && oldValue.startsWith('/uploads/')) {
      try {
        const token = localStorage.getItem('kh_admin_token');
        if (!token) return;

        await fetch('/api/delete-file', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-admin-token': token
          },
          body: JSON.stringify({ url: oldValue })
        });
        console.log(`[STORAGE] Remote file deletion requested for: ${oldValue}`);
      } catch (err) {
        console.error("Failed to delete orphaned file from host storage:", err);
      }
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setShowUrlInput(false);
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        {label && <label className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">{label}</label>}
        {recommendedSize && <span className="text-[8px] font-bold text-emerald-500/80 uppercase tracking-widest">{recommendedSize}</span>}
      </div>
      
      <div className="group relative flex flex-col gap-2 p-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/50 rounded-xl hover:border-emerald-500/30 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative">
            {value ? (
              getYouTubeId(value) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(value)}?controls=0&showinfo=0&rel=0`}
                  className="w-full h-full pointer-events-none"
                />
              ) : getVimeoId(value) ? (
                <iframe
                  src={`https://player.vimeo.com/video/${getVimeoId(value)}?background=1`}
                  className="w-full h-full pointer-events-none"
                />
              ) : value.match(/\.(mp4|webm|ogg|mov)$|video/i) ? (
                <video src={value} className="w-full h-full object-cover" muted />
              ) : (
                <img src={value} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              )
            ) : (
              <ImageIcon className="text-slate-300 dark:text-zinc-600" size={18} />
            )}
          </div>
          
          <div className="flex-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-lg text-[9px] font-black uppercase hover:bg-slate-50 dark:hover:bg-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 transition-all disabled:opacity-50 shadow-sm"
            >
              {isUploading ? <Loader2 className="animate-spin" size={12} /> : <Upload size={12} />}
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-lg text-[9px] font-black uppercase hover:bg-slate-50 dark:hover:bg-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 transition-all shadow-sm"
            >
              <ImageIcon size={12} />
              URL
            </button>
            
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors"
                title="Remove Image"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {showUrlInput && (
          <form onSubmit={handleUrlSubmit} className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste image URL here..."
              className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-emerald-700 transition-all"
            >
              Add
            </button>
          </form>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,image/gif,video/*,.gif,.ttf,.otf,.woff,.woff2,.pdf,.doc,.docx"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageUpload;
