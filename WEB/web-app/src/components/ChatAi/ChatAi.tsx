import { useEffect, useState } from "react";
import { Row, Col, Typography, Divider, Button } from "antd";
import ChatSidebar from "./ChatSidebar";
import {
  getMessagesByChat,
  sendAudioMessage,
  sendTextMessage,
} from "@/services/chatServices";
import ChatMessages from "./ChatMessages";
import ChatInputBar from "./ChatInputBar";
import { DTO_Mensaje } from "@/models/DTO_Mensaje";

const { Title } = Typography;

const ChatAi = () => {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<DTO_Mensaje[]>([]);

  useEffect(() => {
    if (selectedChatId) {
      getMessagesByChat(selectedChatId).then(setMessages);
    }
  }, [selectedChatId]);

  const handleSendText = async (msg: string) => {
    // if (!selectedChatId) return;
    const dto: DTO_Mensaje = {
      ID_Mensaje: 0,
      ID_ChatIA: selectedChatId || 0,
      Tipo: "text",
      TextoMensaje: msg,
      TranscripcionAudio: "",
      RutaAudio: "",
      FechaMensaje: new Date(),
      audio: undefined,
      fromUser: true,
    };
    console.log("DTO_Mensaje", dto);
    // const newMsg = await sendTextMessage(dto);

    // setMessages((prev) => [...prev, newMsg]);
  };

  const handleSendAudio = async (blob: Blob) => {
    // if (!selectedChatId) return;
    const dto: DTO_Mensaje = {
      ID_Mensaje: 0,
      ID_ChatIA: selectedChatId || 0,
      Tipo: "audio",
      TextoMensaje: "",
      TranscripcionAudio: "",
      RutaAudio: "",
      FechaMensaje: new Date(),
      audio: new File([blob], "audio-message.webm", {
        type: blob.type || "audio/webm",
      }),
      fromUser: true,
    };
    console.log("DTO_Mensaje audio", dto);

    setMessages((prev) => [...prev, dto]);
    // const newMsg = await sendAudioMessage(dto);
    // setMessages((prev) => [...prev, newMsg]);
  };
  const label = ["NEGOCIO 1", "NEGOCIO 2", "NEGOCIO 3"];
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  return (
    <Row gutter={16} style={{ height: "100%" }}>
      <Col span={6}>
        <ChatSidebar onSelectChat={setSelectedChatId} />
      </Col>
      <Col span={18} style={{ display: "flex", flexDirection: "column" }}>
        <Title level={4}>Chat Inteligente</Title>
        <Row gutter={16} justify="space-evenly">
          {label.map((label, idx) => (
            <Button
              key={idx}
              type="primary"
              style={{
                backgroundColor: selectedIndex === idx ? "#2E6C60" : "#CBCBCB",
                borderColor: selectedIndex === idx ? "#1D443C" : "#CBCBCB",
                color: "#fff",
              }}
              onClick={() => {
                setSelectedIndex(idx);
                // handleAction(idx);
              }}
            >
              {label}
            </Button>
          ))}
        </Row>
        <Divider />
        <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
          <ChatMessages messages={messages} />
        </div>
        <ChatInputBar
          onSendText={handleSendText}
          onSendAudio={handleSendAudio}
        />
      </Col>
    </Row>
  );
};

export default ChatAi;
