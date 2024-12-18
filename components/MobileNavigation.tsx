// "use client";

// import {
//   Sheet,
//   SheetContent,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import Image from "next/image";
// import React, { useState } from "react";
// import { usePathname } from "next/navigation";
// import { Separator } from "@radix-ui/react-separator";
// import { navItems } from "@/constants";
// import Link from "next/link";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import FileUploader from "@/components/FileUploader";
// import { signOutUser } from "@/lib/actions/user.actions";

// interface Props {
//   $id: string;
//   accountId: string;
//   fullName: string;
//   avatar: string;
//   email: string;
// }

// const MobileNavigation = ({
//   $id: usersId,
//   accountId,
//   fullName,
//   avatar,
//   email,
// }: Props) => {
//   const [open, setOpen] = useState(false);
//   const pathname = usePathname();

//   return (
//     <header className="mobile-header">
//       <Image
//         src="/assets/icons/logo-full-brand.svg"
//         alt="logo"
//         width={120}
//         height={52}
//         className="h-auto"
//       />

//       <Sheet open={open} onOpenChange={setOpen}>
//         <SheetTrigger>
//           <Image
//             src="/assets/icons/menu.svg"
//             alt="Search"
//             width={30}
//             height={30}
//           />
//         </SheetTrigger>
//         <SheetContent className="shad-sheet h-screen px-3">
//           <SheetTitle>
//             <div className="header-user">
//               <Image
//                 src={avatar}
//                 alt="avatar"
//                 width={44}
//                 height={44}
//                 className="header-user-avatar"
//               />
//               <div className="sm:hidden lg:block">
//                 <p className="subtitle-2 capitalize">{fullName}</p>
//                 <p className="caption">{email}</p>
//               </div>
//             </div>
//             <Separator className="mb-4 bg-light-200/20" />
//           </SheetTitle>

//           <nav className="mobile-nav">
//             <ul className="mobile-nav-list">
//               {navItems.map(({ url, name, icon }) => (
//                 <Link key={name} href={url} className="lg:w-full">
//                   <li
//                     className={cn(
//                       "mobile-nav-item",
//                       pathname === url && "shad-active",
//                     )}
//                   >
//                     <Image
//                       src={icon}
//                       alt={name}
//                       width={24}
//                       height={24}
//                       className={cn(
//                         "nav-icon",
//                         pathname === url && "nav-icon-active",
//                       )}
//                     />
//                     <p>{name}</p>
//                   </li>
//                 </Link>
//               ))}
//             </ul>
//           </nav>

//           <Separator className="my-5 bg-light-200/20" />

//           <div className="flex flex-col justify-between gap-5 pb-5">
//             <FileUploader ownerId={usersId} accountId={accountId} />
//             <Button
//               type="submit"
//               className="mobile-sign-out-button"
//               onClick={async () => await signOutUser()}
//             >
//               <Image
//                 src="/assets/icons/logout.svg"
//                 alt="logo"
//                 width={24}
//                 height={24}
//               />
//               <p>Logout</p>
//             </Button>
//           </div>
//         </SheetContent>
//       </Sheet>
//     </header>
//   );
// };

// export default MobileNavigation;


"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@radix-ui/react-separator";
import { navItems } from "@/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/FileUploader";
import { signOutUser } from "@/lib/actions/user.actions";
import { useToast } from "@/hooks/use-toast";


interface Props {
  $id: string;
  accountId: string;
  fullName: string;
  avatar: string;
  email: string;
}

const MobileNavigation = ({
  $id: usersId,
  accountId,
  fullName,
  avatar,
  email,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const {toast} = useToast();
  const handleNavItemClick = () => {
    setOpen(false);
  };


  const handleSignOut = async (e:React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signOutUser();
      localStorage.removeItem("currentUser");
        return toast({
        description: (
          <p className="body-2 text-white">
           You have been signed out
          </p>
        ),
        className: "error-toast top-middle-toast",
      });
    } catch (error) {
      console.log("Failed to sign out", error);
      return toast({
        description: (
          <p className="body-2 text-white">
           Failed to sign out
          </p>
        ),
        className: "error-toast top-middle-toast",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <header className="mobile-header sticky">
      <Link href="/">
      <Image
        src="/assets/icons/logo-full-brand.svg"
        alt="logo"
        width={120}
        height={52}
        className="mt-3 h-auto"
      />
      </Link>
      

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Image
            src="/assets/icons/menu.svg"
            alt="Search"
            width={30}
            height={30}
          />
        </SheetTrigger>
        <SheetContent className="shad-sheet z-[99999] h-screen px-3">
          <SheetTitle>
            <Link href="/type/profile" className="header-user" onClick={handleNavItemClick}>
              <Image
                src={avatar}
                alt="avatar"
                width={44}
                height={44}
                className="header-user-avatar"
              />
              <div className="sm:hidden lg:block">
                <p className="subtitle-2 capitalize">{fullName}</p>
                <p className="caption">{email}</p>
              </div>
            </Link>
            <Separator className="mb-4 bg-light-200/20" />
          </SheetTitle>

          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {navItems.map(({ url, name, icon }) => (
                <Link key={name} href={url} className="lg:w-full" onClick={handleNavItemClick}>
                  <li
                    className={cn(
                      "mobile-nav-item",
                      pathname === url && "shad-active",
                    )}
                  >
                    <Image
                      src={icon}
                      alt={name}
                      width={24}
                      height={24}
                      className={cn(
                        "nav-icon",
                        pathname === url && "nav-icon-active",
                      )}
                    />
                    <p>{name}</p>
                  </li>
                </Link>
              ))}
            </ul>
          </nav>

          <Separator className="my-5 bg-light-200/20" />

          <div className="flex flex-col justify-between gap-5 pb-5">
            <FileUploader ownerId={usersId} accountId={accountId} />
            <Button
              type="submit"
              className="mobile-sign-out-button"
              onClick={handleSignOut}
            >{!loading ? (
              <>
              <Image
                src="/assets/icons/logout.svg"
                alt="logo"
                width={24}
                height={24}
              />
              <p>Logout</p>
              </>) : (<Image
                src="/assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="ml-2 animate-spin"
              />)}
              
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileNavigation;
