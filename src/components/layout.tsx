import React, { type PropsWithChildren } from "react";

const Layout = (props: PropsWithChildren) => {
  return (
    <main
      className={` flex min-h-screen w-screen bg-gradient-to-t from-slate-800 to-slate-900 text-white`}
    >
      <div className="mx-auto min-h-screen w-full border-x border-slate-700 xl:w-[700px]">
        {props.children}
      </div>
    </main>
  );
};

export default Layout;
