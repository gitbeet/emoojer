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
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useUser } from "@clerk/nextjs";
import { useRef } from "react";
import toast from "react-hot-toast";
import CreateReplyWizard from "~/components/CreateReplyWizard";

dayjs.extend(relativeTime);

const SinglePostPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { data: replies, isLoading: areRepliesLoading } =
    api.reply.getRepliesByPostId.useQuery({ postId: props.postId });

  const { data, isLoading } = api.post.getPostById.useQuery({
    postId: props.postId,
  });
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  if (!data)
    return (
      <Layout>
        <h1>Something went wrong</h1>
      </Layout>
    );
  if (isLoading)
    return (
      <Layout>
        <h1>Loading...</h1>
      </Layout>
    );
  return (
    <>
      <Head>
        <title>{`${data.post.content}`}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <PostView post={data} postPage />
        <CreateReplyWizard postId={props.postId} />
        <p className="border-b border-slate-600 py-2 pl-8 text-xl">Replies</p>
        {replies?.map((reply) => (
          <div
            className="border-b border-slate-700  p-8 pl-16"
            key={reply.reply.id}
          >
            <div className="flex gap-2">
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
                width={68}
                height={68}
                alt={`${reply.author.username}'s profile picture`}
              />
              <p className="text-2xl">{reply.reply.content}</p>
            </div>
          </div>
        ))}
      </Layout>
    </>
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
    throw new Error("no id");
  }

  await helpers.post.getPostById.prefetch({ postId: id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      postId: id,
    },
  };
};
