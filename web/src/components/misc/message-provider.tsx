"use client";

// components/MessageContext.tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils"; // Optional helper to merge classes
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";

const MESSAGE_DURATION = 5;

type MessageType = "success" | "error";

interface MessageData {
  id: number;
  type: MessageType;
  content: string;
}

interface MessageContextType {
  showMessage: (type: MessageType, content: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<MessageData[]>([]);

  const showMessage = useCallback(
    (type: MessageType, content: string, duration?: number) => {
      const id = Date.now();
      const newMessage = { id, type, content };

      setMessages((prev) => [...prev, newMessage]);

      setTimeout(
        () => {
          setMessages((prev) => prev.filter((m) => m.id !== id));
        },
        duration ? duration * 1000 : MESSAGE_DURATION * 1000,
      );
    },
    [],
  );

  const removeMessage = (id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  useEffect(() => {
    setMessageHandler({
      success: (content, duration) => showMessage("success", content, duration),
      error: (content, duration) => showMessage("error", content, duration),
    });
  }, [showMessage]);

  return (
    <MessageContext.Provider value={{ showMessage }}>
      <div className="fixed top-4 right-4 z-[1000000] flex w-[300px] flex-col gap-2">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Alert
                variant={message.type === "error" ? "destructive" : "default"}
                className={cn(
                  "relative flex h-auto items-start pr-8",
                  message.type === "success" && "border-green-500",
                )}
              >
                {message.type === "error" ? (
                  <AlertCircle className="mt-1 h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle2 className="mt-1 h-4 w-4 text-green-500" />
                )}
                <div className="ml-2">
                  <AlertTitle>
                    {message.type === "error" ? "Error" : "Success"}
                  </AlertTitle>
                  <AlertDescription>{message.content}</AlertDescription>
                </div>
                <Button
                  variant="ghost"
                  className="hover:bg-muted absolute top-2 right-2 size-6 rounded !p-1"
                  onClick={() => removeMessage(message.id)}
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context)
    throw new Error("useMessage must be used within a MessageProvider");
  return context;
};

// lib/message.ts
type MessageHandler = (content: string) => void;

let initialized = false;

export const message: {
  success: (content: string, duration?: number) => void;
  error: (content: string, duration?: number) => void;
} = {
  success: () => {
    if (!initialized) throw new Error("Message provider not initialized.");
  },
  error: () => {
    if (!initialized) throw new Error("Message provider not initialized.");
  },
};

export const setMessageHandler = (handlers: typeof message) => {
  message.success = handlers.success;
  message.error = handlers.error;
  initialized = true;
};
