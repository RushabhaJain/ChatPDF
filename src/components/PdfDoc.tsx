"use client";

import { ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import { useResizeDetector } from "react-resize-detector";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import PdfFullScreen from './PdfFullScreen';
import SimpleBar from 'simplebar-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
       import.meta.url,
     ).toString();

interface PdfDocProps {
    url: string
}

const PdfDoc = ({ url }: PdfDocProps) => {
    const [numPages, setNumPages] = useState<number>();
    const [currPage, setCurrPage] = useState<number>(1);
    const [currScale, setCurrScale] = useState<number>(1);

    const { width, ref } = useResizeDetector();
    return (<div className="w-full h-full flex flex-col shadow bg-white">
        <div className="flex gap-1.5 items-center h-14 w-full border-b border-zinc-200 px-2">
            <Button variant="ghost" size="sm" 
                onClick={() => {
                    setCurrPage((prevPage) => prevPage - 1 > 1 ? prevPage - 1 : 1)
                }}
                disabled={currPage === 1}>
                <ChevronDown className="w-4 h-4"/>
            </Button>
            <Button variant="ghost" size="sm" 
                onClick={() => {
                    setCurrPage((prevPage) => prevPage + 1 > numPages! ? numPages! : prevPage + 1)
                }}
                disabled={numPages === undefined || currPage === numPages}>
                <ChevronUp className="w-4 h-4"/>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className='gap-1.5'>
                        <Search className="h-4 w-4" />
                        {currScale * 100}%
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setCurrScale(1)}>
                        100%
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setCurrScale(1.25)}>
                        125%
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setCurrScale(1.5)}>
                        150%
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setCurrScale(2)}>
                        200%
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setCurrScale(2.5)}>
                        250%
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <PdfFullScreen url={url} />
        </div>
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
            <div className="min-h-screen w-full" ref={ref}>
                <Document 
                    loading={
                        <div className="flex gap-2 items-center justify-center">
                            <Loader2 className="animate-spin w-6 h-6 mt-24" />
                            <p className="text-sm text-gray-300">Loading...</p>
                        </div>
                    }
                    className="w-full" file={url} onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    onError={(error) => {
                        console.log('On Error')
                        console.log(error)
                    }}
                >
                    <Page pageNumber={currPage} className="w-full" width={width ?? 1} scale={currScale} />
                </Document>
            </div>
        </SimpleBar>
    </div>)
}

export default PdfDoc;