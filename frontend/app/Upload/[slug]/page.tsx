'use client'
import { use, useEffect, useState } from 'react'
import { type FileProps } from '../../utils/types'
import { FilesContainer } from '../../components/FileContainer'

export default function UploadPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [files, setFiles] = useState<FileProps[]>([])
  const fullUrl = window.location.href

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/files/${slug}`)
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      const body = (await response.json()) as FileProps[]
      setFiles(body.map((file) => ({ ...file, isDeleting: false })))
    } catch (error) {
      console.error("Erreur lors de la récupération des fichiers :", error)
    }
  }

    
  useEffect(() => {
    fetchFiles()
  }, [])


    return (
    <>
        <title>WishTransfer - File Uploads</title>
        <meta name='description' content='File Uploads with Next.js, TypeORM, and PostgreSQL' />
        <link rel='icon' href='/favicon.ico' />
        <main className='flex min-h-screen items-center justify-center gap-5 font-mono'>
        <div className='container flex flex-col gap-5 px-3'>
          {/* Liste des fichiers avec téléchargement direct par URL pré-signée */}
          <FilesContainer
            files={files}
            pathfile={fullUrl}
            downloadUsingPresignedUrl={true}
          />
        </div>
      </main>
    </>
  )
}