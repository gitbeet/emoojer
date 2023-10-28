import Posts from "./Posts";
import { api } from "~/utils/api";
import { LoadingPage } from "./loading";

const Feed = () => {
  const { data: posts, isLoading } = api.post.getAll.useQuery();
  if (isLoading) return <LoadingPage size={72} />;
  if (!posts) return <h1>Something went wrong</h1>;
  return (
    <section>
      <p className="border-b border-slate-500  py-4 text-center text-2xl font-semibold text-slate-200">
        Feed
      </p>
      <div className="h-4"></div>
      <Posts posts={posts} />
    </section>
  );
};

export default Feed;
