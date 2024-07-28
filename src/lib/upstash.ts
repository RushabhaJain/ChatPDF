import { Index } from "@upstash/vector"
import { v4 } from "uuid"

const index = new Index({
  url: "https://allowed-elf-39040-us1-vector.upstash.io",
  token: "ABUFMGFsbG93ZWQtZWxmLTM5MDQwLXVzMWFkbWluWldNMk5tSXhPVGt0WlRRME1pMDBNV1psTFdFd01qZ3RaVFkwTUdZeVpUSmlaR1Ez",
})

export const insertChunkInVectorStore = async (chunk: string, metadata: Record<string, string>) => {
    await index.upsert({
        id: v4(),
        data: chunk,
        metadata
    })
}

export const fetchRelevantData = async (fileId: string, data: string) => {
    return await index.query({
        data,
        filter: `fileId='${fileId}'`,
        topK: 3,
        includeMetadata: true,
        includeData: true
    })
}