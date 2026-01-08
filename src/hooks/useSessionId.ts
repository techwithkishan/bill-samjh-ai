import { useState } from 'react';

const SESSION_KEY = 'billsamajh_session_id';

// Get session ID synchronously for immediate use
export const getSessionId = (): string => {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

export const useSessionId = () => {
  // Initialize with value immediately to avoid race conditions
  const [sessionId] = useState<string>(() => getSessionId());
  return sessionId;
};
