export function getAudioUrl(relativePath: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${relativePath}`;
  }
  return relativePath;
}

export function isLocalhost(): boolean {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '[::1]';
  }
  return false;
}
