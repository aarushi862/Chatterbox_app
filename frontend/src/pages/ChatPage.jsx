import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

export default function ChatPage() {
  const [activeRoom, setActiveRoom] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const handleSelectRoom = (room) => {
    setActiveRoom(room);
    setChatOpen(true);
    // Push a new history state so back button comes here first
    window.history.pushState({ chat: true }, '');
  };

  const handleBack = () => {
    setChatOpen(false);
    setActiveRoom(null);
  };

  useEffect(() => {
    const handlePopState = (e) => {
      // If chat is open and user presses back (swipe or button), close chat instead of leaving app
      if (chatOpen) {
        e.preventDefault();
        handleBack();
        // Push state again so next back press also stays in app
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [chatOpen]);

  return (
    <div className={`chat-layout${chatOpen ? ' chat-open' : ''}`}>
      <Sidebar activeRoom={activeRoom} onSelectRoom={handleSelectRoom} />
      <ChatWindow room={activeRoom} onBack={handleBack} />
    </div>
  );
}
