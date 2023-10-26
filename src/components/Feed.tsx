import Posts from "./Posts";
import { api } from "~/utils/api";
import { LoadingPage } from "./loading";

const Feed = () => {
  const { data: posts, isLoading } = api.post.getAll.useQuery();
  if (isLoading) return <LoadingPage size={72} />;
  if (!posts) return <h1>Something went wrong</h1>;
  return <Posts posts={posts} />;
};

export default Feed;
