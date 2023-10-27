import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React, { type PropsWithChildren } from "react";

const Layout = (props: PropsWithChildren) => {
  const { isSignedIn } = useUser();
  return (
    <main
      className={` flex min-h-screen w-screen bg-gradient-to-t from-slate-800 to-slate-900 text-white`}
    >
      <div className="relative mx-auto min-h-screen w-full border-x border-slate-700 xl:w-[700px]">
        <nav className="flex justify-between px-8 py-4">
          <Link href="/">
            <p>Home</p>
          </Link>
          {isSignedIn ? (
            <div
              role="button"
              className="rounded-sm border border-slate-600 bg-slate-800 px-4 py-2"
            >
              <SignOutButton>Sign out</SignOutButton>
            </div>
          ) : (
            <div
              role="button"
              className="rounded-sm border border-slate-600 bg-slate-800 px-4 py-2"
            >
              <SignInButton>Sign in</SignInButton>
            </div>
          )}
        </nav>
        {props.children}
      </div>
    </main>
  );
};

export default Layout;
