"use client";

import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import Dropzone from "react-dropzone";
import { Cloud, File, Loader2 } from "lucide-react";
import { useState } from "react";
import { Progress } from "./ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";

const UploadDropzone = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { startUpload } = useUploadThing("pdfUploader");
  const startSimulatedProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((progress) => {
        if (progress >= 95) {
          clearInterval(interval);
          return progress;
        }
        return progress + 5;
      });
    }, 500);
    return interval;
  };

  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
        router.push(`/dashboard/${file.id}`)
    },
    retry: true,
    retryDelay: 500
  })

  return (
    <Dropzone
      multiple={false}
      onDrop={async (acceptedFiles) => {
        setIsUploading(true);
        const progressInterval = startSimulatedProgress();
        const res = await startUpload(acceptedFiles);
        if (!res) {
            return toast({
                title: "Something went wrong",
                description: "Please try again later",
                variant: "destructive"
            })
        }
        const [fileResponse] = res;
        if (!fileResponse?.key) {
            return toast({
                title: "Something went wrong",
                description: "Please try again later",
                variant: "destructive"
            })
        }
        startPolling({
            key: fileResponse?.key
      })
        clearInterval(progressInterval);
        setUploadProgress(100);
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="pt-5 pb-6 flex items-center w-full h-full justify-center rounded-lg flex-col cursor-pointer bg-gray-50 hover:bg-gray-100 gap-2">
            <Cloud className="h-6 w-6 text-zinc-500" />
            <p className="text-sm text-zinc-700">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-zinc-500">PDF (up to 4MB)</p>
            {acceptedFiles && acceptedFiles[0] ? (
              <div className="flex items-center max-w-xs bg-white rounded-md outline outline-[1px] divide-x divide-zinc-200 outline-gray-200 overflow-hidden">
                <div className="px-3 py-2">
                  <File className="w-4 h-4 text-purple-500" />
                </div>
                <p
                  className="truncate text-zinc-500 text-sm px-3 py-2"
                  title={acceptedFiles[0].name}
                >
                  {acceptedFiles[0].name}
                </p>
              </div>
            ) : null}
            {isUploading ? (
              <div className="max-w-xs w-full mt-4 mx-auto">
                <Progress
                  value={uploadProgress}
                  indicatorColor={uploadProgress === 100 ? "bg-green-500" : ""}
                  className="h-1 w-full bg-zinc-200"
                />
              </div>
            ) : null}
            {uploadProgress === 100 && (
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-zinc-700 text-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting...
              </div>
            )}
            <input {...getInputProps()} />
          </div>
        </div>
      )}
    </Dropzone>
  );
};

const UploadButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>
      <DialogContent>
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
