import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import z from "zod";
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import filterUserData from "~/server/helpers/filterUserData";
import { ratelimit } from "./post";
import { TRPCClientError } from "@trpc/client";

type ReplyWithLikes = {
  likes: {
    authorId: string;
  }[];

  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  postId: string;
};

const addUserDataToReplies = async (replies: ReplyWithLikes[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: replies.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserData);

  return replies.map((reply) => {
    const author = users.find((user) => user.id === reply.authorId);

    if (!author) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found (addUserDataToPosts)",
      });
    }

    return { reply, author: { ...author, username: author?.username } };
  });
};

export const replyRouter = createTRPCRouter({
  deleteReply: privateProcedure
    .input(
      z.object({
        id: z.string(),
        authorId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, authorId } = input;
      const { userId } = ctx;
      //  NOT SURE
      if (userId !== authorId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You cannot delete this reply",
        });
      }
      await ctx.db.reply.delete({
        where: {
          id,
        },
      });
    }),
  editReply: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis are allowed!"),
        id: z.string(),
        authorId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { content, id, authorId } = input;
      const { userId } = ctx;
      //  NOT SURE
      if (userId !== authorId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You cannot edit this reply",
        });
      }
      await ctx.db.reply.update({
        where: {
          id,
        },
        data: {
          content,
        },
      });
    }),
  createReply: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis allowed!").min(1).max(280),
        postId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const { success } = await ratelimit.limit(userId);
      if (!success) {
        throw new TRPCClientError("Don't spam ples!");
      }
      const reply = await db.reply.create({
        data: {
          authorId: userId,
          content: input.content,
          postId: input.postId,
        },
      });
      return reply;
    }),
  getRepliesByPostId: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const replies = await ctx.db.reply.findMany({
        where: {
          postId: input.postId,
        },
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
      return addUserDataToReplies(replies);
    }),
});
