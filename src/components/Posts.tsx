import PostView from "./PostView";
import { type RouterOutputs } from "~/utils/api";

type PostsWithUser = RouterOutputs["post"]["getAll"];
const Posts = (props: { posts: PostsWithUser }) => {
  const { posts } = props;

  return (
    <section>
      {posts.map((post) => (
        <PostView key={post.post.id} post={post} />
      ))}
    </section>
  );
};

export default Posts;
