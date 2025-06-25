import { useState } from "react";
import { ChatSidebar, ChatMessages, ChatInputBar } from "@/components";
import { chatService } from "@/services";
import { DTO_Negocio, DTO_ChatIA, DTO_Mensaje, DTO_Respuesta } from "@/models";
import { errorHelpers, procesarRespuesta, processResponse } from "@/utils";
import { BusinessButtons } from "../Buttons/BusinessButtons";

export const ChatAi = () => {
  const [businesses, setBusinesses] = useState<DTO_Negocio[]>([]);
  const [chats, setChats] = useState<DTO_ChatIA[]>([]);
  const [messages, setMessages] = useState<DTO_Mensaje[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio>( new DTO_Negocio() );
  const [selectedChat, setChat] = useState<DTO_ChatIA | null>(null);

  const handleSelectBusiness = (negocio: DTO_Negocio) => {
    setSelectedBusiness(negocio);
    setChat(null);
    setMessages([]);
    chatService.obtenerChatsPorNegocio(negocio).subscribe({
      next: (result) => {
        setChats(processResponse(result as DTO_Respuesta) as DTO_ChatIA[]);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  const handleSelectChat = (chat: DTO_ChatIA) => {
    setChat(chat);
    setMessages([]);
    chatService.obtenerMensajesPorChat(chat).subscribe({
      next: (result: DTO_Respuesta) => {
        // si vienen anidados, los aplana; si no, deja tal cual
        const raw = result.resultado as DTO_Mensaje[] | DTO_Mensaje[][];
        const flat: DTO_Mensaje[] = Array.isArray(raw[0])
          ? (raw as DTO_Mensaje[][]).flat()
          : (raw as DTO_Mensaje[]);
        setMessages(flat);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  const handleSendText = (text: string) => {
    if (!selectedChat) return;
    const userMsg = new DTO_Mensaje();
    userMsg.iD_ChatIA = selectedChat.iD_ChatIA;
    userMsg.envia = "USUARIO";
    userMsg.contenido = text;
    userMsg.recibe = "IAM";

    chatService.enviarMensajeTexto(userMsg).subscribe({
      next: (result) => {
        const newMsg = processResponse(result as DTO_Respuesta) as DTO_Mensaje;
        setMessages((m) => [...m, newMsg]);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  const handleSendAudio = (blob: Blob) => {
    if (!selectedChat) return;
    const userMsg = new DTO_Mensaje();
    userMsg.iD_ChatIA = selectedChat.iD_ChatIA;
    userMsg.envia = "USUARIO";
    userMsg.audio = new File([blob], "audio.wav", { type: blob.type });
    userMsg.recibe = "IAM";

    chatService.enviarMensajeAudio(userMsg).subscribe({
      next: (result) => {
        const newMsg = procesarRespuesta(
          result as DTO_Respuesta
        ) as DTO_Mensaje;
        setMessages((m) => [...m, newMsg]);
      },
      error: (err) => errorHelpers.serverError(err),
    });
  };

  return (
    <div className="row p-4 col-12 gx-0">
      <BusinessButtons
        title="Seleccione un negocio para conversar con el asistente inteligente:"
        onLoadBusinesses={setBusinesses}
        handleSelectBusiness={handleSelectBusiness}
        selectedBusiness={selectedBusiness}
      />
      <div
        className={`d-flex flex-column flex-lg-row mt-10${
          businesses.length ? "" : " d-none"
        }`}
      >
        <div className="flex-column flex-lg-row-auto w-100 w-lg-300px w-xl-400px mb-10 mb-lg-0 p-2">
          <ChatSidebar
            chats={chats}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            negocio={selectedBusiness}
          />
        </div>
        <div className="flex-lg-row-fluid ms-lg-7 ms-xl-10 p-2">
          <div className="card" id="kt_chat_messenger">
            <ChatMessages messages={messages} />
            <ChatInputBar
              disabled={!selectedChat}
              onSendText={handleSendText}
              onSendAudio={handleSendAudio}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
