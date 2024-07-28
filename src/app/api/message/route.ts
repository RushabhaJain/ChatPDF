import { db } from "@/db";
import { fetchRelevantData } from "@/lib/upstash";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

import { streamText } from "ai";
import { mistral } from "@/lib/mistralai";

export const POST = async (req: NextRequest) => {
    // Endpoint for asking a question to PDF File
    const body = await req.json()
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user || !user.id) return new Response("Unauthorized", { status: 401 });

    const { fileId, message } = SendMessageValidator.parse(body);

    const file = await db.file.findFirst({
        where: {
            userId: user.id,
            id: fileId
        }
    });

    if (!file) return new Response("Not Found", { status: 404 });

    await db.message.create({
        data: {
            userId: user.id,
            fileId: fileId,
            isUserMessage: true,
            text: message
        }
    });

    const prevMessages = await db.message.findMany({
        where: {
            fileId
        },
        orderBy: {
            createdAt: "desc"
        },
        take: 6
    });

    const formattedPrevMessages = prevMessages.map((message) => ({
        role: message.isUserMessage ? "user" as const : "assistant" as const,
        content: message.text
    }));

    const relevantContexts = await fetchRelevantData(fileId, message);

    const response = await streamText({
        model: mistral("open-mistral-7b"),
        messages: [
            {
              role: 'system',
              content:
                'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. Provide the answer in maximum 3 to 4 sentences in simple english language',
            },
            {
              role: 'user',
              content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
              
        \n----------------\n
        
        PREVIOUS CONVERSATION:
        ${formattedPrevMessages.map((message) => {
          if (message.role === 'user')
            return `User: ${message.content}\n`
          return `Assistant: ${message.content}\n`
        })}
        
        \n----------------\n
        
        CONTEXT:
        ${relevantContexts.map((context) => context.data).join('\n\n')}
        
        USER INPUT: ${message}`,
            },
        ],
        temperature: 0.5,
        onFinish: (async ({ text }) => {
            await db.message.create({
                data: {
                    text,
                    isUserMessage: false,
                    userId: user.id,
                    fileId: fileId
                }
            })
        })
    });

    return response.toTextStreamResponse();
}