import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FaEdit, FaHeart, FaTrash } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);
type ReplyWithLikes = RouterOutputs["reply"]["getRepliesByPostId"][number];

const ReplyView = ({ reply }: { reply: ReplyWithLikes }) => {
  const ctx = api.useUtils();
  const user = useUser();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(reply.reply.content);
  //   EDIT
  const { mutate: edit, isLoading: isEditing } =
    api.reply.editReply.useMutation({
      onSuccess: () => {
        void ctx.invalidate();
        toast.success("Reply updated successfully");
        setEditing(false);
      },
      onError: () => {
        toast.error("Error occured when updating the reply.Please try again");
      },
    });
  // DELETE
  const { mutate: deleteReply, isLoading: isDeleting } =
    api.reply.deleteReply.useMutation({
      onSuccess: () => {
        void ctx.invalidate();
        toast.success("Reply deleted successfully");
      },
    });
  const { mutate: like, isLoading: isLiking } = api.like.like.useMutation({
    onSuccess: () => {
      void ctx.invalidate();
    },
    onError: () => {
      toast.error("Error occured when deleting the reply.Please try again");
    },
  });
  return (
    <div
      className="border-b border-slate-700 px-8 py-6 pl-16"
      key={reply.reply.id}
    >
      <div className="flex gap-2 text-sm">
        <Link href={`/${reply.author.id}`} className=" hover:underline">
          <p>@{reply.author.username}</p>
        </Link>
        <p className="text-slate-400">
          {dayjs(reply.reply.createdAt).fromNow()}
        </p>
      </div>
      <div className="h-4"></div>
      <div className="flex items-center gap-8">
        <Image
          className="rounded-full border-2 border-black"
          src={reply.author.profilePicture}
          width={48}
          height={48}
          alt={`${reply.author.username}'s profile picture`}
        />
        {editing ? (
          <div className="flex">
            <textarea
              className="w-full grow resize-none rounded-sm border border-slate-700 bg-transparent text-xl"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInput(e.target.value)
              }
            />
            <div>
              <button onClick={() => setEditing(false)}>Cancel</button>
              <button
                onClick={() =>
                  edit({
                    content: input,
                    id: reply.reply.id,
                    authorId: reply.author.id,
                  })
                }
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xl">{reply.reply.content}</p>
        )}
      </div>
      <div className="h-2"></div>
      <div className="flex justify-end gap-4">
        <div className="flex items-center gap-1">
          <p className="font-light text-slate-400">
            {reply.reply.likes.length}
          </p>
          <button
            className={user.isSignedIn ? "" : "cursor-default"}
            disabled={isLiking}
            onClick={() =>
              user.isSignedIn ? like({ id: reply.reply.id, type: "REPLY" }) : {}
            }
          >
            <FaHeart
              className={
                user?.user?.id &&
                reply.reply.likes.find(
                  (like) => like.authorId === user?.user?.id,
                )
                  ? "text-red-500 hover:text-red-400"
                  : "text-slate-200"
              }
            />
          </button>
        </div>
        {reply.author.id === user.user?.id && (
          <>
            <button disabled={isLiking} onClick={() => setEditing(true)}>
              <FaEdit className="text-slate-300 hover:text-slate-100" />
            </button>
            <button
              disabled={isLiking}
              onClick={() =>
                deleteReply({ id: reply.reply.id, authorId: reply.author.id })
              }
            >
              <FaTrash className="text-slate-300 hover:text-slate-100" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReplyView;
