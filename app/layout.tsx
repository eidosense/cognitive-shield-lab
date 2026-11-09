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
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-cyan-500 selection:text-slate-950 font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
