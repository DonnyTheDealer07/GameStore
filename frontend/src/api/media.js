const mediaBase = (import.meta.env.VITE_MEDIA_URL || '').replace(/\/+$/, '')

export function mediaUrl(path) {
  return mediaBase && /^\/(?!\/)/.test(path) ? mediaBase + path : path
}

export const heroVideo = mediaUrl('/background/synthwave-loop.mp4')
export const heroPoster = mediaUrl('/background/synthwave-poster.webp')
