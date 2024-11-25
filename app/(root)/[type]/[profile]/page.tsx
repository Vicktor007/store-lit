import AvatarUploader from '@/components/AvatarUploader';
// import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/actions/user.actions';
// import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react'



const page = async () => {

    const currentUser = await getCurrentUser();

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
        <AvatarUploader ownerId={currentUser.$id} accountId={currentUser.accountId}/>
      </div>

      
    </div>
  )
}

export default page