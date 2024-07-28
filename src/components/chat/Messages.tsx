import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { Loader2, MessageSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";
import { useContext, useEffect, useRef } from "react";
import { ChatContext } from "./ChatContext";
import { useIntersection } from "@mantine/hooks";

interface MessagesProps {
    fileId: string
}

const Messages = ({ fileId }: MessagesProps) => {
    const {isLoading: isAiResponding} = useContext(ChatContext);
    const { data, isLoading, fetchNextPage } = trpc.getfileMessages.useInfiniteQuery({
        fileId,
        limit: INFINITE_QUERY_LIMIT
    }, {
        getNextPageParam: (lastPage) => {
            return lastPage?.nextCursor;
        }
    });

    const lastMessageRef = useRef<HTMLDivElement>(null);

    const { ref, entry } = useIntersection({
        root: lastMessageRef.current,
        threshold: 1
    });

    useEffect(() => {
        if (entry?.isIntersecting) {
            fetchNextPage();
        }
    }, [entry, fetchNextPage])

    const messages = data?.pages.flatMap(
        (page) => page.messages ?? []
      )
    const loadingMessage = {
        createdAt: new Date().toISOString(),
        id: 'loading-message',
        isUserMessage: false,
        text: (
            <span className="flex h-full items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
            </span>
        )
    }
    const combinedMessages = [
        ...(isAiResponding ? [loadingMessage] : []),
        ...(messages ?? [])
    ];

    return (
        <div className="max-h-[calc(100vh-12rem)] flex gap-4 p-3 flex-col-reverse overflow-y-auto scrollbar-track-blue-lighter scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-w-2">
            {combinedMessages && combinedMessages.length > 0
            ? (
                combinedMessages.map((message, i) => {
                    const isNextMessageSamePerson = combinedMessages[i-1]?.isUserMessage === combinedMessages[i]?.isUserMessage;
                    if (i === (combinedMessages.length - 1)) {
                        return <Message ref={ref} key={message.id} message={message} isNextMessageSamePerson={isNextMessageSamePerson} />
                    } else {
                        return <Message key={message.id} message={message} isNextMessageSamePerson={isNextMessageSamePerson} />
                    }
                })
            )
            : isLoading
            ? <div className="w-full gap-2 flex flex-col">
                <Skeleton count={4} className="h-16"/>
            </div>
            : <div className="flex-1 flex flex-col justify-center items-center gap-2">
                <MessageSquare className="h-8 w-8 text-purple-500"/>
                <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
                <p className="text-sm text-zinc-500">
                    Ask your first question to get started.
                </p>
            </div>
        }
        </div>
    )
}

export default Messages;