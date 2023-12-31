import { createServerSideHelpers } from "@trpc/react-query/server";
import {
  type InferGetServerSidePropsType,
  type GetServerSidePropsContext,
} from "next";
import Head from "next/head";
import Image from "next/image";
import React from "react";
import SuperJSON from "superjson";
import PostView from "~/components/PostView";
import Layout from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import { api } from "~/utils/api";
import { BiArrowBack } from "react-icons/bi";
import { useRouter } from "next/router";
import ErrorPage from "./404";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.post.getPostsByUserId.useQuery({
    userId: props.userId,
  });
  if (isLoading) return <LoadingPage size={72} />;
  if (!data) return <h1>Something went wrong</h1>;
  return (
    <section>
      {data?.map((post) => <PostView key={post.post.id} post={post} />)}
    </section>
  );
};

const ProfilePage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { back } = useRouter();
  const { data, isLoading } = api.user.getUserById.useQuery({
    userId: props.userId,
  });

  if (isLoading)
    return (
      <Layout>
        <LoadingPage />
      </Layout>
    );
  if (!data) return <ErrorPage />;

  return (
    <>
      <Head>
        <title>{`${data.username}'s profile page`}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div>
          <div className="sticky top-0 z-10 h-12 w-full ">
            <div className="absolute h-full w-full bg-slate-800 opacity-75 backdrop-blur-md" />
            <button
              onClick={back}
              className="absolute top-1/2 z-10 ml-8 flex -translate-y-1/2 items-center gap-2"
            >
              <BiArrowBack /> Go back
            </button>
          </div>
          <div className="relative h-56 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
            <Image
              src={data.profilePicture}
              alt={`@${data.username}'s profile picture`}
              className="absolute bottom-0 left-0 -mb-[72px] ml-8 aspect-square rounded-full border-4 border-slate-950 bg-black"
              width={144}
              height={144}
            />
          </div>
          <div className="h-20" />
          <div className="px-8 text-2xl font-bold">{`@${data.username}`}</div>
          <div className="h-16" />
          <div className="relative w-fit pl-8 font-semibold ">
            <p className="relative w-fit font-semibold after:absolute after:bottom-0 after:left-0 after:-mb-2 after:h-[6px] after:w-full after:bg-pink-500">
              Posts
            </p>
          </div>
          <div className="h-2 w-full border-b border-slate-700" />

          <ProfileFeed userId={data.id} />
        </div>
      </Layout>
    </>
  );
};

export default ProfilePage;

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ slug: string }>,
) => {
  const slug = context.params?.slug;
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      db: db,
      userId: null,
    },
    transformer: SuperJSON,
  });

  if (typeof slug !== "string") {
    throw new Error("no slug");
  }

  await helpers.user.getUserById.prefetch({ userId: slug });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      userId: slug,
    },
  };
};
