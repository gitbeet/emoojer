import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { type ChangeEvent, useState } from "react";
import { api } from "~/utils/api";
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
        <div className="flex w-full flex-col items-center justify-center gap-4   p-8">
          <div className="p-8 text-center text-5xl font-black">
            <span className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent ">
              Create a post
            </span>
            <span> 🚀</span>
          </div>
          <div className="h-8"></div>
          <div className="flex w-full max-w-[700px]  items-start  gap-4">
            <div className="flex w-fit flex-col items-center">
              <div className="h-2"></div>
              <Image
                className="rounded-full border-2 border-slate-950"
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
        <div className="flex w-full flex-col items-center justify-center gap-2 p-16 px-4 text-center text-5xl font-black md:flex-row">
          <SignInButton>
            <span className="cursor-pointer bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text pb-2 text-transparent hover:brightness-110 md:p-4 md:pr-0">
              Sign in
            </span>
          </SignInButton>

          <span> to post 🙏</span>
        </div>
      )}
    </>
  );
};

export default CreatePostWizard;
