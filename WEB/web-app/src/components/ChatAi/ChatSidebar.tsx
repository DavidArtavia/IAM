
import { DTO_ChatIA } from "@/models";
import { dateHelpers } from "@/utils";

interface Props {
  chats: Array<DTO_ChatIA>;
  selectedChat: DTO_ChatIA | null;
  onSelectChat: (chat: DTO_ChatIA) => void;
}

export const ChatSidebar = ({ chats, selectedChat, onSelectChat }: Props) => {

  return (
    <div>

      <div className="card card-flush">
        <div className="card-header pt-7" id="kt_chat_contacts_header">
          <h3 className="card-title">Chats Activos</h3>
          <div className="card-toolbar">
            <button type="button" className="btn btn-sm btn-dark"><i className="bi bi-plus-lg fs-4"></i></button>
          </div>
        </div>

        <div className="card-body">

          {chats.map((chat) => (
            
              <div key={chat.iD_ChatIA} onClick={() => onSelectChat(chat)}>
                <div className="d-flex flex-stack">
                  <div className="d-flex align-items-center">
                    <div className="symbol symbol-45px symbol-circle">
                      
                      <span className={`symbol-label fs-6 fw-bolder${(selectedChat?.iD_ChatIA === chat?.iD_ChatIA) ? " bg-dark" : " "}`}><i className="bi bi-chat-left-text fs-1"></i></span>
                    </div>
                    <div className="ms-5">
                      <a href="#kt_chat_messenger_footer" className="fs-5 fw-bolder text-gray-900 text-hover-primary mb-2">
                         Chat #{chat.iD_ChatIA} 
                      </a>
                      <div className="fw-bold text-muted">{dateHelpers.formatFechaDDMMYYYY(chat.fechaInicial)}</div>
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-end ms-2">
                    <span className="text-muted fs-7 mb-1">{dateHelpers.formatTimeDifference(chat.fechaInicial)}</span>
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

