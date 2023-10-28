import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { type ChangeEvent, useState } from "react";
import { api } from "~/utils/api";
import LoadingSpinner from "./loading";
import { toast } from "react-hot-toast";
import Button from "./Button";

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
        <div className="flex w-full items-center justify-center gap-4 border-b border-slate-700 p-8 ">
          <div className="flex w-full max-w-[700px]  items-start  gap-4">
            <div className="flex w-fit flex-col items-center">
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
              className="flex grow flex-col items-center gap-4  md:flex-row"
              onSubmit={(e: React.FormEvent) => handleSubmit(e)}
            >
              <textarea
                rows={3}
                className="w-full
                 resize-none border border-slate-700 bg-transparent"
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(e.target.value)
                }
              />
              <div className="self-end">
                <Button
                  loading={Isposting}
                  disabled={Isposting}
                  content="Post"
                />
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="w-full px-4 py-2 text-center text-2xl">
          Sign in to post
        </div>
      )}
    </>
  );
};

export default CreatePostWizard;
