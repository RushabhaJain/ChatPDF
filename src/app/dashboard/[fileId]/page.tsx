import PdfDoc from "@/components/PdfDoc";
import ChatWrapper from "@/components/chat/ChatWrapper";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

interface PageProps {
    params: {
        fileId: string
    }
}

const Page = async ({ params }: PageProps) => {
    const { fileId } = params;
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user || !user.id) {
        redirect(`/auth/callback?origin=dashboard/${fileId}`)
    }
    const file = await db.file.findFirst({
        where: {
            id: fileId,
            userId: user.id
        }
    });

    if (!file) return notFound();

    console.log("File:", file)

    return (
        <div className="w-full max-w-8xl mx-auto h-[calc(100vh-3.5rem)] lg:flex">
            <div className="flex-1 px-4 py-6 lg:pl-8">
                <PdfDoc url={file.url} />
            </div>
            <div className="flex-[0.75] lg:border-l border-gray-200 lg:w-96 border-t lg:border-t-0">
                <ChatWrapper fileId={file.id} />
            </div>
        </div>
    );
}

export default Page;