import { useEffect, useState } from 'react';
import type { Language } from '@/lib/lzl/config';
import { media, mediaSrcSet, mediaUrl, type MediaImage } from '@/config/media';

export function MediaImg({ m, lang, className, sizes = '(max-width:760px) 100vw, 33vw', priority = false, width = 800 }: { m: MediaImage; lang: Language; className?: string; sizes?: string; priority?: boolean; width?: number }) {
  return <img src={mediaUrl(m, width)} srcSet={mediaSrcSet(m)} sizes={sizes} width={m.width} height={m.height} alt={m.alt[lang]} className={className} loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : 'auto'} />;
}

/** Full-screen background video; mobile and reduced-motion users only get the poster image. */
export function HeroMedia({ lang }: { lang: Language }) {
  const [video, setVideo] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 761px) and (prefers-reduced-motion: no-preference)');
    const update = () => setVideo(mq.matches);
    update(); mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const poster = media.hero.poster;
  return <>
    <MediaImg m={poster} lang={lang} className="hero-img" sizes="100vw" priority width={1600} />
    {video && <video className="hero-img hero-video" autoPlay muted loop playsInline preload="metadata" poster={mediaUrl(poster, 1600)} aria-label={media.hero.videoAlt[lang]}><source src={media.hero.video} type="video/mp4" /></video>}
  </>;
}
