"use client";

import { getUserSubscriptionPlan } from "@/lib/stripe";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface BillingFormProps {
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

const BillingForm = ({ subscriptionPlan }: BillingFormProps) => {
    const { toast } = useToast();
    const { mutate: createStripeSession, isPending } = trpc.createStripeSession.useMutation({
        onSuccess: (data) => {
            if (data && data.url) {
                window.location.href = data.url;
            }
            if (!data || !data.url) {
                toast({
                    title: "There was a problem...",
                    description: "Please try again in a moment",
                    variant: "destructive"
                })
            }
        }
    });

    return (
        <MaxWidthWrapper className="max-w-5xl">
            <form className="mt-12" onSubmit={(e) => {
                e.preventDefault();
                createStripeSession();
            }}>
                <Card>
                <CardHeader>
                    <CardTitle>Subscription Plan</CardTitle>
                    <CardDescription>You are currently on the {subscriptionPlan.name}</CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col items-center md:flex-row md:justify-between">
                    <Button disabled={isPending}>
                        {
                            isPending && <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        }
                        {
                            subscriptionPlan.isSubscribed ? "Manage Subscription" : "Upgrade to PRO"
                        }
                    </Button>
                    {
                        subscriptionPlan.isSubscribed && 
                        <p className="text-xs font-medium">
                            {subscriptionPlan.isCanceled ? "Your plan will be canceled on " : "Your plan renews on " }
                            {format(subscriptionPlan.stripeCurrentPeriodEnd!, "dd.MM.yyyy")}.
                        </p>
                    }
                </CardFooter> 
                </Card>
            </form>
        </MaxWidthWrapper>
    )
}

export default BillingForm;