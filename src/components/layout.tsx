import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React, { type PropsWithChildren } from "react";
import Button from "./Button";

const Layout = (props: PropsWithChildren) => {
  const { isSignedIn } = useUser();
  return (
    <main
      className={` flex min-h-screen w-screen bg-gradient-to-t from-slate-800 to-slate-900 text-white `}
    >
      <div className="relative mx-auto min-h-screen w-full border-x border-slate-700 lg:w-[700px]">
        <nav className="flex items-center justify-between px-8 py-4 ">
          <div className="flex items-center">
            <p className=" border-slate-500 bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-center text-2xl font-semibold text-transparent">
              Em
            </p>
            <div className="scale-x-[-1] text-2xl">👀</div>
            <p className=" border-slate-500 bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-center text-2xl font-semibold text-transparent">
              jer
            </p>
          </div>
          <Link href="/">
            <p>Home</p>
          </Link>
          {isSignedIn ? (
            <Button
              content={<SignOutButton>Sign out</SignOutButton>}
              onClick={() => null}
            />
          ) : (
            <Button
              content={<SignInButton>Sign in</SignInButton>}
              onClick={() => null}
            />
          )}
        </nav>
        {props.children}
      </div>
    </main>
  );
};

export default Layout;
