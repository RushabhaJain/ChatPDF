import { trpc } from "@/app/_trpc/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Icons } from "./Icons";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { Gem, Loader2 } from "lucide-react";
import Link from "next/link";

interface UserNavButtonProps {
  name: string;
  email: string;
  imageUrl: string;
}

const UserNavButton = ({ name, email, imageUrl }: UserNavButtonProps) => {
  const { data: userSubscriptionPlan, isLoading } =
    trpc.getUserSubscriptionPlan.useQuery();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button className="rounded-full w-8 h-8" variant="secondary">
          <Avatar className="w-8 h-8">
            <AvatarImage src={imageUrl} alt="Profile pic" />
            <AvatarFallback>
              <span className="sr-only">{name}</span>
              <Icons.user className="w-8 h-8 text-zinc-700" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex flex-col gap-1 p-2">
          <p className="text-sm font-medium text-black">{name}</p>
          <p className="text-xs text-zinc-600">{email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : userSubscriptionPlan?.isSubscribed ? (
            <Link href="/dashboard/billing">Manage Subscription</Link>
          ) : (
            <Link href="/pricing" className="flex items-center">
              Upgrade <Gem className="w-4 h-4 text-purple-600 ml-1.5" />
            </Link>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutLink>Logout</LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNavButton;
