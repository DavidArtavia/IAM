import { List, Divider } from "antd";
import { DTO_ChatIA } from "@/models/DTO_ChatIA";

interface Props {
  chats: DTO_ChatIA[];
  selectedChat: DTO_ChatIA | null;
  onSelectChat: (chat: DTO_ChatIA) => void;
}

const ChatSidebar = ({ chats, selectedChat, onSelectChat }: Props) => (
  <div style={{ padding: 12 }}>
    <h4>Chats</h4>
    <Divider style={{ margin: "8px 0" }} />
    <List
      size="small"
      dataSource={chats}
      renderItem={(c) => (
        <List.Item
          style={{
            cursor: "pointer",
            background:
              c.id_ChatIA === selectedChat?.id_ChatIA ? "#e6f7ff" : undefined,
          }}
          onClick={() => onSelectChat(c)}
        >
          Chat #{c.id_ChatIA}
        </List.Item>
      )}
    />
  </div>
);

export default ChatSidebar;
