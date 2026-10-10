import { createFileRoute } from '@tanstack/react-router';
import { Home } from '@/components/lzl/home';
import { pageHead } from '@/lib/lzl/config';
export const Route=createFileRoute('/$lang/')({head:({params})=>pageHead(params.lang==='fr'?'fr':'nl',params.lang==='fr'?'Nettoyage professionnel à Bekkevort':'Professionele schoonmaak in Bekkevort',params.lang==='fr'?'LZL Services : nettoyage B2B, interlocuteur fixe et devis sous 24 heures.':'LZL Services: professionele B2B-schoonmaak, vast aanspreekpunt en offerte binnen 24 uur.'),component:Page});
function Page(){const {lang}=Route.useParams();return <Home lang={lang==='fr'?'fr':'nl'}/>}
