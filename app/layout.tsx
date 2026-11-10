import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Cognitive Shield Lab — Multimodal Manipulation Analyzer',
  description: 'Rigorous forensic analysis engine for detecting and deconstructing psychological manipulation, subliminal framing, acoustic steering, and cognitive bias exploitation.',
  openGraph: {
    title: 'Cognitive Shield Lab — Multimodal Manipulation Analyzer',
    description: 'Rigorous forensic analysis engine for detecting and deconstructing psychological manipulation, subliminal framing, acoustic steering, and cognitive bias exploitation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cognitive Shield Lab — Multimodal Manipulation Analyzer',
    description: 'Rigorous forensic analysis engine for detecting and deconstructing psychological manipulation, subliminal framing, acoustic steering, and cognitive bias exploitation.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased selection:bg-blue-600 selection:text-white font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
