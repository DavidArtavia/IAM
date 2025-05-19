import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Typography,
  Divider,
  Spin,
  Alert,
  Space,
  Button,
} from "antd";
import {ChatSidebar, ChatMessages, ChatInputBar } from "@/components";
import { getBusinesses, getChatsByBusiness, getMessagesByChat, sendTextMessage, sendAudioMessage,} from "@/services"; // ajusta imports según tu estructura
import { DTO_Negocio, DTO_ChatIA, DTO_Mensaje } from "@/models";

const { Title } = Typography;

export const ChatAi = () => {
  const [businesses, setBusinesses] = useState<DTO_Negocio[]>([]);
  const [chats, setChats] = useState<DTO_ChatIA[]>([]);
  const [messages, setMessages] = useState<DTO_Mensaje[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  const [selectedChat, setChat] = useState<DTO_ChatIA | null>(null);
  const [loadingMessages, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Cargo negocios al montar
  useEffect(() => {
    getBusinesses().then((res) => {
      if (typeof res === "string") return setError(res);
      setBusinesses(res);
    });
  }, []);

  // 2) Cuando elijo negocio, cargo sus chats
  const handleSelectBusiness = (biz: DTO_Negocio) => {
    setSelectedBusiness(biz);
    setChat(null);
    setMessages([]);
    getChatsByBusiness(biz).then((res) => {
      if (typeof res === "string") return setError(res);
      setChats(res);
      console.log(
        `los chat del negocio seleccionado ${selectedBusiness} son:`,
        res
      );
    });
  };

  // 3) Cuando elijo chat, cargo sus mensajes
  const handleSelectChat = (chat: DTO_ChatIA) => {
    setChat(chat);
    console.log(`el chat seleccionado es:`, chat);
    
    setMessages([]);
    setLoading(true);
    getMessagesByChat({
      ...chat,
      iD_Negocio: selectedBusiness!.iD_Negocio,
    }).then((res) => {
      setLoading(false);
      if (typeof res === "string") return setError(res);
      setMessages(res);
    });
  };

  // 4) Envío texto
  const handleSendText = async (text: string) => {
    if (!selectedChat) return;
    const userMsg = new DTO_Mensaje();
    userMsg.iD_ChatIA = 1;
    userMsg.tipo = "texto";
    userMsg.textoMensaje = text;
    userMsg.fromUser = true;

    setMessages((m) => [...m, userMsg]);
    const res = await sendTextMessage(userMsg);
    if (typeof res === "string") return setError(res);
    setMessages((m) => [...m, res]);
  };

  // 5) Envío audio
  const handleSendAudio = async (blob: Blob) => {
    if (!selectedChat) return;
    const userMsg = new DTO_Mensaje();
    userMsg.iD_ChatIA = selectedChat.iD_ChatIA;
    userMsg.tipo = "audio";
    userMsg.audio = new File([blob], "audio.wav", { type: blob.type });
    userMsg.fromUser = true;

    setMessages((m) => [...m, userMsg]);
    const res = await sendAudioMessage(userMsg);
    if (typeof res === "string") return setError(res);
    setMessages((m) => [...m, res]);
  };

  return (
    <Row gutter={16} style={{ height: "100%" }}>
      <Col span={6}>
        <ChatSidebar
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
        />
      </Col>
      <Col span={18} style={{ display: "flex", flexDirection: "column" }}>
        <Title level={4}>Chat Inteligente</Title>
        {error && (
          <Alert type="error" message={error} style={{ marginBottom: 12 }} />
        )}
        {/* Botones de negocios arriba */}
        <Space style={{ marginBottom: 12 }}>
          {error ? (
            <Alert type="error" message={error} />
          ) : businesses && businesses.length > 0 ? (
            businesses.map((biz) => (
              <Button
                key={biz.iD_Negocio}
                type={
                  selectedBusiness?.iD_Negocio === biz.iD_Negocio
                    ? "primary"
                    : "default"
                }
                onClick={() => handleSelectBusiness(biz)}
              >
                {biz.nombreNegocio}
              </Button>
            ))
          ) : (
            <Spin />
          )}
        </Space>
        <Divider />
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 12px",
            background: "#fafafa",
            borderRadius: 8,
            // boxShadow: "0 4px 24px rgba(0,0,0,0.12)", // Más visible
            marginBottom: 12,
          }}
        >
          {loadingMessages ? <Spin /> : <ChatMessages messages={messages} />}
        </div>
        <ChatInputBar
          disabled={!selectedChat}
          onSendText={handleSendText}
          onSendAudio={handleSendAudio}
        />
      </Col>
    </Row>
  );
};

