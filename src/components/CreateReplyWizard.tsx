import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";

const CreateReplyWizard = ({ postId }: { postId: string }) => {
  const [input, setInput] = useState("");
  const ctx = api.useUtils();
  const user = useUser();
  const { mutate, isLoading: isCreatingReply } =
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
      },
    });
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    user &&
    user.isSignedIn && (
      <form
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          mutate({
            content: input,
            postId,
          });
          setInput("");
        }}
        className="flex w-full flex-col  gap-16 p-8"
      >
        <div className="flex items-center gap-4">
          <Image
            width={56}
            height={56}
            className="rounded-full border border-black"
            src={user.user?.imageUrl ?? ""}
            alt={
              user.user.username ??
              (user.user.firstName && user.user.lastName
                ? `${user.user.firstName} ${user.user.lastName}`
                : "user") + "'s profile picture"
            }
          />
          <textarea
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
            ref={inputRef}
            className="grow resize-none rounded-sm border border-slate-600 bg-transparent"
            rows={3}
          />
        </div>

        <button
          disabled={input.length < 1 || isCreatingReply}
          className="self-end rounded-sm border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reply
        </button>
      </form>
    )
  );
};

export default CreateReplyWizard;
