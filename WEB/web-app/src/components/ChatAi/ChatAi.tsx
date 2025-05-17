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
import ChatSidebar from "./ChatSidebar";
import ChatMessages from "./ChatMessages";
import ChatInputBar from "./ChatInputBar";
import {
  getBusinesses,
  getChatsByBusiness,
  getMessagesByChat,
  sendTextMessage,
  sendAudioMessage,
} from "@/services/chatServices"; // ajusta imports según tu estructura
import { DTO_Negocio } from "@/models/DTO_Negocio";
import { DTO_ChatIA } from "@/models/DTO_ChatIA";
import { DTO_Mensaje } from "@/models/DTO_Mensaje";
// import { DTO_Estado } from "@/models/DTO_Estado";

const { Title } = Typography;

const ChatAi = () => {
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
    userMsg.id_ChatIA = selectedChat.iD_ChatIA;
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
    userMsg.id_ChatIA = selectedChat.iD_ChatIA;
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
          <ChatMessages messages={messages} />
          {loadingMessages ? <Spin /> : <ChatMessages messages={messages} />}

          {/* Simulación de chat: muestra mensajes de ejemplo si no hay mensajes */}
          {messages.length === 0 && !loadingMessages && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: 32,
              }}
            >
              {/* Burbuja del asistente */}
              <div
                style={{
                  background: "#e6f4ff",
                  color: "#1677ff",
                  borderRadius: "18px",
                  padding: "12px 20px",
                  marginBottom: 8,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  maxWidth: "60%",
                  position: "relative",
                  alignSelf: "flex-start",
                }}
              >
                🤖 Hola, soy tu asistente virtual. ¿En qué puedo ayudarte hoy?
              </div>
              {/* Burbuja del usuario simulada */}
              <div
                style={{
                  background: "#fffbe6",
                  color: "#ad8b00",
                  borderRadius: "18px",
                  padding: "12px 20px",
                  marginBottom: 8,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  maxWidth: "60%",
                  position: "relative",
                  alignSelf: "flex-end",
                }}
              >
                👤 Hola, ¿qué servicios ofrecen?
              </div>
              {/* Burbuja de respuesta del asistente */}
              <div
                style={{
                  background: "#e6f4ff",
                  color: "#1677ff",
                  borderRadius: "18px",
                  padding: "12px 20px",
                  marginBottom: 8,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  maxWidth: "60%",
                  position: "relative",
                  alignSelf: "flex-start",
                }}
              >
                🤖 Ofrecemos servicios de mecánica general, cambio de aceite,
                revisión de frenos y más. ¿Te gustaría agendar una cita o
                conocer más detalles?
              </div>
              {/* Burbuja de ejemplo del asistente */}
              <div
                style={{
                  background: "#f5f5f5",
                  color: "#888",
                  borderRadius: "18px",
                  padding: "8px 16px",
                  maxWidth: 320,
                  fontSize: 13,
                }}
              >
                (Ejemplo: "¿Cuáles son los servicios disponibles?" o "¿Puedo
                agendar una cita?")
              </div>
            </div>
          )}
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

export default ChatAi;
