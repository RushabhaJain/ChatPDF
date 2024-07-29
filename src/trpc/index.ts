import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { UploadStatus } from "@prisma/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user || !user.id)
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });

    // Check if the user in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email!,
        },
      });
    }

    return { success: true };
  }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    const files = await db.file.findMany({
      where: {
        userId: userId,
      },
    });
    return files;
  }),
  deleteUserFile: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId: userId,
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      await db.file.delete({
        where: {
          id: input.id,
          userId: userId,
        },
      });
    }),
  getFile: privateProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId: userId,
        },
      });

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return file;
    }),
  getFileUploadStatus: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId: userId,
        },
      });
      if (!file) {
        return { status: "PENDING" as const };
      }
      return { status: file.uploadStatus as UploadStatus };
    }),
  getfileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;
      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId: userId,
        },
      });
      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }
      const messages = await db.message.findMany({
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }
      return {
        messages,
        nextCursor,
      };
    }),
  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;
   const billingUrl = absoluteUrl("/dashboard/billing");
    if (!userId)
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    const dbUser = await db.user.findFirst({
      where: {
        id: userId
      }
    });
    if (!dbUser) new TRPCError({
      code: "UNAUTHORIZED"
    }) 
    const subscriptionPlan = await getUserSubscriptionPlan();
    console.log('Subscription plan:', subscriptionPlan)
    if (subscriptionPlan.isSubscribed && dbUser?.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl
      });
      return {
        url: stripeSession.url
      }
    }
    console.log("Navigation to checkout page...")
    console.log("Billing URL: ", billingUrl);
    try {
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: billingUrl,
        cancel_url: billingUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
            quantity: 1
          }
        ],
        metadata: {
          userId
        }
      });
      return {
        url: stripeSession.url,
      };
    } catch(error) {
      console.log(error);
    }
    
  }),
  getUserSubscriptionPlan: privateProcedure.query(async ({ ctx }) => {
    return await getUserSubscriptionPlan();
  })
});

export type AppRouter = typeof appRouter;
