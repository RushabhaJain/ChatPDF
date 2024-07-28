import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ComponentProps {
    className?: string,
    children: ReactNode
}

const MaxWidthWrapper = ({
    className,
    children
}: ComponentProps) => {
    return (
        <div className={cn("mx-auto max-w-screen-xl w-full px-2.5 md:px-20", className)}>
            {children}
        </div>
    )
}

export default MaxWidthWrapper;