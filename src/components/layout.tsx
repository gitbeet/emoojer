import {
  SignInButton,
  SignOutButton,
  useClerk,
  useSignIn,
  useUser,
} from "@clerk/nextjs";
import React, { type PropsWithChildren } from "react";
import Button from "./Button";
import Link from "next/link";
import Logo from "./Logo";
const Layout = (props: PropsWithChildren) => {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { signIn, isLoaded } = useSignIn();
  return (
    <main className="relative flex min-h-screen text-slate-100">
      <div className="fixed inset-0 min-h-screen w-screen bg-slate-800"></div>
      <div className="relative z-20 mx-auto w-full  lg:w-[700px] lg:border-x-2 lg:border-slate-700  ">
        <div className="absolute inset-0 z-[-1] min-h-screen  bg-[rgba(12,12,30,0.15)] "></div>
        <nav className="flex items-center justify-between gap-8  border-b border-slate-700  px-8 py-6 ">
          <Link href="/">
            <Logo />
          </Link>
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline">
                <span>Welcome, </span>
                <span className="font-bold">
                  {user.username
                    ? user.username
                    : user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.firstName}
                </span>
              </span>
              <SignOutButton>
                <Button
                  content={<p>Sign out</p>}
                  onClick={() => void 0}
                  loading={!isLoaded}
                />
              </SignOutButton>
            </div>
          ) : (
            <SignInButton>
              <Button
                content={<p>Sign in</p>}
                onClick={() => void 0}
                loading={!isLoaded}
              />
            </SignInButton>
          )}
        </nav>
        {props.children}
      </div>
    </main>
  );
};

export default Layout;
