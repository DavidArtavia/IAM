import { useEffect, useRef, useState } from "react";



interface Props {
  disabled: boolean;
  onSendText: (msg: string) => void;
  onSendAudio: (blob: Blob) => void;
}

export const ChatInputBar = ({ disabled, onSendText, onSendAudio }: Props) => {
  const [text, setText] = useState("");
  const [recording, setRec] = useState(false);
  const [recorder, setRecObj] = useState<MediaRecorder>();
  const [chunks, setChunks] = useState<Blob[]>([]);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const sendText = () => {
    if (!text.trim()) return;
    onSendText(text.trim());
    setText("");
    ref.current?.focus();
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const m = new MediaRecorder(stream);
    m.ondataavailable = (e) => setChunks((c) => [...c, e.data]);
    m.onstop = () => {
      const blob = new Blob(chunks, { type: chunks[0].type });
      onSendAudio(blob);
      setChunks([]);
    };
    m.start();
    setRecObj(m);
    setRec(true);
  };

  const stopRecording = () => {
    recorder?.stop();
    setRec(false);
  };

  return (
    <div style={{ display: "flex", padding: 8, background: "#fff", gap: 8 }}>
      <input 
      onChange={(e) => setText(e.target.value)} 
      type="text" 
      id="kt_chat_messenger_footer" 
      className="form-control" 
      placeholder={disabled ? "Selecciona un chat o cree uno nuevo" : "Escribe un mensaje..."}
      disabled={disabled}
      onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendText();
      }
    }}
        />

      <button
        data-bs-toggle="tooltip"
        className="btn btn-icon btn-primary me-2 mb-2"
        disabled={disabled}
        onClick={text.trim() ? sendText : undefined}
        onMouseDown={!text.trim() ? startRecording : undefined}
        onMouseUp={!text.trim() ? stopRecording : undefined}
        onMouseLeave={!text.trim() && recording ? stopRecording : undefined}

      >
        {text.trim() ? 
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
          <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
        </svg> : 
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-mic" viewBox="0 0 16 16">
          <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5" />
          <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3" />
        </svg>}
      </button>

    </div>
  );
};


