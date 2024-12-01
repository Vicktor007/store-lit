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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { deleteUserAccount } from "@/lib/actions/user.actions";



const DeleteModal = ({
  userId,
  isOpen,
  onClose,
 
}: {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const deleteUser = async (e: React.MouseEvent<HTMLButtonElement>,userId: string) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        
      await deleteUserAccount(userId);
      router.push("/sign-up");
      toast({
        description: (
          <p className="body-2 text-white">
            Your account has been deleted!
          </p>
        ),
        className: "error-toast",
      });
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        description: (
          <p className="body-2 text-white">
            Failed to delete account!
          </p>
        ),
        className: "error-toast",
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader className="relative flex justify-center">
          <AlertDialogTitle className="h2 text-center">
            Delete your account
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
            Are you sure you want to delete your account?
          </AlertDialogDescription>
        </AlertDialogHeader>

        
        
        <AlertDialogFooter>
          <div className="flex w-full flex-col items-center justify-center gap-4">
          
            <AlertDialogAction
              onClick={(e)=> deleteUser(e,userId)}
              className="shad-submit-btn h-12"
              type="button"
              
            >
              
              {!isLoading ? ("Yes") : (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>
                    
            <AlertDialogAction onClick={onClose} type="button" className="modal-cancel-button">
              Cancel
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteModal;
