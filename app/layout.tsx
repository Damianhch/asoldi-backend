import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Asoldi Management Dashboard',
  description: 'Internal management system for Asoldi team',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="gradient-mesh min-h-screen">
        {children}
      </body>
    </html>
  )
}


