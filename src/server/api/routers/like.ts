import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import z from "zod";
export const likeRouter = createTRPCRouter({
  didIlike: privateProcedure
    .input(z.object({ type: z.enum(["POST", "REPLY"]), id: z.string() }))
    .query(async ({ ctx, input }) => {
      const didILike = await ctx.db.like.findFirst({
        where: {
          AND: [
            { authorId: ctx.userId },
            {
              ...(input.type === "POST"
                ? { postId: input.id }
                : input.type === "REPLY"
                ? { replyId: input.id }
                : {}),
            },
          ],
        },
      });
      return !!didILike?.id;
    }),
  getLikesById: publicProcedure
    .input(z.object({ type: z.enum(["POST", "REPLY"]), id: z.string() }))
    .query(async ({ ctx, input }) => {
      const likes = await ctx.db.like.count({
        where: {
          ...(input.type === "POST"
            ? { postId: input.id }
            : input.type === "REPLY"
            ? { replyId: input.id }
            : {}),
        },
      });
      return likes;
    }),
  like: privateProcedure
    .input(z.object({ type: z.enum(["POST", "REPLY"]), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const likeExists = await ctx.db.like.findMany({
        where: {
          AND: [
            { authorId: ctx.userId },
            {
              ...(input.type === "POST"
                ? { postId: input.id }
                : input.type === "REPLY"
                ? { replyId: input.id }
                : {}),
            },
          ],
        },
      });
      if (!likeExists[0]) {
        const like = await ctx.db.like.create({
          data: {
            authorId: ctx.userId,
            ...(input.type === "POST"
              ? { postId: input.id }
              : input.type === "REPLY"
              ? { replyId: input.id }
              : {}),
          },
        });
        return like;
      } else {
        const like = await ctx.db.like.delete({
          where: {
            id: likeExists[0].id,
          },
        });
        return like;
      }
    }),
});
