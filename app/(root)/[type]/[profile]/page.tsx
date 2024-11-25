
"use client"; 

import AvatarModal from '@/components/AvatarModal';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/actions/user.actions';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

type User = { $id: string; avatar: string; fullName: string; email: string; accountId: string; };

const Page = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  const fetchUser = async () => { const user = await getCurrentUser(); setCurrentUser(user); }; 


  useEffect(() => { fetchUser(); }, []); 
  
  const handleClose = () => { setOpen(false); fetchUser();  };

  if (!currentUser) {
    return <div className='empty-list'>Loading...</div>; 
  }

  return (
    <div>
      <div className="profile-user-info">
        <Image
          src={currentUser.avatar}
          alt="Avatar"
          width={44}
          height={44}
          className="profile-user-avatar"
        />
        <div className="mx-2">
          <p className="subtitle-2 capitalize">{currentUser.fullName}</p>
          <p className="caption">{currentUser.email}</p>
        </div>
        

        <Button type="button" className={cn("uploader-button")} onClick={() => setOpen(true)}>
          <p>Change avatar</p>
        </Button>
      </div>
      {open && <AvatarModal isOpen={open} accountId={currentUser.accountId} onClose={handleClose} ownerId={currentUser.$id} />}
    </div>
  );
};

export default Page;
