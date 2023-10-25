import {
  type InferGetServerSidePropsType,
  type GetServerSidePropsContext,
} from "next";
import { createServerSideHelpers } from "@trpc/react-query/server";
import SuperJSON from "superjson";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import { api } from "~/utils/api";
import Layout from "~/components/layout";
import PostView from "~/components/PostView";

const SinglePostPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { data, isLoading } = api.post.getPostById.useQuery({
    postId: props.postId,
  });
  if (!data)
    return (
      <Layout>
        <h1>Something went wrong</h1>
      </Layout>
    );
  if (isLoading)
    return (
      <Layout>
        {" "}
        <h1>Loading...</h1>
      </Layout>
    );
  return (
    <Layout>
      <PostView post={data} />
    </Layout>
  );
};

export default SinglePostPage;

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ id: string }>,
) => {
  const id = context.params?.id;

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      db,
      userId: null,
    },
    transformer: SuperJSON,
  });

  if (typeof id !== "string") {
    throw new Error("Post ID not found");
  }

  await helpers.post.getPostById.prefetch({ postId: id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      postId: id,
    },
  };
};
