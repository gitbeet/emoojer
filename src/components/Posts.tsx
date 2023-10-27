import { useState } from "react";
import PostView from "./PostView";
import { type RouterOutputs } from "~/utils/api";

type PostsWithUser = RouterOutputs["post"]["getAll"];
const Posts = (props: { posts: PostsWithUser }) => {
  const { posts } = props;
  const [editedPost, setEditedPost] = useState("");
  return (
    <section>
      {posts.map((post) => (
        <PostView
          key={post.post.id}
          post={post}
          editedPost={editedPost}
          setEditedPost={setEditedPost}
        />
      ))}
    </section>
  );
};

export default Posts;
