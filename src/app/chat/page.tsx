"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, User, Languages, Sparkles, Square, Plus, History, Settings2, HelpCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./chat.module.css";

type Message = {
  role: "user" | "assistant";
  content: string;
  image?: string;
};

const INDIAN_LANGUAGES = [
  "English", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi"
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [language, setLanguage] = useState("English");
  const [chats, setChats] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chats");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    }
  };

  const loadChat = async (chatId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentChatId(data.id);
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to load chat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  const [attachment, setAttachment] = useState<{ name: string; data: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({
          name: file.name,
          data: reader.result as string,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachment) || isLoading) return;

    const currentInput = input;
    const currentAttachment = attachment;
    const userMessage: Message = { 
      role: "user", 
      content: currentInput,
      image: currentAttachment?.type.startsWith("image/") ? currentAttachment.data : undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachment(null);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let chatId = currentChatId;

    if (!chatId) {
      try {
        const title = currentInput.slice(0, 30) || (attachment ? `File: ${attachment.name}` : "New Chat");
        const res = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
          signal: controller.signal
        });
        const data = await res.json();
        if (res.ok) {
          chatId = data.id;
          setCurrentChatId(chatId);
          fetchChats();
        } else {
          setMessages((prev) => [...prev, { 
            role: "user", 
            content: currentInput 
          }, { 
            role: "assistant", 
            content: `Error: ${data.error || "Failed to start session. Please ensure you are logged in."}` 
          }]);
          setIsLoading(false);
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error("Chat creation error:", err);
        setIsLoading(false);
        return;
      }
    }

    try {
      const chatTimeoutId = setTimeout(() => controller.abort(), 30000);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          language,
          chatId,
          image: currentAttachment?.type.startsWith("image/") ? currentAttachment.data : null,
        }),
        signal: controller.signal
      });
      clearTimeout(chatTimeoutId);

      if (!res.ok) throw new Error("Failed to get response");

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        let assistantMessage = "";
        let isFirstChunk = true;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (isFirstChunk) {
            setIsLoading(false);
            setIsWriting(true);
            isFirstChunk = false;
          }
          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;
          
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = assistantMessage;
            return newMessages;
          });
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
      }
    } finally {
      setIsLoading(false);
      setIsWriting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Enhanced Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <Bot size={24} color="var(--saffron)" />
            <span>DEMOCRATEACH</span>
          </div>
          <button onClick={createNewChat} className={styles.newChatBtn}>
            <Plus size={18} />
            <span>New Session</span>
          </button>
        </div>

        <div className={styles.chatList}>
          <div className={styles.listLabel}><History size={14} /> RECENT SESSIONS</div>
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`${styles.chatItem} ${currentChatId === chat.id ? styles.activeChatItem : ""}`}
              onClick={() => loadChat(chat.id)}
            >
              <Bot size={14} />
              <span>{chat.title}</span>
            </div>
          ))}
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.configCard}>
            <div className={styles.configHeader}>
              <Languages size={18} />
              <span>Linguistic Context</span>
            </div>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={styles.langSelect}>
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div className={styles.footerLinks}>
            <button><Settings2 size={18} /></button>
            <button><HelpCircle size={18} /></button>
          </div>
        </div>
      </div>

      {/* Cinematic Chat Area */}
      <div className={styles.chatArea}>
        {messages.length === 0 ? (
          <div className={`${styles.welcomeState} animate-fade-in`}>
            <div className={styles.welcomeHero}>
              <Bot size={80} className={`${styles.welcomeIcon} animate-float`} />
              <div className={styles.welcomeText}>
                <h1 className="text-gradient-patriotic animate-slide-up">Jai Hind!</h1>
                <p className="animate-fade-in delay-200">How can I assist your democratic journey today?</p>
              </div>
            </div>
            <div className={`${styles.suggestionGrid} animate-fade-in delay-300`}>
              {[
                "Who are the top candidates in my area?",
                "Explain my voting rights as a student.",
                "How do I report a local election anomaly?",
                "What is the history of the 2024 elections?"
              ].map((q, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => document.getElementById("chat-form")?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 10);
                  }} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${(idx + 4) * 100}ms` }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.messageList}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.messageWrapper} ${styles[m.role]}`}>
                <div className={styles.messageContent}>
                  <div className={styles.avatar}>
                    {m.role === "assistant" ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className={styles.messageBubble}>
                    {m.image && (
                      <Image 
                        src={m.image} 
                        alt="User upload" 
                        className={styles.messageImage} 
                        width={300} 
                        height={200} 
                        unoptimized 
                      />
                    )}
                    <div className={styles.markdownBody}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.messageWrapper} ${styles.assistant}`}>
                <div className={styles.messageContent}>
                  <div className={styles.avatar}><Bot size={20} /></div>
                  <div className={`${styles.messageBubble} ${styles.typing}`}>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* High-End Input Section */}
        <form id="chat-form" onSubmit={handleSubmit} className={styles.inputArea}>
          <div className={styles.inputContainer}>
            {attachment && (
              <div className={`${styles.attachmentPreview} animate-fade-in`}>
                <Image 
                  src={attachment.data} 
                  alt="Upload" 
                  width={60} 
                  height={60} 
                  unoptimized 
                />
                <button type="button" onClick={() => setAttachment(null)}>×</button>
              </div>
            )}
            <div className={styles.inputWrapper}>
              <button 
                type="button" 
                className={styles.attachBtn} 
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
                accept="image/*"
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the election agent..."
                autoComplete="off"
              />
              {isLoading || isWriting ? (
                <button type="button" onClick={handleStop} className={styles.stopBtn}>
                  <Square size={18} fill="currentColor" />
                </button>
              ) : (
                <button type="submit" className={styles.sendBtn} disabled={!input.trim() && !attachment}>
                  <Send size={18} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
