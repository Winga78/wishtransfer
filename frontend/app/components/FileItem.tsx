import { useState } from "react";
import { type FileProps, FileItemProps } from "../utils/types";
import { LoadSpinner } from "./LoadSpinner";
import { deleteFileById } from "../utils/fileUploadHelpers";
import { useRouter } from "next/navigation";

async function getPresignedUrl(file: FileProps) {
  const response = await fetch(`/api/files/download/presignedUrl/${file.id}`);
  return (await response.json()) as string;
}

export function FileItem({
  file,
  pathfile,
  downloadUsingPresignedUrl,
}: FileItemProps) {
  
  // 1. État pour suivre le téléchargement
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  const downloadFile = async (file: FileProps) => {
    if (!downloadUsingPresignedUrl) return;

    try {
      setIsDownloading(true); // Le téléchargement commence

      // Étape A : Récupérer l'URL présignée
      const presignedUrl = await getPresignedUrl(file);

      // Étape B : Télécharger le fichier REELLEMENT via le code (fetch)
      const fileResponse = await fetch(presignedUrl);
      
      if (!fileResponse.ok) {
        throw new Error("Erreur lors du téléchargement du fichier depuis le stockage");
      }

      // Convertir la réponse en Blob (données binaires brutes)
      const blob = await fileResponse.blob();

      // Étape C : Créer un lien invisible pour forcer le navigateur à télécharger le Blob
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.originalFileName; // Donne le vrai nom au fichier
      
      document.body.appendChild(link);
      link.click(); // Déclenche le téléchargement du fichier physique

      // Nettoyage de la mémoire
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      // C'EST GAGNÉ ! À ce stade, le fichier est entièrement sur le PC de l'utilisateur
      console.log("Le fichier a bien été téléchargé avec succès !");

      await deleteFileById(file.id.toString());

      router.push("/");

    } catch (error) {
      console.error("Échec du téléchargement :", error);
      alert("Impossible de télécharger le fichier.");
    } finally {
      setIsDownloading(false); // On arrête le spinner, quoi qu'il arrive
    }
  };

  return (
    <li className="relative flex items-center justify-between gap-2 border-b py-2 text-sm">
      <div>
        <p className="font-medium">Share link</p>
        <p className="text-xs text-gray-500">{pathfile}</p>
      </div>
      
      <div className="flex items-center gap-2">
        {/* 2. Affichage conditionnel du bouton ou du spinner */}
        {isDownloading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <LoadSpinner /> Téléchargement...
          </div>
        ) : (
          <button
            className="truncate text-blue-500 hover:text-blue-600 hover:underline disabled:opacity-50"
            onClick={() => downloadFile(file)}
            disabled={isDownloading}
          >
            {file.originalFileName}
          </button>
        )}
      </div>
    </li>
  );
}