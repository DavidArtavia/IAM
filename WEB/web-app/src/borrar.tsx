import { useEffect, useState } from "react";
import { List, Button, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface Props {
  onSelectChat: (chatId: number) => void;
}

interface DTO_Chat {
  id: number;
  titulo: string;
  fecha: string;
}

interface DTO_Business {
  id: number;
  nombre: string;
  chats: DTO_Chat[];
}
const ChatSidebar = ({ onSelectChat }: Props) => {
  const [businesses, setBusinesses] = useState<DTO_Business[]>([]);

  useEffect(() => {
    // getBusinessesWithChats().then(setBusinesses);

    //esto es momentaneamente para simular la respuesta de la API
    const mockData: DTO_Business[] = [
      {
        id: 1,
        nombre: "Negocio 1",
        chats: [
          { id: 1, titulo: "Chat 1", fecha: "2023-10-01" },
          { id: 2, titulo: "Chat 2", fecha: "2023-10-02" },
          { id: 3, titulo: "Chat 3", fecha: "2023-10-02" },
          { id: 4, titulo: "Chat 4", fecha: "2023-10-02" },
        ],
      },
    ];

    setBusinesses(mockData);
  }, []);

  return (
    <div>
      <Tooltip title="Nuevo Chat">
        <Button
          icon={<PlusOutlined />}
          type="primary"
          block
          style={{ marginBottom: 16 }}
        />
      </Tooltip>
      {businesses.map((biz) => (
        <div key={biz.id}>
          <h4>{biz.nombre}</h4>
          <List
            size="small"
            bordered
            dataSource={[...biz.chats].sort((a, b) =>
              new Date(b.fecha) > new Date(a.fecha) ? 1 : -1
            )}
            renderItem={(chat) => (
              <List.Item
                style={{ cursor: "pointer" }}
                onClick={() => onSelectChat(chat.id)}
              >
                {chat.titulo}
              </List.Item>
            )}
          />
        </div>
      ))}
    </div>
  );
};

export default ChatSidebar;
