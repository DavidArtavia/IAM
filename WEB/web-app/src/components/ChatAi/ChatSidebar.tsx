
import { DTO_ChatIA, DTO_Negocio } from "@/models";
import { chatService } from "@/services";
import { dateHelpers, errorHelpers, notificationHelpers, procesarRespuesta } from "@/utils";
import { useEffect, useState } from "react";

interface Props {
  chats: Array<DTO_ChatIA>;
  selectedChat: DTO_ChatIA | null;
  onSelectChat: (chat: DTO_ChatIA) => void;
  negocio: DTO_Negocio;
}

export const ChatSidebar = ({ chats, selectedChat, onSelectChat, negocio }: Props) => {

  const [newChat, setNewChat] = useState<DTO_ChatIA[]>();
  
  useEffect(() => {
    setNewChat(chats);
  }, [chats]);

  const handleNewChat = () => {

    if(!negocio) return;
    chatService.crearChat(negocio).subscribe({
      next: (result) => {
        notificationHelpers.infoAlert(
          result.mensaje || "Chat creado exitosamente"
        );

        const nuevosChats = procesarRespuesta(result);
        const chatsArray = Array.isArray(nuevosChats)
          ? nuevosChats
          : nuevosChats
          ? [nuevosChats]
          : [];

        setNewChat((prev) => [...(prev || []), ...chatsArray]);

        if (chatsArray.length > 0) {
          onSelectChat(chatsArray[chatsArray.length - 1]);
        }

      },
      error: (err) => errorHelpers.serverError(err),
      complete: () => {
      }
      
    });
  };

  return (
    <div>
      <div className="card card-flush">
        <div className="card-header pt-7" id="kt_chat_contacts_header">
          <h3 className="card-title">Chats Activos</h3>
          <div className="card-toolbar">
            <button
              type="button"
              title="Nuevo Chat"
              disabled={negocio.iD_Negocio === 0}
              onClick={handleNewChat}
              className="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm"
            >
              <i className="bi bi-plus-lg fs-5"></i>
              <span className="d-none d-sm-inline">Nuevo Chat</span>
            </button>
          </div>
        </div>
        <div
          className="card-body mh-700px"
          style={{ overflowY: "auto", maxHeight: "700px" }}
        >
          {newChat?.map((chat) => (
            <div key={chat.iD_ChatIA} onClick={() => onSelectChat(chat)}>
              <div className="d-flex flex-stack">
          <div className="d-flex align-items-center">
            <div className="symbol symbol-45px symbol-circle">
              <span
                className={`symbol-label fs-6 fw-bolder${
            selectedChat?.iD_ChatIA === chat?.iD_ChatIA
              ? " bg-dark"
              : " "
                }`}
              >
                <i className="bi bi-chat-left-text fs-1"></i>
              </span>
            </div>
            <div className="ms-5">
              <a
                href="#kt_chat_messenger_footer"
                className="fs-5 fw-bolder text-gray-900 text-hover-primary mb-2"
              >
                Chat #
                {newChat?.findIndex(
            (c) => c.iD_ChatIA === chat.iD_ChatIA
                ) + 1}
              </a>
              <div className="fw-bold text-muted">
                {dateHelpers.formatFechaDDMMYYYY(chat.fechaInicial)}
              </div>
            </div>
          </div>
          <div className="d-flex flex-column align-items-end ms-2">
            <span className="text-muted fs-7 mb-1">
              {dateHelpers.formatTimeDifference(chat.fechaInicial)}
            </span>
          </div>
              </div>
              <div className="separator border-solid mt-10 mb-12"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

