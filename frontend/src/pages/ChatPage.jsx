import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

export default function ChatPage() {
  const [activeRoom, setActiveRoom] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const handleSelectRoom = (room) => {
    setActiveRoom(room);
    setChatOpen(true);
  };

  const handleBack = () => {
    setChatOpen(false);
    setActiveRoom(null);
  };

  return (
    <div className={`chat-layout${chatOpen ? ' chat-open' : ''}`}>
      <Sidebar activeRoom={activeRoom} onSelectRoom={handleSelectRoom} />
      <ChatWindow room={activeRoom} onBack={handleBack} />
    </div>
  );
}
