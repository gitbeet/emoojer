import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { api, type RouterOutputs } from "~/utils/api";
import { BsTrashFill } from "react-icons/bs";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = ({
  post,
  postPage = false,
}: {
  post: PostWithUser;
  postPage?: boolean;
}) => {
  const ctx = api.useUtils();
  const { user } = useUser();
  const { mutate: deletePost, isLoading: isDeletingPost } =
    api.post.deletePost.useMutation({
      onSuccess: () => {
        void ctx.invalidate();
        toast.success("Post deleted successfully");
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
        <p className="text-2xl">{post.post.content}</p>
      </div>
      <div className="h-4"></div>
      <div className="flex w-full justify-end">
        <button
          disabled={isDeletingPost || post.author.id !== user?.id}
          onClick={() => deletePost({ postId: post.post.id })}
          className=" cursor-pointer text-red-600  disabled:opacity-50"
        >
          <BsTrashFill />
        </button>
      </div>
    </div>
  );
};

export default PostView;
