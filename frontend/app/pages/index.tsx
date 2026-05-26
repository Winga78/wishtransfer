import Head from 'next/head'
import { UploadFilesS3PresignedUrl } from '../components/UploadFilesS3PresignedUrl'
import { FilesContainer } from '../components/FileContainer' 
import { useState, useEffect } from 'react'
import { type FileProps } from '../utils/types'
 
export default function Home() {
  const [files, setFiles] = useState<FileProps[]>([])
 
  // Fetch files from the database
  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files')
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      const body = (await response.json()) as FileProps[]
      // set isDeleting to false for all files after fetching
      setFiles(body.map((file) => ({ ...file, isDeleting: false })))
    } catch (error) {
      console.error("Erreur lors de la récupération des fichiers :", error)
    }
  }
 
  // fetch files on the first render
  useEffect(() => {
    fetchFiles()
  }, [])
 
  return (
    <>
      <Head>
        <title>WishTransfer - File Uploads</title>
        <meta name='description' content='File Uploads with Next.js, Prisma, and PostgreSQL' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='flex min-h-screen items-center justify-center gap-5 font-mono'>
        <div className='container flex flex-col gap-5 px-3'>
          
          {/* Zone d'upload via l'URL pré-signée S3/MinIO */}
          <UploadFilesS3PresignedUrl onUploadSuccess={fetchFiles} />

          {/* Liste des fichiers avec téléchargement direct par URL pré-signée */}
          <FilesContainer
            files={files}
            fetchFiles={fetchFiles}
            setFiles={setFiles}
            downloadUsingPresignedUrl={true} // Forcé à true par défaut
          />
        </div>
      </main>
    </>
  )
}