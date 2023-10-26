import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { type ChangeEvent, useState } from "react";
import { api } from "~/utils/api";
import LoadingSpinner from "./loading";
import { toast } from "react-hot-toast";

const CreatePostWizard = () => {
  const ctx = api.useUtils();
  const [input, setInput] = useState("");
  const { mutate, isLoading: Isposting } = api.post.createPost.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.invalidate();
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      if (!errorMessage?.[0]) {
        return toast.error("Failed to post.Please try again later");
      }
      toast.error(errorMessage[0]);
    },
  });
  const { user, isSignedIn } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ content: input });
  };
  return (
    <>
      {isSignedIn ? (
        <div className="flex w-full items-center justify-between gap-4 border-b border-slate-500 p-8 ">
          <div className="flex w-full items-center gap-4">
            <div className="flex w-fit flex-col items-center">
              <p className="text-center">{user.fullName}</p>
              <div className="h-2"></div>
              <Image
                className="rounded-full border-2 border-black"
                src={user.imageUrl}
                width={68}
                height={68}
                alt={`${user.fullName}'s profile picture`}
              />
            </div>

            <form
              className="flex grow items-center  gap-4"
              onSubmit={(e: React.FormEvent) => handleSubmit(e)}
            >
              <textarea
                rows={3}
                className="w-full
                 resize-none border border-slate-600 bg-transparent"
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(e.target.value)
                }
              />

              {Isposting ? (
                <div className="flex w-24 justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <button
                  className="w-24 rounded-sm border border-slate-600 bg-slate-800 px-4 py-2"
                  disabled={Isposting}
                >
                  Post
                </button>
              )}
            </form>
          </div>
          <div className="h-fit rounded-sm border border-slate-600 bg-slate-800 px-4 py-2">
            <SignOutButton />
          </div>
        </div>
      ) : (
        <div className="h-fit rounded-sm border border-slate-600 bg-slate-800 px-4 py-2">
          <SignInButton />
        </div>
      )}
    </>
  );
};

export default CreatePostWizard;
