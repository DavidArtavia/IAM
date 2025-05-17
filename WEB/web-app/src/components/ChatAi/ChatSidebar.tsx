import { List, Divider } from "antd";
import { DTO_ChatIA } from "@/models/DTO_ChatIA";

interface Props {
  chats: DTO_ChatIA[];
  selectedChat: DTO_ChatIA | null;
  onSelectChat: (chat: DTO_ChatIA) => void;
}

const ChatSidebar = ({ chats, selectedChat, onSelectChat }: Props) => {

  console.log('los chats que legan a la sidebar son:', chats);
  
  
  
  return (
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
          c.iD_ChatIA === selectedChat?.iD_ChatIA ? "#e6f7ff" : undefined,
        }}
        onClick={() => onSelectChat(c)}
        >
          Chat #{c.iD_ChatIA}
        </List.Item>
      )}
      />
  </div>
);
}


export default ChatSidebar;
