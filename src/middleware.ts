import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/posts/:postId",
    "/:userId",
    "/api/trpc/post.getAll",
    "/api/trpc/post.getPostById",
    "/api/trpc/post.getPostsByUserId",
    "/api/trpc/post.getPostsByUserId,user.getUserById",
    "/api/trpc/reply.getRepliesByPostId",
    "/api/trpc/like.didIlike",
    "/api/trpc/like.getLikesById",
    "/api/trpc/post.getPostById,reply.getRepliesByPostId",
    "/api/trpc/like.didIlike,like.getLikesById,reply.getRepliesByPostId,post.getPostById",
    "/api/trpc/reply.getRepliesByPostId,post.getPostById",
  ],
  apiRoutes: [
    "/api/trpc/post.getAll",
    "/api/trpc/user.getUserById",
    "/api/trpc/post.getPostsByUserId",
    "/api/trpc/post.getPostsByUserId,user.getUserById",
    "/api/trpc/reply.getRepliesByPostId",
    "/api/trpc/like.didIlike",
    "/api/trpc/like.getLikesById",
    "/api/trpc/post.getPostById,reply.getRepliesByPostId",
    "/api/trpc/like.didIlike,like.getLikesById,reply.getRepliesByPostId,post.getPostById",
    "/api/trpc/reply.getRepliesByPostId,post.getPostById",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
