import { ChangeEvent, ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

type StreamResponse = {
    addMessage: () => void,
    message: string,
    handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
    isLoading: boolean
}

export const ChatContext = createContext<StreamResponse> ({
    addMessage: () => {},
    message: '',
    handleInputChange: () => {},
    isLoading: false
});

interface Props {
    fileId: string,
    children: ReactNode
}

export const ChatContextProvider = ({ fileId, children } : Props) => {
    const utils = trpc.useUtils();
    const backupMessage = useRef('');
    const [message, setMessage] = useState<string>('');

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { toast } = useToast();

    const { mutate: sendMessage } = useMutation({
        mutationFn: async ({ message }: { message: string }) => {
            const response = await fetch("/api/message", {
                method: 'POST',
                body: JSON.stringify({
                    fileId,
                    message
                })
            });
            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            return response.body;
        },
        async onMutate({ message }: { message: string }) {
            backupMessage.current = message;
            setMessage('');

            await utils.getfileMessages.cancel();
            const prevMessages = utils.getfileMessages.getInfiniteData();
            utils.getfileMessages.setInfiniteData({
                fileId,
                limit: INFINITE_QUERY_LIMIT
            }, (old) => {
                if (!old) return {
                    pages: [],
                    pageParams: []
                }

                let newPages = [...old.pages]
                let latestPage = newPages[0]!
                latestPage.messages = [
                    {
                        createdAt: new Date().toISOString(),
                        id: crypto.randomUUID(),
                        text: message,
                        isUserMessage: true
                    },
                    ...latestPage.messages
                ]

                newPages[0] = latestPage;
                return {
                    ...old,
                    pages: newPages
                }
            });

            setIsLoading(true);
            return {
                previousMessages: prevMessages?.pages.flatMap((page) => page.messages) ?? []
            }
        },
        async onError(_, __, context) {
            setMessage(backupMessage.current);
            utils.getfileMessages.setData({
                fileId
            },
        {
            messages: context?.previousMessages ?? []
        })
        },
        async onSettled() {
            setIsLoading(false)
            await utils.getfileMessages.invalidate({ fileId })
        },
        async onSuccess(stream) {
            setIsLoading(false);
            if (!stream) {
                return toast({
                    title: "There was problem sending this message",
                    description: "Please refresh this page and try again!",
                    variant: "destructive"
                })
            }

            const reader: ReadableStreamDefaultReader<Uint8Array> = stream.getReader();
            const decoder = new TextDecoder();
            let done = false;

            // accumulated response
            let accResponse = ''
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value)
                accResponse += chunkValue;

                utils.getfileMessages.setInfiniteData({
                    fileId,
                    limit: INFINITE_QUERY_LIMIT
                }, (old) => {
                    if (!old) return {
                        pages: [],
                        pageParams: []
                    }

                    const isAiMessageExist = old.pages.some(
                        page => page.messages.some(message => message.id === "ai-response")
                    );
                    let newPages = [
                        ...old.pages
                    ];
                    if (!isAiMessageExist) {
                        newPages[0].messages = [
                            {
                                createdAt: new Date().toISOString(),
                                id: "ai-response",
                                text: "",
                                isUserMessage: false
                            },
                            ...newPages[0].messages
                        ]
                    } else {
                        newPages[0].messages = newPages[0].messages.map((message) => {
                            if (message.id === "ai-response") {
                                return {
                                    ...message,
                                    text: accResponse
                                }
                            }
                            return message;
                        });
                    }
                    return {
                        pages: newPages,
                        pageParams: old.pageParams
                    }
                })
            }
        }
    });

    const addMessage = () => {
        sendMessage({
            message
        })
    }

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value)
    }

    return (
        <ChatContext.Provider value={{
            addMessage,
            message,
            handleInputChange,
            isLoading
        }}>
            {children}
        </ChatContext.Provider>
    )
}
