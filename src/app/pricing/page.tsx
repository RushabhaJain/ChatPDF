import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import UpgradeButton from "@/components/UpgradeButton";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PLANS } from "@/config/stripe";
import { cn } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight, Check, HelpCircle, Minus } from "lucide-react";
import Link from "next/link";

const PricingPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const pricingItems = [
    {
      plan: "Free",
      tagline: "For small side projects.",
      quota: PLANS.find((p) => p.slug === "free")!.quota,
      features: [
        {
          text: "5 pages per PDF",
          footnote: "The maximum amount of pages per PDF-file.",
        },
        {
          text: "4MB file size limit",
          footnote: "The maximum file size of a single PDF file.",
        },
        {
          text: "Mobile-friendly interface",
        },
        {
          text: "Higher-quality responses",
          footnote: "Better algorithmic responses for enhanced content quality",
          negative: true,
        },
        {
          text: "Priority support",
          negative: true,
        },
      ],
    },
    {
      plan: "Pro",
      tagline: "For larger projects with higher needs.",
      quota: PLANS.find((p) => p.slug === "pro")!.quota,
      features: [
        {
          text: "25 pages per PDF",
          footnote: "The maximum amount of pages per PDF-file.",
        },
        {
          text: "16MB file size limit",
          footnote: "The maximum file size of a single PDF file.",
        },
        {
          text: "Mobile-friendly interface",
        },
        {
          text: "Higher-quality responses",
          footnote: "Better algorithmic responses for enhanced content quality",
        },
        {
          text: "Priority support",
        },
      ],
    },
  ];

  return (
    <MaxWidthWrapper className="flex flex-col gap-8 mb-10">
      <div className="flex flex-col items-center mt-20 mx-auto max-w-lg">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">Pricing</h1>
        <p className="text-gray-600 sm:text-lg text-center mt-4">
          Whether you're just trying out our service or need more, we've got you
          covered.
        </p>
      </div>
      <div className="w-full flex flex-col gap-4 mt-10 sm:flex-row">
        <TooltipProvider>
          {pricingItems.map((pricingItem, i) => {
            const price = PLANS.find(
              (plan) => plan.slug === pricingItem.plan.toLowerCase()
            )!.price.amount;
            return (
              <div
                key={i}
                className={cn("flex-1 rounded-2xl shadow-lg bg-white border border-gray-200", {
                    "relative border-2 border-purple-500": pricingItem.plan === "Pro"
                })}
              >
                {pricingItem.plan === "Pro" && <div className="text-sm top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 absolute px-3 py-2 font-medium rounded-full bg-gradient-to-r from-purple-700 to-purple-500 text-white">Upgrade now</div>}
                <div className="p-5 flex flex-col items-center">
                  <h3 className="text-3xl my-3 font-semibold">
                    {pricingItem.plan}
                  </h3>
                  <p className="text-gray-500">{pricingItem.tagline}</p>
                  <h1 className="my-5 text-6xl font-semibold">${price}</h1>
                  <p className="text-gray-500">per month</p>
                </div>
                <div className="border border-gray-200 p-5 justify-center flex gap-2 items-center bg-gray-50">
                  <p>{pricingItem.quota} PDFs/mo included</p>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-zinc-500" />
                    </TooltipTrigger>
                    <TooltipContent className="w-80 p-2">
                      How many PDFs you can upload per month.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="my-10">
                  <ul className="flex flex-col px-8 space-y-5">
                    {pricingItem.features.map((feature, index) => {
                      return (
                        <li className="flex gap-6" key={index}>
                          {feature.negative ? (
                            <Minus className="w-6 h-6 text-gray-300" />
                          ) : (
                            <Check className="w-6 h-6 text-purple-500" />
                          )}

                          <div className="flex items-center gap-2">
                            <p
                              className={cn("text-gray-600", {
                                "text-gray-400": feature.negative,
                              })}
                            >
                              {feature.text}
                            </p>
                            {feature.footnote && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="w-4 h-4 text-zinc-500" />
                                </TooltipTrigger>
                                <TooltipContent className="w-80 p-2">
                                  <p>{feature.footnote}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="h-px bg-gray-200 w-full"></div>
                <div className="p-5">
                  {pricingItem.plan === "Free" ? (
                    <Link
                      href={user ? "/dashboard" : "/sign-in"}
                      className={buttonVariants({
                        className: "w-full",
                        variant: "secondary",
                      })}
                    >
                      {user ? "Upgrade now" : "Sign up"}
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  ) : user ? (
                    <UpgradeButton />
                  ) : (
                    <Link
                      href="/sign-in"
                      className={buttonVariants({
                        className: "w-full",
                      })}
                    >
                      {user ? "Upgrade now" : "Sign up"}
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </TooltipProvider>
      </div>
    </MaxWidthWrapper>
  );
};

export default PricingPage;
