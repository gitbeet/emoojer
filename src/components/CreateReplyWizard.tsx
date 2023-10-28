import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { type ChangeEvent, useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import LoadingSpinner from "./loading";
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
        <div className="flex w-full items-center justify-center gap-4 border-b border-slate-500 p-8 ">
          <div className="flex w-full max-w-[700px]  items-start  gap-4">
            <div className="flex w-fit flex-col items-center">
              <div className="h-2"></div>
              <Image
                className="rounded-full border-2 border-black"
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
                className="w-full
               resize-none border border-slate-600 bg-transparent"
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
        <div className="w-full px-4 py-2 text-center text-2xl">
          Sign in to post
        </div>
      )}
    </>
  );
};

export default CreateReplyWizard;
