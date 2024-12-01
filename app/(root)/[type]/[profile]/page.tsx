
"use client"; 

import AvatarModal from '@/components/AvatarModal';
import DeleteModal from '@/components/DeleteModal';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/actions/user.actions';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

type User = { $id: string; avatar: string; fullName: string; email: string; accountId: string; };

const Page = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
 
  const fetchUser = async () => { const user = await getCurrentUser(); setCurrentUser(user); }; 

  
 
  


  useEffect(() => { fetchUser(); }, []); 
  
  const handleClose = () => { setOpen(false); fetchUser();  };

  const closeDeleteModal = () => { setDeleteModal(false); };

  if (!currentUser) {
    return <div className='empty-list'>Loading...</div>; 
  }

  return (
    <div>
      <div className="profile-user-info">
        <Image
          src={currentUser.avatar}
          alt="Avatar"
          width={100}
          height={100}
          className="profile-user-avatar"
        />
        
        <div className="mx-2">
          <p className="subtitle-2 capitalize">{currentUser.fullName}</p>
          <p className="caption">{currentUser.email}</p>
        </div>
        

        <Button type="button" className={cn("uploader-button")} onClick={() => setOpen(true)}>
          <p>Change avatar</p>
        </Button>
        <Button type="button" className={cn("uploader-button")} onClick={() => setDeleteModal(true)} disabled={deleteModal}>
          <p>Delete account</p>
        </Button>
      </div>
      {deleteModal && <DeleteModal onClose={closeDeleteModal} userId={currentUser.$id} isOpen={deleteModal} />}
      {open && <AvatarModal isOpen={open} accountId={currentUser.accountId} onClose={handleClose} ownerId={currentUser.$id} />}
    </div>
  );
};

export default Page;
