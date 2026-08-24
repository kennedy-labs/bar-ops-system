"use client";

import { useEffect } from "react";

// Lightweight refresh-bus: any close/refresh event anywhere posts a message
// on the window. The owner reports page listens and re-fetches the summary.
const EVENT = "bar-ops:refresh-summary";

export const SummaryRefreshBus = {
  publishShiftClosed() {
    window.postMessage({ type: EVENT }, "*");
  },
  useRefreshOnShiftClose(refetch: () => void) {
    useEffect(() => {
      const onMessage = (e: MessageEvent) => {
        if (e.data?.type === EVENT) refetch();
      };
      window.addEventListener("message", onMessage);
      return () => window.removeEventListener("message", onMessage);
    }, [refetch]);
  },
};