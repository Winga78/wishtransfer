import { useState, useRef } from 'react'
import { validateFiles, MAX_FILE_SIZE_S3_ENDPOINT, handleUpload, getPresignedUrls } from '../utils/fileUploadHelpers'
import { UploadFilesFormUI } from './UploadFilesFormUI'
import { type ShortFileProp } from '../utils/types'
 
type UploadFilesFormProps = {
  onUploadSuccess: () => void
}
 
export function UploadFilesS3PresignedUrl({
  onUploadSuccess,
}: UploadFilesFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const uploadToServer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 1. Check if files are selected
    if (!fileInputRef.current?.files?.length) {
      alert("Please, select file you want to upload");
      return;
    }

    // OPTIMISATION : Array.from() est plus standard et performant que Object.values() pour un FileList
    const files = Array.from(fileInputRef.current.files);

    // 2. Validate files
    const filesInfo: ShortFileProp[] = files.map((file) => ({
      originalFileName: file.name,
      fileSize: file.size,
    }));

    const filesValidationResult = validateFiles(
      filesInfo,
      MAX_FILE_SIZE_S3_ENDPOINT,
    );
    if (filesValidationResult) {
      alert(filesValidationResult);
      return;
    }

    // 3. Début de l'asynchronisme : On active le loader
    setIsLoading(true);

    try {
      // 4. Get presigned URLs
      const presignedUrls = await getPresignedUrls(filesInfo);
      
      // SÉCURITÉ : Si l'API échoue ou renvoie un tableau vide
      if (!presignedUrls || presignedUrls.length === 0) {
        alert("Something went wrong, please try again later");
        setIsLoading(false); // <--- CORRECTION : On coupe le loader ici !
        return;
      }

      // 5. Upload files to s3 endpoint directly and save file info to db
      await handleUpload(files, presignedUrls, onUploadSuccess);

      // 6. Reset du champ d'upload après un succès (Bonne pratique UX)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error("Erreur lors du processus d'upload :", error);
      alert("An unexpected error occurred during upload.");
    } finally {
      // GARANTIE : Quoi qu'il arrive (succès ou crash de handleUpload), le loader se coupe
      setIsLoading(false);
    }
  };

  return (
    <UploadFilesFormUI
      isLoading={isLoading}
      fileInputRef={fileInputRef}
      uploadToServer={uploadToServer}
      maxFileSize={MAX_FILE_SIZE_S3_ENDPOINT}
    />
  );
}