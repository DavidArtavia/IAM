import { useEffect, useState } from "react";
import { ChatSidebar, ChatMessages, ChatInputBar } from "@/components";
import { chatService } from "@/services"; // ajusta imports según tu estructura
import { DTO_Negocio, DTO_ChatIA, DTO_Mensaje, DTO_Respuesta } from "@/models";
import { errorHelpers, procesarRespuesta, processResponse } from "@/utils";
import { BusinessButtons } from "../Buttons/BusinessButtons";

export const ChatAi = () => {
  const [businesses, setBusinesses] = useState<Array<DTO_Negocio>>(
    new Array<DTO_Negocio>()
  );
  const [chats, setChats] = useState<Array<DTO_ChatIA>>([]);
  const [messages, setMessages] = useState<Array<DTO_Mensaje>>(
    new Array<DTO_Mensaje>()
  );
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );
  const [selectedChat, setChat] = useState<DTO_ChatIA | null>(null);

  // 1) Cargo negocios al montar
  useEffect(() => {
    chatService.obtenerNegocios().subscribe({
      next: (result) =>
        setBusinesses(
          processResponse(result as DTO_Respuesta) as Array<DTO_Negocio>
        ),
      error: (err) => errorHelpers.serverError(err), //controlamos el error del servidor
      complete: () => {},
    });
  }, []);

  // 2) Cuando elijo negocio, cargo sus chats
  const handleSelectBusiness = (negocio: DTO_Negocio) => {
    setSelectedBusiness(negocio);
    setChat(null);
    setMessages([]);
    chatService.obtenerChatsPorNegocio(negocio).subscribe({
      next: (result) =>
        setChats(
          processResponse(result as DTO_Respuesta) as Array<DTO_ChatIA>
        ),
      error: (err) => errorHelpers.serverError(err), //controlamos el error del servidor
      complete: () => {},
    });
  };

  // 3) Cuando elijo chat, cargo sus mensajes
  const handleSelectChat = (chat: DTO_ChatIA) => {
    //Nos dirigimos al campo de texto automáticamente
    window.location.hash = "#kt_chat_messenger_footer";
    setChat(chat);
    setMessages(new Array<DTO_Mensaje>());
    chatService.obtenerMensajesPorChat(chat).subscribe({
      next: (result) =>
        setMessages(
          processResponse(result as DTO_Respuesta) as Array<DTO_Mensaje>
        ),
      error: (err) => errorHelpers.serverError(err), //controlamos el error del servidor
      complete: () => {},
    });
  };

  // 4) Envío texto
  const handleSendText = async (text: string) => {
    if (!selectedChat) return;
    const userMsg = new DTO_Mensaje();
    userMsg.iD_ChatIA = selectedChat.iD_ChatIA;
    userMsg.tipo = "user";
    userMsg.textoMensaje = text;
    userMsg.fromUser = true;

    chatService.enviarMensajeTexto(userMsg).subscribe({
      next: (result) =>
        setMessages((m) => [
          ...m,
          processResponse(result as DTO_Respuesta) as DTO_Mensaje,
        ]),
      error: (err) => errorHelpers.serverError(err), //controlamos el error del servidor
      complete: () => {},
    });
  };

  // 5) Envío audio
  const handleSendAudio = async (blob: Blob) => {
    if (!selectedChat) return;
    const userMsg = new DTO_Mensaje();
    userMsg.iD_ChatIA = selectedChat.iD_ChatIA;
    userMsg.tipo = "user";
    userMsg.audio = new File([blob], "audio.wav", { type: blob.type });
    userMsg.fromUser = true;

    chatService.enviarMensajeAudio(userMsg).subscribe({
      next: (result) =>
        setMessages((m) => [
          ...m,
          procesarRespuesta(result as DTO_Respuesta) as DTO_Mensaje,
        ]),
      error: (err) => errorHelpers.serverError(err), //controlamos el error del servidor
      complete: () => {},
    });
  };

  return (
    <div className="row p-4 col-12 gx-0">
      <BusinessButtons
        title={
          "Seleccione un negocio para conversar con el asistente inteligente:"
        }
        handleSelectBusiness={handleSelectBusiness}
        selectedBusiness={selectedBusiness}
      />
      <div
        className={`d-flex flex-column flex-lg-row mt-10${
          businesses.length > 0 ? " " : " d-none"
        }`}
      >
        <div className="flex-column flex-lg-row-auto w-100 w-lg-300px w-xl-400px mb-10 mb-lg-0 p-2">
          <ChatSidebar
            chats={chats}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
          />
        </div>
        <div className="flex-lg-row-fluid ms-lg-7 ms-xl-10 p-2">
          <div className="card" id="kt_chat_messenger">
            <div className="card-header" id="kt_chat_messenger_header">
              <div className="card-title">
                <div className="d-flex justify-content-center flex-column me-3">
                  <a
                    href="#"
                    className="fs-4 fw-bolder text-gray-900 text-hover-primary me-1 mb-2 lh-1"
                  >
                    IAM Asistente
                  </a>
                  <div className="mb-0 lh-1">
                    <span className="badge badge-success badge-circle w-10px h-10px me-1"></span>
                    <span className="fs-7 fw-bold text-muted">Active</span>
                  </div>
                </div>
              </div>
            </div>
            {<ChatMessages messages={messages} />}
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
