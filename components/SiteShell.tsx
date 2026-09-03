'use client';
import {ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import AppShell from './AppShell';
const privateRoutes=['/dashboard','/diagnostic','/priorities','/actions','/proofs','/library','/workspace','/progress','/report','/copilot','/settings'];
export default function SiteShell({children}:{children:ReactNode}){const pathname=usePathname();const isPrivate=privateRoutes.some(route=>pathname===route||pathname.startsWith(route+'/'));return isPrivate?<AppShell>{children}</AppShell>:<>{children}</>}
