import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <MaxWidthWrapper className="mt-28 lg:mt-36">
        <div className="flex flex-col items-center text-center">
          <div className="px-7 py-2 border border-gray-200 rounded-full transition-all backdrop-blur bg-white shadow-md hover:border-gray-300 hover:bg-white/50">
            <p className="text-sm font-semibold text-gray-700">
              ChatPDF is now public!
            </p>
          </div>
          <h1 className="mt-4 text-5xl md:text-6xl max-w-4xl lg:text-7xl font-bold tracking-tight">
            Chat with your <span className="text-purple-600">documents</span> in
            seconds.
          </h1>
          <p className="mt-5 sm:text-lg text-zinc-500 max-w-prose">
            ChatPDF allows you to have conversations with any PDF document. Simply
            upload your file and start asking questions right away.
          </p>
          <Link
            href="/dashboard"
            className={buttonVariants({
              size: "lg",
              className: "mt-5",
            })}
            target="_blank"
          >
            Get Started <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>

        <div className="mt-20 px-6 lg:px-8">
          <Image
            src="/dashboard-preview.jpg"
            alt="Product preview"
            width={1364}
            height={866}
            className="rounded-md bg-white ring-1 ring-gray-900/10"
          />
        </div>
      </MaxWidthWrapper>

      <div className="mx-auto max-w-5xl mt-40 mb-20">
        <div className="flex flex-col md:items-center md:text-center p-6 md:p-0">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Start Chatting in minutes
          </h1>
          <p className="text-md text-gray-600 max-w-prose mt-4">
            Chatting to your PDF files has never been easier than with ChatPDF.
          </p>
        </div>
        <ol className="flex flex-col md:flex-row gap-4 my-8 pt-8 md:gap-10 md:px-4">
          <li className="flex-1">
            <div className="flex flex-col gap-2 border-gray-300 border-l-4 pl-4 md:pl-0 md:pt-4 md:border-l-0 md:border-t-2 ">
              <span className="text-sm text-purple-600 font-medium">
                Step 1
              </span>
              <span className="text-xl font-semibold">
                Sign up for an account
              </span>
              <span className="text-zinc-500">
                Either starting out with a free plan or choose our pro plan.
              </span>
            </div>
          </li>
          <li className="flex-1">
            <div className="flex flex-col gap-2 border-gray-300 border-l-4 pl-4 md:pl-0 md:pt-4 md:border-l-0 md:border-t-2 ">
              <span className="text-sm text-purple-600 font-medium">
                Step 2
              </span>
              <span className="text-xl font-semibold">
                Upload your PDF file
              </span>
              <span className="text-zinc-500">
                We&apos;ll process your file and make it ready for you to chat
                with.
              </span>
            </div>
          </li>
          <li className="flex-1">
            <div className="flex flex-col gap-2 border-gray-300 border-l-4 pl-4 md:pl-0 md:pt-4 md:border-l-0 md:border-t-2 ">
              <span className="text-sm text-purple-600 font-medium">
                Step 3
              </span>
              <span className="text-xl font-semibold">
                Start asking questions
              </span>
              <span className="text-zinc-500">
                It&apos;s that simple. Try out ChatPDF today - it really takes
                less than a minute.
              </span>
            </div>
          </li>
        </ol>

        <div className="mt-20 px-6 lg:px-8">
          <Image
            src="/file-upload-preview.jpg"
            alt="File upload preview"
            width={1419}
            height={732}
            className="rounded-md bg-white ring-1 ring-gray-900/10"
          />
        </div>
      </div>
    </>
  );
}
