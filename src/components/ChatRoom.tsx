import React, { useState, useRef } from "react";
import { Send, User, MessageCircle, Hash } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useChatRealtime } from "@/hook/useRealtimeVote";

interface MockMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}
   
const ChatSystem = ({roomName = "default-room"}) => {
const [messages, setMessages] = useState<MockMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Destructure our bulletproof emit tool out of the hook setup
  const { emitMessage } = useChatRealtime(roomName, (incomingMsg) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: incomingMsg.sender,
        text: incomingMsg.text,
        timestamp: incomingMsg.timestamp,
        isMe: false,
      },
    ]);
  });

  const handleLocalSubmit = (e: React.FormEvent) => {
    // 2. CRITICAL: Stop the browser from hijacking the form and reloading
    e.preventDefault(); 
    if (!messageText.trim()) return;

    // Add to your own UI view instantly
    const newMsg: MockMessage = {
      id: Date.now().toString(),
      sender: "You",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages((prev) => [...prev, newMsg]);

    // 3. 👑 Fire your hook's message function!
    emitMessage(messageText, "Anonymous Voter");
    
    setMessageText("");
  };

  return (
    <Card className="w-full max-w-md h-[600px] border-zinc-100 bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col p-0">
      
      {/* 🟢 CHAT HEADER CHANNEL BAR */}
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-zinc-400" />
              <h3 className="text-sm font-bold text-zinc-800 leading-none">Community-Builder-Discussion</h3>
            </div>
            <p className="text-[11px] font-medium text-zinc-400 mt-1">Live Election Discussion Channel</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold text-[11px] px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live Chat
        </div>
      </div>

      {/* 📥 SCROLLABLE MESSAGES VIEWPORT CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.isMe ? "ml-auto items-end" : "mr-auto items-start"}`}>
            
            {/* Sender Label Signature Tag */}
            {!msg.isMe && (
              <span className="text-[11px] font-bold text-zinc-400 mb-1 ml-1 flex items-center gap-1">
                <User className="w-3 h-3" /> {msg.sender}
              </span>
            )}
            
            {/* Message Bubble Card Shape */}
            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium shadow-sm transition-all ${
              msg.isMe 
                ? "bg-indigo-600 text-white rounded-tr-sm" 
                : "bg-white border border-zinc-100 text-zinc-700 rounded-tl-sm"
            }`}>
              <p>{msg.text}</p>
            </div>
            
            {/* Timestamp Badge */}
            <span className="text-[10px] font-medium text-zinc-300 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 📤 LOWER CHAT FOOTER FORM DISPATCH BAR */}
      <form onSubmit={handleLocalSubmit} className="p-4 border-t border-zinc-100 bg-white flex gap-2 items-center">
        <input
          type="text"
          placeholder="Message #community-builder..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="flex-1 border-2 border-zinc-100 bg-zinc-50/50 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 placeholder-zinc-400 outline-none focus:border-indigo-300 focus:bg-white transition-all"
        />
        <Button 
          type="submit" 
          disabled={!messageText.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl h-11 w-11 flex items-center justify-center transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

    </Card>
  );
};

export default ChatSystem;