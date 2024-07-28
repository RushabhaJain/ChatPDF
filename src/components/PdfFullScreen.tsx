"use client";

import { useResizeDetector } from "react-resize-detector";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import { Expand } from "lucide-react";
import { Document, Page } from "react-pdf";
import SimpleBar from "simplebar-react";

interface PdfFullScreenProps {
    url: string
}

const PdfFullScreen = ({ url }: PdfFullScreenProps) => {
    const { width, ref } = useResizeDetector();
    const [numPages, setNumPages] = useState<number>()
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost">
                    <Expand className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl w-full">
                <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
                    <div ref={ref}>
                        <Document file={url} onLoadSuccess={({ numPages }) =>
                            setNumPages(numPages)
                        }>
                        {
                            new Array(numPages).fill(0).map((_, i) => {
                                return <Page pageNumber={i+1} key={i+1} className="w-full" width={width ?? 1}/>
                            })
                        }
                        </Document>
                    </div>
                </SimpleBar>
            </DialogContent>
        </Dialog>
    )
}

export default PdfFullScreen;