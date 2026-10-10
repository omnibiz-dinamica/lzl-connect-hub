import { createFileRoute,redirect } from '@tanstack/react-router';
import { pageHead } from '@/lib/lzl/config';
export const Route=createFileRoute('/')({beforeLoad:()=>{throw redirect({to:'/$lang',params:{lang:'nl'}})},head:()=>pageHead('nl','LZL Services — schoonmaak in Bekkevort','Professionele schoonmaak voor bedrijven. Persoonlijke service en een offerte binnen 24 uur.'),component:()=>null});
