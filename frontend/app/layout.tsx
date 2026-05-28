export const metadata = {
  title: 'WishTransfer - File Uploads',
  description: 'File Uploads with Next.js, TypeORM, and PostgreSQL',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}