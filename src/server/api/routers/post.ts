import { clerkClient } from "@clerk/nextjs";
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

type PostWithLikes = {
  likes: {
    authorId: string;
  }[];
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
};

export type PostWithUserAndLikes = {
  post: PostWithLikes;
  author: {
    username: string;
    id: string;
    profilePicture: string;
  };
};

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

const addUserDataToPosts = async (
  posts: PostWithLikes[],
): Promise<PostWithUserAndLikes[]> => {
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

const addUserDataToSinglePost = async (
  post: PostWithLikes,
): Promise<PostWithUserAndLikes> => {
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
      include: {
        likes: {
          select: {
            authorId: true,
          },
        },
      },
      take: 100,
    });
    return addUserDataToPosts(allPosts);
  }),
  editPost: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .regex(new RegExp(/^[^\d]*$/), "Only emojis allowed.")
          .emoji("Only emojis allowed."),
        authorId: z.string(),
        postId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { content, postId, authorId } = input;
      //  NOT SURE
      if (userId !== authorId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You cannot edit this post",
        });
      }

      const editedPost = await ctx.db.post.update({
        where: {
          id: postId,
        },
        data: {
          content,
        },
      });

      return editedPost;
    }),
  deletePost: privateProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: {
          id: input.postId,
        },
        select: {
          authorId: true,
        },
      });
      if (!post || post.authorId !== ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot delete this post.",
        });
      }
      const deletedPost = await ctx.db.post.delete({
        where: {
          id: input.postId,
        },
      });
      return deletedPost;
    }),
  // CREATE NEW POST
  createPost: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .regex(new RegExp(/^[^\d]*$/), "Only emojis allowed.")
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
        include: {
          likes: {
            select: {
              authorId: true,
            },
          },
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
        include: {
          likes: {
            select: {
              authorId: true,
            },
          },
        },
        take: 100,
      });
      return addUserDataToPosts(posts);
    }),
});
