export default function TypingIndicator({ name }) {
  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
      <span>{name} is typing...</span>
    </div>
  );
}
