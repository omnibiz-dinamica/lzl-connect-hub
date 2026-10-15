// Static build only (shared hosting without a server). Replaces submissions.functions.ts:
// each request opens WhatsApp with a prefilled message to LZL Services and, when
// VITE_N8N_WEBHOOK_URL is set at build time, is also posted to that n8n webhook.
import { business, estimate, services, type Language } from '@/lib/lzl/config';

type Frequency = 'once' | 'weekly' | 'multiple' | 'daily';
type Base = { name: string; language: Language; consent: boolean; website: string };
type LeadInput = Base & {
  company: string; email: string; phone: string; postcode: string; source: string;
  utm: Record<string, string>; space_type: string; area: number; frequency: Frequency;
};
type RequestInput =
  | (Base & { kind: 'contact'; email: string; phone: string; message: string })
  | (Base & { kind: 'job'; phone: string; region: string; availability: string; cv?: string; cvName?: string });

const webhook = import.meta.env['VITE_N8N_WEBHOOK_URL'] as string | undefined;
const frequencyLabel: Record<Language, Record<Frequency, string>> = {
  nl: { once: 'Eenmalig', weekly: 'Wekelijks', multiple: 'Meerdere keren per week', daily: 'Dagelijks' },
  fr: { once: 'Une seule fois', weekly: 'Chaque semaine', multiple: 'Plusieurs fois par semaine', daily: 'Chaque jour' },
};

function check(consent: boolean, ...values: string[]) {
  if (!consent || values.some((v) => !v || !v.trim())) throw new Error('invalid');
}

// Called synchronously from the form's submit handler, so the browser treats it as a user action.
function openWhatsApp(lines: (string | false | undefined)[]) {
  const text = lines.filter((line): line is string => typeof line === 'string').join('\n');
  const url = `https://wa.me/${business.phoneLink.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  const win = window.open(url, '_blank');
  if (win) win.opener = null;
  else window.location.href = url;
}

function notify(payload: Record<string, unknown>) {
  if (!webhook) return;
  try {
    const url = new URL(webhook);
    if (url.protocol !== 'https:') return;
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, sent_at: new Date().toISOString(), site: window.location.origin }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Invalid webhook URL: the WhatsApp message still carries the request.
  }
}

export async function submitLead({ data }: { data: LeadInput }) {
  const range = estimate(data.area, data.frequency);
  if (data.website) return { id: 'static', ...range }; // honeypot filled in: ignore bots
  check(data.consent, data.name, data.company, data.email, data.phone, data.postcode);
  const fr = data.language === 'fr';
  const space = services.find((s) => s.slug === data.space_type)?.[data.language] ?? data.space_type;
  openWhatsApp(fr ? [
    'Bonjour LZL Services, je souhaite recevoir un devis.',
    '',
    `Nom : ${data.name}`, `Entreprise : ${data.company}`, `E-mail : ${data.email}`,
    `Téléphone : ${data.phone}`, `Code postal : ${data.postcode}`,
    `Locaux : ${space}`, `Surface : ${data.area} m²`, `Fréquence : ${frequencyLabel.fr[data.frequency]}`,
    `Estimation indicative : € ${range.min} – € ${range.max}`,
  ] : [
    'Hallo LZL Services, ik vraag graag een offerte aan.',
    '',
    `Naam: ${data.name}`, `Bedrijf: ${data.company}`, `E-mail: ${data.email}`,
    `Telefoon: ${data.phone}`, `Postcode: ${data.postcode}`,
    `Ruimte: ${space}`, `Oppervlakte: ${data.area} m²`, `Frequentie: ${frequencyLabel.nl[data.frequency]}`,
    `Voorbeeldindicatie: € ${range.min} – € ${range.max}`,
  ]);
  const { website: _honeypot, ...fields } = data;
  notify({ type: 'lead', ...fields, indicative_min: range.min, indicative_max: range.max });
  return { id: 'static', ...range };
}

export async function submitRequest({ data }: { data: RequestInput }) {
  if (data.website) return { ok: true }; // honeypot
  const fr = data.language === 'fr';
  if (data.kind === 'contact') {
    check(data.consent, data.name, data.email, data.message);
    openWhatsApp(fr ? [
      'Bonjour LZL Services,', '',
      `Nom : ${data.name}`, `E-mail : ${data.email}`, data.phone ? `Téléphone : ${data.phone}` : undefined, '',
      data.message,
    ] : [
      'Hallo LZL Services,', '',
      `Naam: ${data.name}`, `E-mail: ${data.email}`, data.phone ? `Telefoon: ${data.phone}` : undefined, '',
      data.message,
    ]);
    notify({ type: 'contact', name: data.name, email: data.email, phone: data.phone, message: data.message, language: data.language });
  } else {
    check(data.consent, data.name, data.phone, data.region, data.availability);
    openWhatsApp(fr ? [
      'Bonjour LZL Services, je souhaite travailler chez vous.', '',
      `Nom : ${data.name}`, `Téléphone : ${data.phone}`, `Région : ${data.region}`,
      `Disponibilités : ${data.availability}`, '',
      'Je vous envoie mon CV juste après ce message.',
    ] : [
      'Hallo LZL Services, ik wil graag bij jullie werken.', '',
      `Naam: ${data.name}`, `Telefoon: ${data.phone}`, `Regio: ${data.region}`,
      `Beschikbaarheid: ${data.availability}`, '',
      'Mijn CV stuur ik direct na dit bericht.',
    ]);
    notify({ type: 'job', name: data.name, phone: data.phone, region: data.region, availability: data.availability, language: data.language });
  }
  return { ok: true };
}
