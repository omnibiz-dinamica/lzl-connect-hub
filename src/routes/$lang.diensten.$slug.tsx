import { createFileRoute,notFound } from '@tanstack/react-router';
import { DetailPage } from '@/components/lzl/content-page';
import { services,pageHead } from '@/lib/lzl/config';
export const Route=createFileRoute('/$lang/diensten/$slug')({beforeLoad:({params})=>{if(!services.some(s=>s.slug===params.slug))throw notFound()},head:({params})=>{const lang=params.lang==='fr'?'fr':'nl';const s=services.find(s=>s.slug===params.slug);return pageHead(lang,s?.[lang]||'LZL Services',s?(lang==='fr'?s.frDesc:s.nlDesc):'LZL Services',`/diensten/${params.slug}`)},component:Page});
function Page(){const {lang,slug}=Route.useParams();return <DetailPage lang={lang==='fr'?'fr':'nl'} kind="service" slug={slug}/>}
