import { createFileRoute, Outlet, notFound } from '@tanstack/react-router';
export const Route=createFileRoute('/$lang')({beforeLoad:({params})=>{if(params.lang!=='nl'&&params.lang!=='fr')throw notFound()},component:()=> <Outlet/>});
