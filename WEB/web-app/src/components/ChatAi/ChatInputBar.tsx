import { useEffect, useRef, useState } from "react";
import { Input, Button } from "antd";
import { AudioOutlined, SendOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const ChatInputBar = ({
  onSendText,
  onSendAudio,
}: {
  onSendText: (msg: string) => void;
  onSendAudio: (blob: Blob) => void;
}) => {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (text.trim()) {
      onSendText(text);
      setText("");
      // Volver a enfocar después de enviar
    }
    textAreaRef.current?.focus();
  };
  const handleStartRecording = async () => {
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorder.ondataavailable = (e) => setChunks((prev) => [...prev, e.data]);

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      onSendAudio(blob);
      setChunks([]);
    };
    recorder.start();
    setMediaRecorder(recorder);
  };

  const handleStopRecording = () => {
    setRecording(false);
    mediaRecorder?.stop();
  };

  return (
    <div style={{ display: "flex", gap: "8px", paddingTop: "12px" }}>
      <TextArea
      ref={textAreaRef}
      autoSize={{ minRows: 1, maxRows: 6 }}
      placeholder="Pregunta lo que quieras..."
      value={text}
      onChange={(e) => setText(e.target.value)}
      onPressEnter={(e) => {
        e.preventDefault();
        handleSend();
      }}
      />
      <Button
      disabled={recording && !text}
      icon={text.trim() ? <SendOutlined /> : <AudioOutlined />}
      type="primary"
      shape="circle"
      danger={recording && !text}
      onClick={() => {
        if (text.trim()) {
        handleSend();
        }
      }}
      onMouseDown={!text.trim() ? () => {
        handleStartRecording();
      } : undefined}
        onMouseUp={() => {
          handleStopRecording();
        }}
      onMouseLeave={!text.trim() ? () => {
        if (recording) handleStopRecording();
      } : undefined}
      style={{
        backgroundColor: !text.trim() ? "#25d366" : undefined,
        borderColor: !text.trim() ? "#25d366" : undefined,
        transition: "transform 0.15s",
        transform: recording && !text.trim() ? "scale(1.35)" : "scale(1)",
      }}
      />
    </div>
  );
};

export default ChatInputBar;
