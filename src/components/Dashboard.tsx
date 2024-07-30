"use client";

import { trpc } from "@/app/_trpc/client";
import MaxWidthWrapper from "./MaxWidthWrapper";
import UploadButton from "./UploadButton";
import "react-loading-skeleton/dist/skeleton.css"
import Skeleton from "react-loading-skeleton"
import { Calendar, Ghost, Loader2, MessageSquare, Trash } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { useState } from "react";
import { getUserSubscriptionPlan } from "@/lib/stripe";

interface DashboardProps {
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

const Dashboard = ({ subscriptionPlan }: DashboardProps) => {
    const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null);
    const utils = trpc.useUtils();
    const { data: files, isLoading } = trpc.getUserFiles.useQuery();
    const { mutate: deleteFile } = trpc.deleteUserFile.useMutation({
        onSuccess: () => {
            utils.getUserFiles.invalidate()
        },
        onSettled: () => {
            setCurrentlyDeletingFile(null);
        },
        onMutate: ({ id }) => {
            setCurrentlyDeletingFile(id)
        }
    });
    return (
        <MaxWidthWrapper className="mt-24">
            <div className="flex flex-col border-b border-gray-200 pb-5 gap-2 items-start justify-between sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-5xl font-semibold text-gray-900">My files</h1>
                <UploadButton isSubscribed={subscriptionPlan.isSubscribed} />
            </div>

            {
                files && files.length !== 0 
                ? (
                    <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {files
                        .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)))
                        .map(file => {
                            return (
                                <li key={file.id} className="col-span-1 flex divide-y divide-gray-200 flex-col pt-6 px-6 shadow transition-all hover:shadow-md bg-white">
                                    <Link href={`/dashboard/${file.id}`} className="flex gap-2 items-center">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                                        <h3 className="flex-1 text-lg font-semibold truncate text-zinc-900">{file.name}</h3>
                                    </Link>
                                    <div className="grid grid-cols-3 gap-6 mt-4 px-2 py-2 items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {format(file.createdAt, "MMM yyyy")}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Mocked
                                        </div>
                                        <Button className="w-full" variant="destructive" onClick={() => deleteFile({
                                                id: file.id
                                            })}>
                                                {
                                                    (currentlyDeletingFile && currentlyDeletingFile === file.id)
                                                    ? (<Loader2 className="w-4 h-4 animate-spin" />)
                                                    : (<Trash className="w-4 h-4" />)
                                                }
                                            </Button>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )
                : isLoading ? 
                <Skeleton count={3} height={100} className="my-2"/>
                : (
                    <div className="mt-24 flex flex-col items-center gap-2">
                        <Ghost className="w-8 h-8"/>
                        <p className="text-xl font-semibold">Preety empty around here</p>
                        <p>Let&apos;s upload your first PDF.</p>
                    </div>
                )
            }
        </MaxWidthWrapper>
    )
}

export default Dashboard;