import Posts from "./Posts";
import { api } from "~/utils/api";
import { LoadingPage } from "./loading";

const Feed = () => {
  const { data: posts, isLoading } = api.post.getAll.useQuery();
  if (isLoading) return <LoadingPage size={72} />;
  if (!posts) return <h1>Something went wrong</h1>;
  return (
    <section>
      <div className="border-b border-slate-700 pb-[6px] pl-8 pt-4  ">
        <p className="relative w-fit font-semibold after:absolute after:left-0 after:top-full  after:h-[6px] after:w-full  after:bg-pink-500">
          Feed
        </p>
      </div>
      <div className="h-4"></div>
      <Posts posts={posts} />
    </section>
  );
};

export default Feed;
