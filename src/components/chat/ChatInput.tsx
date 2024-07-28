import { Loader2, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useContext, useRef } from "react";
import { ChatContext } from "./ChatContext";

const ChatInput = () => {
    const { message, addMessage, handleInputChange, isLoading } = useContext(ChatContext);
    const ref = useRef<HTMLTextAreaElement>(null);
    return <div className="relative w-full p-4 pb-10">
        <div className="relative">
        <Textarea 
            rows={1} 
            maxRows={4} 
            placeholder="Enter your question..." 
            value={message}
            ref={ref}
            onChange={handleInputChange}
            onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();

                    addMessage();

                    ref.current?.focus();
                }
            }}
            autoFocus 
            className="resize-none scrollbar-w-2 px-2 py-3 pr-12 scrollbar-track-blue-lighter scrollbar-thumb-blue scrollbar-thumb-rounded"
        />
        <Button size="sm"
            disabled={isLoading}
            className="absolute bottom-[5px] right-[5px]" onClick={() => {
                addMessage();
                ref.current?.focus();
            }}>
            {isLoading ?
            <Loader2 className="h-4 w-4 animate-spin"/>
            : <Send className="h-4 w-4" aria-label="Send Message"/> }
        </Button>
        </div>
       
    </div>
}

export default ChatInput;