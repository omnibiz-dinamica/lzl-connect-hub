// Central media registry. Replace the `src` values with real LZL Services photos later.
// Temporary images/video: Pexels (free for commercial use) — Tima Miroshnichenko.
import heroVideo from '@/assets/lzl-hero.mp4.asset.json';
import type { Language } from '@/lib/lzl/config';

export type MediaImage = { src: string; width: number; height: number; alt: Record<Language, string>; credit?: string };

const pexels = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`;
const img = (id: number, width: number, height: number, nl: string, fr: string): MediaImage => ({ src: pexels(id), width, height, alt: { nl, fr }, credit: 'Pexels · Tima Miroshnichenko' });

/** Responsive, compressed (WebP where supported) URL for a media image. */
export function mediaUrl(m: MediaImage, w: number) {
  if (!m.src.startsWith('https://images.pexels.com')) return m.src;
  return `${m.src}?auto=compress&cs=tinysrgb&fm=webp&w=${w}`;
}
export function mediaSrcSet(m: MediaImage, widths = [480, 800, 1200, 1600]) {
  if (!m.src.startsWith('https://images.pexels.com')) return undefined;
  return widths.map(w => `${mediaUrl(m, w)} ${w}w`).join(', ');
}

const photos = {
  officeTeam: img(6197121, 1600, 1067, 'Schoonmakers in werkkledij reinigen een licht, modern interieur', 'Agents de nettoyage en tenue de travail dans un intérieur moderne et lumineux'),
  openSpace: img(6196691, 1067, 1600, 'Schoonmaakteam aan het werk in een ruime, lichte vergaderruimte', 'Équipe de nettoyage au travail dans une salle de réunion spacieuse et lumineuse'),
  windows: img(6197122, 1067, 1600, 'Professional reinigt hoge ramen met een telescoopsteel', 'Professionnel nettoyant de grandes vitres avec une perche télescopique'),
  floors: img(6197116, 1067, 1600, 'Vloer wordt gedweild met een professionele vlakmop', 'Sol nettoyé avec un balai à plat professionnel'),
  vacuum: img(6195275, 1600, 1067, 'Professionele stofzuiger op een lichte vloer', 'Aspirateur professionnel sur un sol clair'),
  walls: img(6196695, 1067, 1600, 'Schoonmaker reinigt wandtegels met emmer en doek', 'Agent de nettoyage essuyant un mur carrelé avec seau et chiffon'),
  protective: img(6195956, 1067, 1600, 'Schoonmaker in beschermende kledij achter een grote glaswand', 'Agent en tenue de protection derrière une grande baie vitrée'),
  kitchen: img(6195111, 1600, 1067, 'Schoonmaakster maakt een keukenwerkblad schoon', 'Agente de nettoyage nettoyant un plan de travail'),
  living: img(6195278, 1067, 1600, 'Twee schoonmakers werken in een lichte ruimte', 'Deux agents de nettoyage dans un espace lumineux'),
  team: img(6195125, 1600, 1067, 'Schoonmaakteam in werkkledij met professioneel materiaal', 'Équipe de nettoyage en tenue de travail avec du matériel professionnel'),
};

export const media = {
  hero: {
    video: heroVideo.url,
    poster: photos.officeTeam,
    videoAlt: { nl: 'Video: schoonmaakster reinigt een raam in een zonnige ruimte', fr: 'Vidéo : agente de nettoyage nettoyant une vitre dans une pièce ensoleillée' },
  },
  services: {
    kantoorschoonmaak: photos.openSpace,
    bouwopkuis: photos.protective,
    ramenwas: photos.windows,
    'praktijken-winkels': photos.floors,
    'gemeenschappelijke-delen': photos.vacuum,
    dieptereiniging: photos.walls,
  } as Record<string, MediaImage>,
  sectors: {
    kantoren: photos.officeTeam,
    winkels: photos.floors,
    praktijken: photos.kitchen,
    syndici: photos.living,
  } as Record<string, MediaImage>,
  serviceGallery: [photos.windows, photos.floors, photos.walls, photos.vacuum, photos.openSpace, photos.kitchen],
  howItWorks: photos.walls,
  beforeAfter: { before: photos.living, after: photos.floors },
  finalCta: photos.openSpace,
  aboutTeam: photos.team,
  og: photos.team,
  fallback: photos.officeTeam,
};

export const serviceImage = (slug: string) => media.services[slug] ?? media.fallback;
export const sectorImage = (slug: string) => media.sectors[slug] ?? media.fallback;
export function galleryFor(slug: string) {
  const main = serviceImage(slug);
  const rest = media.serviceGallery.filter(p => p !== main);
  const start = Math.abs([...slug].reduce((a, c) => a + c.charCodeAt(0), 0)) % rest.length;
  return [main, rest[start], rest[(start + 1) % rest.length]].filter((m): m is MediaImage => Boolean(m));
}
