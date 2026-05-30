import { LoadSpinner } from './LoadSpinner'
import { type UploadFilesFormUIProps } from '../utils/types'

export function UploadFilesFormUI({
  isLoading,
  fileInputRef,
  uploadToServer,
  maxFileSize,
}: UploadFilesFormUIProps) {
  return (
    <form
      className="flex flex-col items-center justify-center gap-3"
      onSubmit={uploadToServer}
    >
      <h1 className="text-2xl font-bold text-center">
        WishTransfer - File Upload Example
      </h1>
      <p className="text-lg text-gray-600">{`Total file(s) size should not exceed ${maxFileSize} MB`}</p>
      
      {isLoading ? (
        <div className="flex h-16 items-center justify-center">
          <LoadSpinner />
        </div>
      ) : (
        <div className="flex h-16 gap-5 items-center">
          <input
            id="file"
            type="file"
            multiple
            className="rounded-md border bg-gray-100 p-2"
            required
            ref={fileInputRef}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-blue-500 px-5 py-2 text-white
                hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400 transitions-colors"
          >
            Upload
          </button>
        </div>
      )}
    </form>
  );
}