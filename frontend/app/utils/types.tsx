export type ShortFileProp = {
  originalFileName: string;
  fileSize: number;
};

export type PresignedUrlProp = ShortFileProp & {
  url: string;
  fileNameInBucket: string;
};

export type FileProps = ShortFileProp & {
  id: string;
  isDeleting?: boolean;
};

export type FilesListProps = {
  files: FileProps[];
  pathfile: string;
  downloadUsingPresignedUrl: boolean;
};

export type FileItemProps = {
  file: FileProps;
  pathfile: string;
  downloadUsingPresignedUrl: boolean;
};

export type LoadSpinnerProps = {
  size?: "small" | "medium" | "large";
};

export type UploadFilesFormUIProps = {
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploadToServer: (event: React.FormEvent<HTMLFormElement>) => void;
  maxFileSize: number;
};

export type FileInDBProp = {
  fileNameInBucket: string;
  originalFileName: string;
  fileSize: number;
};