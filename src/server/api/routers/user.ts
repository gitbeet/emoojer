import { clerkClient } from "@clerk/nextjs";
import { createTRPCRouter, publicProcedure } from "../trpc";
import z from "zod";
import filterUserData from "~/server/helpers/filterUserData";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getUserById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await clerkClient.users.getUser(input.userId);
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User with this ID not found",
        });
      }
      return filterUserData(user);
    }),
});
