import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { UploadStatus } from "@prisma/client";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { insertChunkInVectorStore } from "@/lib/upstash";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();
      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const newFile = await db.file.create({
        data: {
          key: file.key,
          url: file.url,
          uploadStatus: UploadStatus.PROCESSING,
          name: file.name,
          userId: metadata.userId,
        },
      });
      try {
        const response = await fetch(newFile.url);
        const blob = await response.blob();
        const pdfLoader = new PDFLoader(blob);
        const pageLevelDocs = await pdfLoader.load(); // Each document contains the page content
        const pagesAmount = pageLevelDocs.length; // Count of pdf pages
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 10,
        });
        const splittedDocs = await splitter.splitDocuments(pageLevelDocs);
        console.log("Successfully splitted documents");
        const promises = splittedDocs.map(async (doc) => {
          console.log("--Chunk--");
          console.log(doc.pageContent)
          await insertChunkInVectorStore(doc.pageContent, {
            fileId: newFile.id,
            userId: metadata.userId,
          });
        });
        try {
          console.log("Fetching all");
          await Promise.all(promises);
          console.log("Added chunks successfully in vector store!");
          await db.file.update({
            where: {
              id: newFile.id,
              userId: metadata.userId,
            },
            data: {
              uploadStatus: "SUCCESS",
            },
          });
        } catch (error) {
            console.log("Error")
            console.log(error)
          await db.file.update({
            where: {
              id: newFile.id,
              userId: metadata.userId,
            },
            data: {
              uploadStatus: "FAILURE",
            },
          });
        }
      } catch (exception) {}
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
