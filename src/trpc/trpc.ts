import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { TRPCError, initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = publicProcedure.use(async ( { next }) => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user || !user.id) {
        throw new TRPCError({
            code: "UNAUTHORIZED"
        })
    }
    return next({
        ctx: {
            user: user,
            userId: user.id
        }
    })
})
