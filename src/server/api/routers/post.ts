import { clerkClient } from "@clerk/nextjs";
import { type Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import z from "zod";
import filterUserData from "~/server/helpers/filterUserData";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

const addUserDataToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserData);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    if (!author) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found (addUserDataToPosts)",
      });
    }

    return { post, author: { ...author, username: author?.username } };
  });
};

const addUserDataToSinglePost = async (post: Post) => {
  const user = await clerkClient.users.getUser(post.authorId);
  const filteredUser = filterUserData(user);
  return { post, author: filteredUser };
};

export const postRouter = createTRPCRouter({
  // GET ALL POSTS
  getAll: publicProcedure.query(async ({ ctx }) => {
    const allPosts = await ctx.db.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return addUserDataToPosts(allPosts);
  }),
  // CREATE NEW POST
  createPost: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .emoji("Only emojis are allowed!")
          .min(1, "Cannot be empty")
          .max(280),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;
      const { success } = await ratelimit.limit(authorId);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }
      const post = await ctx.db.post.create({
        data: {
          authorId: ctx.userId,
          content: input.content,
        },
      });
      return post;
    }),
  getPostById: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const singlePost = await ctx.db.post.findUnique({
        where: {
          id: input.postId,
        },
      });
      if (!singlePost) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Post with this ID not found",
        });
      }
      return addUserDataToSinglePost(singlePost);
    }),
  // GET POSTS BY USER
  getPostsByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = input;
      const posts = await ctx.db.post.findMany({
        where: {
          authorId: userId,
        },
        take: 100,
      });
      return addUserDataToPosts(posts);
    }),
});
