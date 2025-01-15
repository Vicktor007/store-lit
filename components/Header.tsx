

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";
import { signOutUser } from "@/lib/actions/user.actions";
import { useToast } from "@/hooks/use-toast";

const Header = ({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) => {

  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
      localStorage.removeItem("currentUser");
      toast({
        description: (
          <p className="body-2 text-white">
            You have been signed out
          </p>
        ),
        className: "error-toast",
      });
    } catch (error) {
      console.log("Failed to sign out", error);
      toast({
        description: (
          <p className="body-2 text-white">
            Failed to sign out
          </p>
        ),
        className: "error-toast",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader ownerId={userId} accountId={accountId} />
        <Button
          type="button"
          className="mobile-sign-out-button"
          onClick={handleSignOut}
          disabled={loading}
        >
          {!loading ? (
            <>
            <Image
              src="/assets/icons/logout.svg"
              alt="logo"
              width={24}
              height={24}
              className="w-6"
            />
            <p>Logout</p>
            </>
          ) : (
            <Image
              src="/assets/icons/loader.svg"
              alt="logo"
              width={24}
              height={24}
              className="w-6"
            />
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
