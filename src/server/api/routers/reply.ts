import { Reply } from "@prisma/client";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import z from "zod";
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import filterUserData from "~/server/helpers/filterUserData";

const addUserDataToReplies = async (reply: Reply[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: reply.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserData);

  return reply.map((reply) => {
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
  createReply: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis allowed!").min(1).max(280),
        postId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
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
        take: 100,
      });
      return addUserDataToReplies(replies);
    }),
});
