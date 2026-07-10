import { useCallback, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch } from "@/store/hook"; // Ensure this matches your filename "hook.ts" or "hooks.ts"
import { apiSlice } from "@/service/api";
import { toast } from "sonner";

const SOCKET_BACKEND_URL = "http://localhost:3030";

export const useRealtimeVotes = (electionId?: string) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // We allow the socket to connect even if electionId hasn't loaded yet
    const socket: Socket = io(SOCKET_BACKEND_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => { 
      console.log(`⚡ Connected to socket. ID: ${socket.id}`);
      if (electionId) {
        socket.emit("joinElection", electionId);
        console.log(`client joined election room ${electionId}`)
      }
    });

    // 1. Room-Specific Listener
    socket.on("voteUpdate", (data) => {
      console.log("Room Vote Update Received:", data);
    });

    // 2. Global Listener (Using this to update the UI since it works perfectly!)
    socket.on("globalVoteUpdate", (data: { electionId: string; contestantId: string; votes: number, totalVotes: number }) => {
      console.log("Global Vote Update Received from Stream:", data);

      // Mutate the active RTK Query cache database entry on the fly
      dispatch(
        apiSlice.util.updateQueryData(
          "getContestant" as any, 
          undefined, 
          (draft: any) => {
            // Your loop reads 'contestant?.contestants', so we check draft.contestants
            if (data.totalVotes !== undefined) {
            draft.totalVotes = data.totalVotes; 
          }
            if (draft && draft.contestants) {
              const contestant = draft.contestants.find(
                (c: any) => c._id === data.contestantId
              );
              
              if (contestant) {
                contestant.votes = data.votes; // Updates the UI state immediately
              }
            }
          }
        )
      );

      // Display the Toast Notification Popup
      toast.success("New Vote Verified!", {
        description: `Contestant vote count updated to ${data.votes.toLocaleString()}.`,
        duration: 4000,
      });
    });

    return () => {
      socket.off("connect");
      socket.off("voteUpdate");
      socket.off("globalVoteUpdate");
      socket.disconnect();
    };
  }, [electionId, dispatch]);
};

interface IncomingMessage {
  text: string;
  sender: string;
  timestamp: string;
}

// src/hook/useChatRealtime.ts
export const useChatRealtime = (roomName: string, onMessageReceived: (msg: IncomingMessage) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomName) return;

    const socket: Socket = io(SOCKET_BACKEND_URL, {
      transports: ["websocket"],
    });
    
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`💬 Chat socket connected: ${socket.id}`);
      socket.emit("joinElection", roomName); 
    });

    socket.on("receiveMessage", (message: IncomingMessage) => {
      onMessageReceived(message); 
    });

    return () => {
      socket.off("connect");
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, [roomName, onMessageReceived]);

  // 👑 FIXED: Return a reliable trigger function instead of a raw null/socket object
  const emitMessage = useCallback((text: string, sender: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("sendMessage", {
        room: roomName,
        text: text,
        sender: sender
      });
      console.log("✈️ Successfully emitted to tunnel:", text);
    } else {
      console.warn("⚠️ Cannot send: Socket is not fully connected yet.");
    }
  }, [roomName]);

  return { emitMessage };
};