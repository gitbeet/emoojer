import { clerkClient } from "@clerk/nextjs";
import { type User } from "@clerk/nextjs/dist/types/server";
import { type Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import z from "zod";

const filterUserData = (user: User) => {
  if (!user.username && !user.firstName) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Author for post not found (filterUserData)",
    });
  }
  return {
    id: user.id,
    username: user.username ?? `${user.firstName} ${user.lastName}`,
    profilePicture: user.imageUrl,
  };
};

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
        content: z.string().emoji("Only emojis are allowed!").min(1).max(280),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
});
