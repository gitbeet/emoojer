import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { type ChangeEvent, useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import Button from "./Button";

const CreateReplyWizard = ({ postId }: { postId: string }) => {
  const [input, setInput] = useState("");
  const ctx = api.useUtils();
  const user = useUser();
  const { mutate: reply, isLoading: isCreatingReply } =
    api.reply.createReply.useMutation({
      onError: (error) => {
        const errorMessage = error.data?.zodError?.fieldErrors?.content;
        if (!errorMessage?.[0]) {
          return toast.error(
            "Reply could not be created.Please try again later",
          );
        }
        toast.error(errorMessage[0]);
      },
      onSuccess: () => {
        void ctx.invalidate();
        toast.success("Reply created successfully.");
        setInput("");
      },
    });

  return (
    <>
      {user && user.isSignedIn ? (
        <div className="flex w-full items-center justify-center gap-4 p-8 ">
          <div className="flex w-full max-w-[700px]  items-start  gap-4">
            <div className="flex w-fit flex-col items-center">
              <div className="h-2"></div>
              <Image
                className="rounded-full border-2 border-slate-950"
                src={user.user?.imageUrl ?? ""}
                alt={
                  user.user.username ??
                  (user.user.firstName && user.user.lastName
                    ? `${user.user.firstName} ${user.user.lastName}`
                    : "user") + "'s profile picture"
                }
                width={68}
                height={68}
              />
            </div>

            <form
              className="flex grow flex-col items-center gap-4  md:flex-row"
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                reply({
                  content: input,
                  postId,
                });
              }}
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
                  content="Reply"
                  disabled={isCreatingReply}
                  loading={isCreatingReply}
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

          <span> to reply 🤯</span>
        </div>
      )}
    </>
  );
};

export default CreateReplyWizard;
