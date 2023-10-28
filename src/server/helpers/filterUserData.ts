import { type User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";

const filterUserData = (user: User) => {
  if (!user.username && !user.firstName) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Author for post not found (filterUserData)",
    });
  }
  return {
    id: user.id,
    username: user.username ?? `${user.firstName} ${user.lastName ?? ""}`,
    profilePicture: user.imageUrl,
  };
};

export default filterUserData;
