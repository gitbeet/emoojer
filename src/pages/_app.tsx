import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { Inter, Roboto, Roboto_Condensed } from "next/font/google";

import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";
const inter = Inter({
  subsets: ["latin"],
  // weight: ["300", "400", "700"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: "#000000" },
        elements: {
          formButtonPrimary:
            "bg-black border border-slate-950 border-solid hover:bg-white hover:text-black",
          socialButtonsBlockButton:
            "bg-white border-gray-200 hover:bg-transparent hover:border-slate-950 text-gray-600 hover:text-black",
          socialButtonsBlockButtonText: "font-semibold",
          formButtonReset:
            "bg-white border border-solid border-gray-200 hover:bg-transparent hover:border-slate-950 text-gray-500 hover:text-black",
          membersPageInviteButton:
            "bg-black border border-slate-950 border-solid hover:bg-white hover:text-black",
          card: "bg-[#fafafa]",
        },
      }}
    >
      <div className={`${inter.className}`}>
        <Toaster position="bottom-center" />
        <Component {...pageProps} />
      </div>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
