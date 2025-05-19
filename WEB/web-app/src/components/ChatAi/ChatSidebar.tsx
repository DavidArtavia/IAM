import { List, Divider, Tooltip, Button } from "antd";
import { DTO_ChatIA } from "@/models";
import { PlusOutlined } from "@ant-design/icons";

interface Props {
  chats: DTO_ChatIA[];
  selectedChat: DTO_ChatIA | null;
  onSelectChat: (chat: DTO_ChatIA) => void;
}

export const ChatSidebar = ({ chats, selectedChat, onSelectChat }: Props) => {
  return (
    <div style={{ padding: 12 }}>
      <Tooltip title="Nuevo Chat">
        <Button
          icon={<PlusOutlined />}
          type="primary"
          block
          style={{ marginBottom: 16 }}
        />
      </Tooltip>
      <h4>Chats</h4>
      <Divider style={{ margin: "8px 0" }} />
      <List
        size="small"
        bordered
        dataSource={[...chats].sort((a, b) =>
          new Date(b.fechaFinal || b.fechaInicial) > new Date(a.fechaFinal || a.fechaInicial) ? 1 : -1
        )}
        renderItem={(c) => (
          <List.Item
            style={{
              cursor: "pointer",
              background:
                c.iD_ChatIA === selectedChat?.iD_ChatIA ? "#e6f7ff" : undefined,
            }}
            onClick={() => onSelectChat(c)}
          >
            Chat #{c.iD_ChatIA}
          </List.Item>
        )} //se nececita un titulo para el chat, por ahora se pone el id
      />
    </div>
  );
}

