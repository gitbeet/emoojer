import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Image from "next/image";
import Link from "next/link";
import { type RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = ({ post }: { post: PostWithUser }) => {
  return (
    <div className="border-b border-slate-700  p-8" key={post.post.id}>
      <div className="flex gap-2">
        <Link href={`/${post.author.id}`}>
          <p>@{post.author.username}</p>
        </Link>
        <Link href={`posts/${post.post.id}`}>
          <p className="text-slate-400">
            {dayjs(post.post.createdAt).fromNow()}
          </p>
        </Link>
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
    </div>
  );
};

export default PostView;
