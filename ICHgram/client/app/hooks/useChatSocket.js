import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "@/lib/socket";

export function useChatSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = connectSocket();

    const handleNewMessage = (message) => {
      const partnerId = message.isMine ? message.recipientId : message.senderId;

      queryClient.setQueryData(["thread", partnerId], (thread) =>
        thread && !thread.some((item) => item.id === message.id)
          ? [...thread, message]
          : thread,
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    socket.on("message:new", handleNewMessage);
    return () => {
      socket.off("message:new", handleNewMessage);
      disconnectSocket();
    };
  }, [queryClient]);
}
