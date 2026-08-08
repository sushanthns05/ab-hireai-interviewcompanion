import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Plus, MessageSquare, Paperclip, ArrowUp, Menu, X } from "lucide-react";

export const Route = createFileRoute("/chat")({
  component: ChatApp,
});

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

const MOCK_HISTORY = [
  { id: "1", title: "React Context Optimization" },
  { id: "2", title: "Understanding WebGL" },
  { id: "3", title: "Supabase vs Firebase" },
];

function ChatApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "msg-1", role: "ai", content: "Systems online. How can I assist you today?" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    
    // Mock AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "ai", content: "Processing request... This is a simulated response in Antigravity Chat." }
      ]);
    }, 800);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      {/* Sidebar Overlay (Mobile) */}
      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-50 rounded-md p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground md:hidden"
        >
          <Menu className="size-6" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } glass fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border transition-transform duration-300 md:relative md:translate-x-0 ${!sidebarOpen ? 'md:hidden' : ''}`}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-bold tracking-wider text-primary">HISTORY</h2>
          <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground md:hidden">
            <X className="size-5" />
          </button>
        </div>

        <div className="px-4 pb-4">
          <button className="group flex w-full items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition-all hover:border-primary/50 hover:bg-primary/10 hover:shadow-(--shadow-glow)">
            <Plus className="size-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {MOCK_HISTORY.map((chat) => (
            <button
              key={chat.id}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <MessageSquare className="size-4 opacity-50" />
              <span className="truncate">{chat.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="glass flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-6">
          <div className="flex items-center gap-4">
            {sidebarOpen ? (
               <button onClick={() => setSidebarOpen(false)} className="hidden text-muted-foreground hover:text-foreground md:block">
                 <Menu className="size-5" />
               </button>
            ) : (
               <button onClick={() => setSidebarOpen(true)} className="hidden text-muted-foreground hover:text-foreground md:block">
                 <Menu className="size-5" />
               </button>
            )}
            <h1 className="text-xl font-bold tracking-wide">
              <span className="text-gradient">ANTIGRAVITY</span> CHAT
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex size-2.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.79_0.18_184.11)]"></span>
            </span>
            <span className="hidden sm:inline-block">AI ONLINE</span>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-4 pb-36 pt-6 sm:px-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-lg sm:max-w-[75%] ${
                    msg.role === "user"
                      ? "bg-slate-800 text-slate-100"
                      : "glass border border-white/10 text-slate-200"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent pb-6 pt-12">
          <div className="mx-auto w-full max-w-3xl px-4">
            <div className="glass relative flex w-full items-end gap-2 rounded-[2rem] border border-white/10 p-2 shadow-2xl transition-shadow focus-within:border-primary/50 focus-within:shadow-(--shadow-glow)">
              <button className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-primary">
                <Paperclip className="size-5" />
              </button>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message Antigravity..."
                className="max-h-32 min-h-[2.5rem] w-full resize-none bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                rows={1}
              />
              
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  input.trim() 
                    ? "bg-primary text-primary-foreground shadow-(--shadow-glow) hover:scale-105" 
                    : "bg-white/5 text-muted-foreground cursor-not-allowed"
                }`}
              >
                <ArrowUp className="size-5" />
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Antigravity AI can make mistakes. Consider verifying important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
