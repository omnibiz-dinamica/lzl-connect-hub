import { createFileRoute, notFound } from '@tanstack/react-router';
import { ContentPage,pages } from '@/components/lzl/content-page';
import { pageHead } from '@/lib/lzl/config';
export const Route=createFileRoute('/$lang/$page')({beforeLoad:({params})=>{if(!pages[params.page])throw notFound()},head:({params})=>{const lang=params.lang==='fr'?'fr':'nl';const p=pages[params.page];return pageHead(lang,p?.[lang]||'LZL Services',p?(lang==='fr'?p.frDesc:p.nlDesc):'LZL Services',`/${params.page}`)},component:Page});
function Page(){const {lang,page}=Route.useParams();return <ContentPage lang={lang==='fr'?'fr':'nl'} page={page}/>}
