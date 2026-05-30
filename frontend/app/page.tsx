"use client"
import { UploadFilesS3PresignedUrl } from "./components/UploadFilesS3PresignedUrl"

export default function Home() {
  return (
    <>
        <title>WishTransfer - File Uploads</title>
        <meta name='description' content='File Uploads with Next.js, TypeORM, and PostgreSQL' />
        <link rel='icon' href='/favicon.ico' />
        <main className='flex min-h-screen items-center justify-center gap-5 font-mono'>
              
       <UploadFilesS3PresignedUrl />

      </main>
    </>
  )
}