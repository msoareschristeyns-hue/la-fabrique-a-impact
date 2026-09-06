import './globals.css';
import './design-system.css';
import './layout-fix.css';
import './extra.css';
import './document-themes.css';
import type { Metadata } from 'next';
import SiteShell from '../components/SiteShell';
import DocumentPreviewNavigator from '../components/DocumentPreviewNavigator';
import DocumentThemeSelector from '../components/DocumentThemeSelector';
import DocumentMetadataPanel from '../components/DocumentMetadataPanel';

export const metadata: Metadata = {
  title: 'La Fabrique à Impact | La RSE qui fait avancer votre PME',
  description: 'Identifiez vos priorités RSE, passez à l’action et produisez les preuves qui comptent.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body><SiteShell>{children}</SiteShell><DocumentPreviewNavigator/><DocumentThemeSelector/><DocumentMetadataPanel/></body></html>;
}
