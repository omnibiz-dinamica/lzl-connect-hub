import { createFileRoute,notFound } from '@tanstack/react-router';
import { DetailPage } from '@/components/lzl/content-page';
import { sectors,pageHead } from '@/lib/lzl/config';
export const Route=createFileRoute('/$lang/sectoren/$slug')({beforeLoad:({params})=>{if(!sectors.some(s=>s.slug===params.slug))throw notFound()},head:({params})=>{const lang=params.lang==='fr'?'fr':'nl';const s=sectors.find(s=>s.slug===params.slug);return pageHead(lang,s?.[lang]||'LZL Services',lang==='fr'?'Un nettoyage adapté à votre secteur à Bekkevort.':'Schoonmaak afgestemd op uw sector in Bekkevort.',`/sectoren/${params.slug}`)},component:Page});
function Page(){const {lang,slug}=Route.useParams();return <DetailPage lang={lang==='fr'?'fr':'nl'} kind="sector" slug={slug}/>}
