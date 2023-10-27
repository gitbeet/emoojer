import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { api, type RouterOutputs } from "~/utils/api";
import { BsTrashFill } from "react-icons/bs";
import { FaEdit, FaHeart } from "react-icons/fa";
import React, { useState } from "react";
import { useRouter } from "next/router";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = ({
  post,
  postPage = false,
  editedPost,
  setEditedPost,
}: {
  post: PostWithUser;
  postPage?: boolean;
  editedPost?: string;
  setEditedPost?: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { back } = useRouter();
  const [input, setInput] = useState(post.post.content);
  const ctx = api.useUtils();
  const { user } = useUser();
  // DID I LIKE IT
  const { data: didIlike, isLoading: isCalculatingIfILiked } =
    api.like.didIlike.useQuery({ type: "POST", id: post.post.id });
  // GET LIKES
  const { data: likes, isLoading: isGettingLikes } =
    api.like.getLikesById.useQuery({ id: post.post.id, type: "POST" });
  // LIKE POST
  const { mutate: like, isLoading: isLiking } = api.like.like.useMutation({
    onSuccess: () => {
      void ctx.invalidate();
      toast.success("Action successful");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  // EDIT POST
  const { mutate: editPost, isLoading: isPostEditing } =
    api.post.editPost.useMutation({
      onSuccess: () => {
        void ctx.invalidate();
        toast.success("Post updated successfully");
        setEditedPost?.("");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  // DELETE POST
  const { mutate: deletePost, isLoading: isDeletingPost } =
    api.post.deletePost.useMutation({
      onSuccess: () => {
        void ctx.invalidate();
        toast.success("Post deleted successfully");
        back();
        // navigate away on post delete
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  return (
    <div className="border-b border-slate-700  p-8" key={post.post.id}>
      <div className="flex gap-2">
        <Link href={`/${post.author.id}`} className=" hover:underline">
          <p>@{post.author.username}</p>
        </Link>
        {postPage ? (
          <p className="text-slate-400">
            {dayjs(post.post.createdAt).fromNow()}
          </p>
        ) : (
          <Link href={`posts/${post.post.id}`}>
            <p className="text-slate-400">
              {dayjs(post.post.createdAt).fromNow()}
            </p>
          </Link>
        )}
      </div>
      <div className="h-4"></div>
      <div className="flex items-center gap-8">
        <Image
          className="rounded-full border-2 border-black"
          src={post.author.profilePicture}
          width={68}
          height={68}
          alt={`${post.author.username}'s profile picture`}
        />
        {editedPost === post.post.id ? (
          <>
            <textarea
              rows={3}
              className="grow resize-none rounded-sm border border-slate-600 bg-transparent"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInput(e.target.value)
              }
            />
            <button onClick={() => setEditedPost?.("")}>Cancel</button>
            <button
              onClick={() =>
                editPost({
                  content: input,
                  authorId: post.author.id,
                  postId: post.post.id,
                })
              }
            >
              Save
            </button>
          </>
        ) : (
          <p className="grow text-2xl">{post.post.content}</p>
        )}
      </div>
      <div className="h-4"></div>
      <div className="flex w-full justify-end gap-4">
        <div className="flex items-center gap-1">
          <p>{likes}</p>
          <button
            disabled={isLiking}
            onClick={() => like({ id: post.post.id, type: "POST" })}
          >
            <FaHeart className={didIlike ? "text-red-500" : "text-slate-200"} />
          </button>
        </div>

        <button
          disabled={isPostEditing || post.author.id !== user?.id}
          onClick={() => setEditedPost?.(post.post.id)}
          className=" cursor-pointer text-slate-200  disabled:opacity-50"
        >
          <FaEdit />
        </button>
        <button
          disabled={isDeletingPost || post.author.id !== user?.id}
          onClick={() => deletePost({ postId: post.post.id })}
          className=" cursor-pointer text-red-500  disabled:opacity-50"
        >
          <BsTrashFill />
        </button>
      </div>
    </div>
  );
};

export default PostView;
