'use client';
import {ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import AppShell from './AppShell';

const publicRoutes=['/','/connexion','/inscription'];

export default function SiteShell({children}:{children:ReactNode}){
  const pathname=usePathname();
  const isPublic=publicRoutes.some(route=>route==='/'?pathname==='/':pathname===route||pathname.startsWith(route+'/'));
  return isPublic?<>{children}</>:<AppShell>{children}</AppShell>;
}
