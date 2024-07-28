"use client";

import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs";
import { ArrowRight } from "lucide-react";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import UserNavButton from "./UserNavButton";

const Navbar = ({ user }: { user: KindeUser | null }) => {
  return (
    <nav className="sticky h-14 top-0 inset-x-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-md">
      <MaxWidthWrapper className="h-full">
        <div className="flex h-full justify-between items-center">
          <Link href="/" className="font-semibold">
            ChatPDF.
          </Link>
          <div className="hidden sm:flex space-x-4">
            {!user && (
              <>
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Pricing
                </Link>
                <LoginLink
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Sign in
                </LoginLink>
                <RegisterLink
                  className={buttonVariants({
                    size: "sm",
                  })}
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </RegisterLink>
              </>
            )}
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Dashboard
                </Link>
                <UserNavButton
                  name={
                    !user.given_name || !user.family_name
                      ? "Your Account"
                      : `${user.given_name} ${user.family_name}`
                  }
                  email={user.email ?? ""}
                  imageUrl={user.picture ?? ""}
                />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
