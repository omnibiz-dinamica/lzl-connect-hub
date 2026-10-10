import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { estimate } from './config';
const text = z.string().trim().min(1).max(200);
const common = { name: text, language: z.enum(['nl','fr']), consent: z.literal(true), website: z.string().max(0).default('') };
const leadSchema = z.object({...common,company:text,email:z.string().trim().email().max(254),phone:z.string().trim().min(7).max(40),postcode:z.string().regex(/^\d{4}$/),space_type:text,area:z.number().int().min(20).max(5000),frequency:z.enum(['once','weekly','multiple','daily']),source:z.string().max(300),utm:z.record(z.string().max(300)).refine(v=>Object.keys(v).length<=8)});
export const submitLead = createServerFn({method:'POST'}).inputValidator((data:unknown)=>leadSchema.parse(data)).handler(async({data})=>{
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const ip=getRequestHeader('cf-connecting-ip') || getRequestHeader('x-forwarded-for')?.split(',')[0] || 'unknown';
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`lead:${ip}:${data.email}`));
 const key=Array.from(new Uint8Array(hash)).map(n=>n.toString(16).padStart(2,'0')).join('');
 const {data:allowed,error:limitError}=await supabaseAdmin.rpc('allow_submission',{p_key:key});
 if(limitError || !allowed) throw new Error('Te veel verzoeken / Trop de demandes.');
 const range=estimate(data.area,data.frequency); const {website,...fields}=data;
 const {data:row,error}=await supabaseAdmin.from('leads').insert({...fields,indicative_min:range.min,indicative_max:range.max}).select('id').single();
 if(error || !row) throw new Error('Opslaan mislukt / Enregistrement impossible.');
 const webhook=process.env['N8N_WEBHOOK_URL'];
 if(webhook){ try { const url=new URL(webhook); if(url.protocol!=='https:') throw new Error('HTTPS required'); const result=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':row.id},body:JSON.stringify({id:row.id,...fields,...range}),signal:AbortSignal.timeout(7000)}); await supabaseAdmin.from('leads').update({webhook_status:result.ok?'delivered':'failed'}).eq('id',row.id); } catch { await supabaseAdmin.from('leads').update({webhook_status:'failed'}).eq('id',row.id); } }
 return {id:row.id,...range};
});
const requestSchema=z.discriminatedUnion('kind',[
 z.object({...common,kind:z.literal('contact'),email:z.string().email().max(254),phone:z.string().max(40),message:z.string().trim().min(10).max(3000)}),
 z.object({...common,kind:z.literal('job'),phone:z.string().min(7).max(40),region:text,availability:text,cv:z.string().max(7000000).optional(),cvName:z.string().max(200).optional()})
]);
export const submitRequest=createServerFn({method:'POST'}).inputValidator((data:unknown)=>requestSchema.parse(data)).handler(async({data})=>{
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const ip=getRequestHeader('cf-connecting-ip') || 'unknown'; const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${data.kind}:${ip}:${data.phone}`));
 const key=Array.from(new Uint8Array(hash)).map(n=>n.toString(16).padStart(2,'0')).join('');
 const {data:allowed,error:limitError}=await supabaseAdmin.rpc('allow_submission',{p_key:key}); if(limitError || !allowed) throw new Error('Te veel verzoeken / Trop de demandes.');
 if(data.kind==='contact'){const {error}=await supabaseAdmin.from('contact_submissions').insert({name:data.name,email:data.email,phone:data.phone,message:data.message,language:data.language,consent:true}); if(error) throw new Error('Opslaan mislukt'); }
 else {let cv_path:string|null=null; if(data.cv){const bytes=Uint8Array.from(atob(data.cv),c=>c.charCodeAt(0)); if(bytes.length>5*1024*1024 || new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-') throw new Error('Alleen PDF / PDF uniquement'); cv_path=`${crypto.randomUUID()}.pdf`; const {error}=await supabaseAdmin.storage.from('job-cvs').upload(cv_path,bytes,{contentType:'application/pdf'}); if(error) throw new Error('CV upload mislukt'); } const {error}=await supabaseAdmin.from('job_applications').insert({name:data.name,phone:data.phone,region:data.region,availability:data.availability,cv_path,language:data.language,consent:true}); if(error){if(cv_path) await supabaseAdmin.storage.from('job-cvs').remove([cv_path]); throw new Error('Opslaan mislukt');} }
 return {ok:true};
});
