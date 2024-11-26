"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import React, { useState } from "react";
import Image from "next/image";
import { updateAvatar } from "@/lib/actions/user.actions";
import { useToast } from "@/hooks/use-toast";
import { avatarPlaceholderUrl, femaleAvatarUrl } from "@/constants";
import AvatarUploader from "./AvatarUploader";

const AvatarModal = ({
  ownerId,
  accountId,
  isOpen,
  onClose,
 
}: {
  ownerId: string;
  accountId: string;
  isOpen: boolean;
  onClose: () => void;
  
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPlaceholder, setAvatarPlaceholder] = useState<string>("");
  const { toast } = useToast();

  const placeholder = avatarPlaceholderUrl;

  const femaleAvatar = femaleAvatarUrl;



  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const avatar = await updateAvatar({ ownerId, avatarPlaceholder });
        
      if (avatar) {
        toast({
          description: (
            <p className="body-2 text-white">
              Updated avatar successfully!
            </p>
          ),
          className: "error-toast",
        });
      }
      onClose();
    } catch (error) {
      console.log("Failed to update avatar", error);
      toast({
        description: (
          <p className="body-2 text-white">
            {`"Failed to update avatar", ${error}`}
          </p>
        ),
        className: "error-toast",
      });
    }

    setIsLoading(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader className="relative flex justify-center">
          <AlertDialogTitle className="h2 text-center">
            Choose your avatar
            <Image
              src="/assets/icons/close-dark.svg"
              alt="close"
              width={20}
              height={20}
              onClick={onClose}
              className="otp-close-button"
            />
          </AlertDialogTitle>
          <AlertDialogDescription className="subtitle-2 text-center text-light-100">
            Select your preferred avatar
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="header-avatar">
          <Image
            src={femaleAvatar}
            alt="avatar-female"
            width={44}
            height={44}
            onClick={() => setAvatarPlaceholder(femaleAvatar)}
            className={`header-user-avatar ${avatarPlaceholder === femaleAvatar ? 'selected-avatar' : ''}`}
          />
          <Image
            src={placeholder}
            alt="avatar-male"
            width={44}
            height={44}
            onClick={() => setAvatarPlaceholder(placeholder)}
            className={`header-user-avatar ${avatarPlaceholder === placeholder ? 'selected-avatar' : ''}`}
          />
        </div>
        
        <AlertDialogFooter>
          <div className="flex w-full flex-col items-center justify-center gap-4">
          
            <AlertDialogAction
              onClick={handleSubmit}
              className="shad-submit-btn h-12"
              type="button"
              disabled={avatarPlaceholder === ""}
            >
              Use selected avatar
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>
                    <span className="align-middle">or</span>
            <AvatarUploader onClose={onClose} ownerId={ownerId} accountId={accountId} />
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AvatarModal;
