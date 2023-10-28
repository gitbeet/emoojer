import { createTRPCRouter, privateProcedure } from "../trpc";
import z from "zod";
export const likeRouter = createTRPCRouter({
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
