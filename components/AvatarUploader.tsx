"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "@/components/Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";
import { updateUser } from "@/lib/actions/user.actions";

interface Props {
  ownerId: string;
  accountId: string;
  avatarId?: string;
  avatarFileId?: string;
  className?: string;
  onClose: () => void;
}

const AvatarUploader = ({ ownerId, accountId, avatarId, className, avatarFileId,  onClose }: Props) => {
  
  const path = usePathname();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: boolean }>(
    {},
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);

      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((prevFiles) =>
            prevFiles.filter((f) => f.name !== file.name),
          );

          return toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> is too large.
                Max file size is 50MB.
              </p>
            ),
            className: "error-toast top-middle-toast",
          });
        }

        return updateUser({ file, ownerId, accountId, avatarId, avatarFileId, path }).then(
          
          (uploadedFile) => {
            if (uploadedFile) {
              setUploadStatus((prevStatus) => ({
                ...prevStatus,
                [file.name]: true,
              }));

              // Delay the removal of the file by 5 seconds
              setTimeout(() => {
                setFiles((prevFiles) =>
                  prevFiles.filter((f) => f.name !== file.name),
                );
              }, 5000);
              onClose();
            }
          },
         
        );
      });

      await Promise.all(uploadPromises);
    },
    [ownerId, accountId, avatarId, avatarFileId, path, toast, onClose],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    fileName: string,
  ) => {
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    setUploadStatus((prevStatus) => {
      const newStatus = { ...prevStatus };
      delete newStatus[fileName];
      return newStatus;
    });
  };

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />
      <Button type="button" className={cn("uploader-button", className)}>
      <Image
          src="/assets/icons/upload.svg"
          alt="upload"
          width={24}
          height={24}
        />
        {" "}
        <p>Choose custom image</p>
      </Button>
      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">Uploading</h4>

          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);

            return (
              <li
                key={`${file.name}-${index}`}
                className="uploader-preview-item relative"
              >
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />

                  <div className="preview-item-name">
                    {file.name}

                    <Image
                      src={!uploadStatus[file.name] ? "/assets/icons/file-loader.gif" : "/assets/icons/verified-tag-2.gif"}
                      width={80}
                      height={12}
                      alt="Loader"
                      unoptimized
                      style={uploadStatus[file.name] ? { width: "20px", height: "20px" }:{}}
                    />

            
                  </div>
                </div>

                <Image
                  src="/assets/icons/remove.svg"
                  width={24}
                  height={24}
                  alt="Remove"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                  className="absolute right-4"
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AvatarUploader;
