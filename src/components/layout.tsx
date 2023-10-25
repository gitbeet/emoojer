import React, { type PropsWithChildren } from "react";

const Layout = (props: PropsWithChildren) => {
  return (
    <main className={` flex min-h-screen w-screen bg-slate-900 text-white`}>
      <div className="mx-auto min-h-screen w-full border-x border-slate-400 xl:w-[700px]">
        {props.children}
      </div>
    </main>
  );
};

export default Layout;
