import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Visual Concept Mapper — AI-Powered STEM Knowledge Graph',
  description:
    'Turn dense STEM textbook chapters into interactive 3D knowledge maps that reveal concepts, mathematical relationships, and source evidence.',
  keywords: [
    'Knowledge Graph',
    'STEM',
    'AI Education',
    'Linear Algebra',
    'Machine Learning',
    '3D Visualization',
    'Textbook Concept Map',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#050816] text-[#F8FAFC] antialiased selection:bg-[#6C63FF]/30 selection:text-[#22D3EE]">
        {children}
      </body>
    </html>
  );
}
