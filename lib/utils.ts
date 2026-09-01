import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

export const getVimeoId = (url: string) => {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
};

export const isVideoUrl = (url: string) => {
  if (!url) return false;
  // Check for common video extensions, "video" in mime type, or googlevideo (YouTube raw streams)
  const isDirectVideo = url.match(/\.(mp4|webm|ogg|mov|m4v)$|video|googlevideo/i);
  return !!(isDirectVideo || getYouTubeId(url) || getVimeoId(url));
};

export const toTitleCase = (str: string) => {
  if (!str) return '';
  // Convert text to a more natural title case if it's currently ALL CAPS
  const hasLower = /[a-z]/.test(str);
  const hasUpper = /[A-Z]/.test(str);
  
  if (hasUpper && !hasLower) {
    return str.toLowerCase().split(' ').map(word => {
      if (word.length <= 1) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }
  return str;
};
