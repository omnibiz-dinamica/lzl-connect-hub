import { createFileRoute,notFound } from '@tanstack/react-router';
import { DetailPage } from '@/components/lzl/content-page';
import { business,pageHead } from '@/lib/lzl/config';
export const Route=createFileRoute('/$lang/werkgebied/$stad')({beforeLoad:({params})=>{if(!business.cities.some(c=>c.toLowerCase()===params.stad))throw notFound()},head:({params})=>{const lang=params.lang==='fr'?'fr':'nl';return pageHead(lang,lang==='fr'?'Nettoyage pour entreprises à Bekkevort':'Schoonmaak voor bedrijven in Bekkevort',lang==='fr'?'Votre partenaire local B2B à Bekkevort. Devis sous 24 heures.':'Uw lokale B2B-partner in Bekkevort. Offerte binnen 24 uur.',`/werkgebied/${params.stad}`)},component:Page});
function Page(){const {lang,stad}=Route.useParams();return <DetailPage lang={lang==='fr'?'fr':'nl'} kind="city" slug={stad}/>}
