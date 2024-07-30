"use client";

import { trpc } from "@/app/_trpc/client";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import Messages from "./Messages";
import ChatInput from "./ChatInput";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ChatContextProvider } from "./ChatContext";

const ChatWrapper = ({ fileId }: { fileId: string}) => {
    const { data } =
    trpc.getFileUploadStatus.useQuery(
      {
        id: fileId,
      },
      {
        refetchInterval: ({ state }): number | false => {
            const status = state.data?.status;
            return status && (state.data?.status === 'SUCCESS' ||
            data?.status === 'FAILURE')
              ? false
              : 500
        },
        retry: true
      }
    )

    if (data && (data.status === "PENDING")) {
        return (
            <div className="w-full h-full flex flex-col justify-center items-center bg-zinc-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin"/>
                    <p className="text-lg font-semibold text-zinc-700">Loading...</p>
                    <p className="text-sm text-zinc-500">We&apos;re preparing your PDF.</p>
                </div>
            </div>
        )
    }

    if (data && (data.status === "PROCESSING")) {
        return (
            <div className="w-full h-full flex flex-col justify-center items-center bg-zinc-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin"/>
                    <p className="text-lg font-semibold text-zinc-700">Processing PDF...</p>
                    <p className="text-sm text-zinc-500">This won&apos;t take long.</p>
                </div>
            </div>
        )
    }

    if (data && (data.status === "FAILURE")) {
        return (
            <div className="w-full h-full flex flex-col justify-center items-center bg-zinc-50">
                <div className="flex flex-col items-center gap-2">
                    <XCircle className="w-6 h-6 text-red-500"/>
                    <p className="text-lg font-semibold text-zinc-700">Too many pages in PDF</p>
                    <p className="text-sm text-zinc-500">
                        Your <span className="font-medium">Free</span> plan supports up to 5 pages per PDF
                    </p>
                    <Link className={
                        buttonVariants({
                            variant: "secondary",
                            className: "mt-4"
                        })
                    } href="/dashboard"><ChevronLeft className="w-3 h-3 mr-1.5" />Back</Link>
                </div>
            </div>
        )
    }

    return (
      <ChatContextProvider fileId={fileId}>
        <div className="relative min-h-full bg-zinc-50 divide-y divide-zinc-200 flex flex-col justify-between gap-2">
          <div className="flex-1 justify-between flex flex-col">
            <Messages fileId={fileId} />
          </div>
          <ChatInput />
        </div>
      </ChatContextProvider>
    );
}

export default ChatWrapper;