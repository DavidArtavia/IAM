// components/ChatAi/ChatMessages.tsx
import { List, Avatar, Typography, Card } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { DTO_Mensaje } from "@/models/DTO_Mensaje";

const { Paragraph } = Typography;

const ChatMessages = ({ messages }: { messages: DTO_Mensaje[] }) => {
  console.log("el mensaje llego a ChatMessages", messages);
  
  return (
    <List
      dataSource={messages}
      renderItem={(msg) => (
        <List.Item
          style={{
            justifyContent: msg.fromUser ? "flex-end" : "flex-start",
          }}
        >
          <Card
            style={{
              maxWidth: "70%",
              backgroundColor: msg.fromUser ? "#e6f7ff" : "#f0f0f0",
              borderRadius: "12px",
            }}
            bodyStyle={{ padding: "12px" }}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={msg.fromUser ? <UserOutlined /> : <RobotOutlined />}
                  style={{
                    backgroundColor: msg.fromUser ? "#1890ff" : "#8c8c8c",
                  }}
                />
              }
              title={msg.fromUser ? "Tú" : "IA"}
              description={
                msg.Tipo === "texto" ? (
                  <Paragraph style={{ margin: 0 }}>
                    {msg.TextoMensaje}
                  </Paragraph>
                ) : (
                  <audio
                    controls
                    src={
                      typeof msg.audio === "string"
                        ? msg.audio
                        : msg.audio
                        ? URL.createObjectURL(msg.audio)
                        : undefined
                    }
                  />
                )
              }
            />
          </Card>
        </List.Item>
      )}
    />
  );
};

export default ChatMessages;
