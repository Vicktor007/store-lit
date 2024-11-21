import React from "react";
import Sort from "@/components/Sort";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import Card from "@/components/Card";
import { getFileTypesParams, convertFileSize } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/user.actions";
import PlusUploader from "@/components/PlusUploader";

const calculateTotalSize = (files: Models.Document[]) => {
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  return convertFileSize(totalSize);
};

const Page = async ({ searchParams, params }: SearchParamProps) => {
  const type = ((await params)?.type as string) || "";
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";

  const types = getFileTypesParams(type) as FileType[];

  const currentUser = await getCurrentUser();

  const files = await getFiles({ types, searchText, sort });

  const totalSize = calculateTotalSize(files.documents);

  return (
    <div className="page-container">
      
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>

        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">{totalSize}</span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden text-light-200 sm:block">Sort by:</p>

            <Sort />
          </div>
        </div>
      </section>

      {/* Render the files */}
      {files.total > 0 ? (
        <section className="file-list">
          {files.documents.map((file: Models.Document) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <>
        <p className="empty-list">No files uploaded</p>
        <PlusUploader ownerId={currentUser.$id} accountId={currentUser.accountId} />
        </>
      )}
      {files.total > 0 && <div className="floating-file-uploader"><PlusUploader ownerId={currentUser.$id} accountId={currentUser.accountId} /></div>}
    </div>
  );
};

export default Page;
