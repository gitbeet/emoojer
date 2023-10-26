import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/posts/:postId",
    "/:userId",
    "/api/trpc/post.getAll",
    "/api/trpc/post.getPostById",
    "/api/trpc/post.getPostsByUserId,user.getUserById",
  ],
  apiRoutes: [
    "/api/trpc/post.getAll",
    "/api/trpc/user.getUserById",
    "/api/trpc/post.getPostsByUserId",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
