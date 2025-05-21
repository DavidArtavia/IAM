import { useEffect, useRef, useState } from "react";
import { Input, Button, Tooltip } from "antd";
import { AudioOutlined, SendOutlined } from "@ant-design/icons";

const { TextArea } = Input;

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
      <TextArea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          disabled ? "Selecciona un chat arriba" : "Escribe un mensaje..."
        }
        disabled={disabled}
        onPressEnter={(e) => {
          e.preventDefault();
          sendText();
        }}
        autoSize={{ minRows: 1, maxRows: 4 }}
      />
      <Tooltip
        title={
          text.trim()
            ? "Enviar texto"
            : recording
            ? "Suelta para enviar"
            : "Mantén presionado para grabar"
        }
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={text.trim() ? <SendOutlined /> : <AudioOutlined />}
          danger={recording}
          disabled={disabled}
          onClick={text.trim() ? sendText : undefined}
          onMouseDown={!text.trim() ? startRecording : undefined}
          onMouseUp={!text.trim() ? stopRecording : undefined}
          onMouseLeave={!text.trim() && recording ? stopRecording : undefined}
          style={{
            transform: recording ? "scale(1.3)" : "scale(1)",
            transition: "transform .1s",
          }}
        />
      </Tooltip>
    </div>
  );
};


