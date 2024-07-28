"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button"
import { trpc } from "@/app/_trpc/client";

const UpgradeButton = () => {
    const { mutate: createStripeSession, isPending } = trpc.createStripeSession.useMutation({
        onSuccess: (data) => {
            if (data && data.url) {
                console.log("URL: " + data.url)
                window.location.href = data.url ?? "/dashboard/billing"
            }
        }
    })
    return (
        <Button onClick={() => createStripeSession()} className="w-full">
            {isPending 
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <p className="flex">Upgrade now <ArrowRight className="w-5 h-5 ml-1.5" /></p>
            } 
        </Button>
    )
}

export default UpgradeButton;