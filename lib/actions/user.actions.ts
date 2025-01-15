"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { InputFile } from "node-appwrite/file";



type AppwriteErrorResponse = {
  [key: string]: any; 
};

type AppwriteError = {
  message: string;
  code: number;
  type: string;
  response: AppwriteErrorResponse;
};

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])],
  );

  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
  if (error instanceof Error) {
    console.error("Error:", error.message);
  } else if (typeof error === "object" && error !== null) {
    const appwriteError = error as AppwriteError;
    console.error("Appwrite Error:", appwriteError.message);
  } else {
    console.error("Unknown Error:", error);
  }
  throw new Error(message);
};


export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP, please try again!");
  }
};


export const updateAvatar = async ({
  ownerId,
  avatarPlaceholder,
  avatarId,
  fileId
}: {
  ownerId: string;
  avatarPlaceholder: string;
  avatarId?: string;
  fileId?: string;
}) => {
  const { storage, databases } = await createAdminClient();

  try {
    if (avatarId && fileId) {
      try {
        const deletedFile = await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.filesCollectionId,
          fileId,
        );
          if (deletedFile) await storage.deleteFile(appwriteConfig.bucketId, avatarId);
      } catch (deleteError) {
        const error = deleteError as { code: number }; // Type assertion
        if (error.code !== 404) {
          throw deleteError;
        }
        // If the file is not found (404), continue without throwing an error
      }
    }

    const updatedAvatar = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ownerId,
      {
        avatar: avatarPlaceholder,
      }
    );

    return parseStringify(updatedAvatar);
  } catch (error) {
    handleError(error, "failed to update avatar");
  }
};




export const updateUser = async ({
  file,
  ownerId,
  accountId,
  avatarId,
  avatarFileId,
  path
}: UpdateUserProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    if (avatarId && avatarFileId) {
      try {
        const deletedFile = await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.filesCollectionId,
          avatarFileId,
        );
        if (deletedFile) await storage.deleteFile(appwriteConfig.bucketId, avatarId);
      } catch (deleteError) {
        const error = deleteError as { code: number }; // Type assertion
        if (error.code !== 404) {
          throw deleteError;
        }
        // If the file is not found (404), continue without throwing an error
      }
    }
    // Convert file to InputFile
    const inputFile = InputFile.fromBuffer(file, file.name);

    // Upload file to storage
    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile
    );

    // Construct file document
    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
      avatar: true
    };

    // Create file document in database
    let newFile;
    try {
      newFile = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument
      );
    } catch (error) {
      // Delete file from storage if document creation fails
      await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
      handleError(error, "Failed to create file document");
    }

    // Revalidate path
    revalidatePath(path);

    const parsedFile = parseStringify(newFile);
    // Update user's avatar in database
     await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ownerId,
      {
        avatar: parsedFile.url,
        avatarId: parsedFile.bucketFileId,
        avatarFileId: parsedFile.$id
      }
    );

      

    // Return the new file document
    return parsedFile;

  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};


export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Failed to send an OTP");

  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: avatarPlaceholderUrl,
        accountId,
      },
    );
  }

  return parseStringify({ accountId });
};



export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);
    
    
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP, please request for another otp and try again");
  }
};

export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();

    const result = await account.get();
    
    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", result.$id)],
    );

    if (user.total <= 0) return null;

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
  }
};

export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in");
  }
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    // User exists, send OTP
    if (existingUser) {
      await sendEmailOTP({ email });
      return parseStringify({ accountId: existingUser.accountId });
    }

    return parseStringify({ accountId: null, error: "User not found" });
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};

// New function to delete user account and files 
export const deleteUserAccount = async (userId: string) => { 
  const { databases, storage } = await createAdminClient();
   try { // Fetch user files 
    const files = await databases.listDocuments(
       appwriteConfig.databaseId, 
       appwriteConfig.filesCollectionId,
        [Query.equal("owner", userId)] ); 
        // Delete user files from storage and database
         for (const file of files.documents) { 
          await storage.deleteFile(appwriteConfig.bucketId, file.bucketFileId);
           await databases.deleteDocument( appwriteConfig.databaseId,
             appwriteConfig.filesCollectionId, file.$id ); }
              // Delete user document from database
               await databases.deleteDocument( appwriteConfig.databaseId,
                 appwriteConfig.usersCollectionId, userId );

                   console.log(`User ${userId} and their files have been deleted.`); }
                    catch
                    (error) { handleError(error, "Failed to delete user account and files"); }
                   };


