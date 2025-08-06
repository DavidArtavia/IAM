import { useEffect, useRef, useState } from "react";
import {
  ChatSidebar,
  ChatMessages,
  ChatInputBar,
  InfoPanel,
  LoadingPanel,
} from "@/components";
import { chatService } from "@/services";
import { DTO_Negocio, DTO_ChatIA, DTO_Mensaje, DTO_Respuesta } from "@/models";
import { errorHelpers, procesarRespuesta, processResponse } from "@/utils";
import { useApp } from "@/hooks/useApp";

export const ChatAi = () => {
  //🔄 Estado general
  const { state } = useApp();
  const chatMessengerRef = useRef<HTMLDivElement>(null);

  const [businesses, setBusinesses] = useState<DTO_Negocio[]>([]);
  const [chats, setChats] = useState<DTO_ChatIA[]>([]);
  const [messages, setMessages] = useState<DTO_Mensaje[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio>(
    new DTO_Negocio()
  );
  const [selectedChat, setChat] = useState<DTO_ChatIA | null>(null);

  useEffect(() => {
    if (state.negocio) {
      setSelectedBusiness(state.negocio);
      handleSelectBusiness(state.negocio);
      setBusinesses(state.listaNegocios);
    }
  }, [state]);

  const scrollToChatArea = () => {
    setTimeout(() => {
      chatMessengerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  };

  useEffect(() => {
    if (selectedChat) {
      scrollToChatArea();
    }
  }, [selectedChat]);

  //#endregion

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
        scrollToChatArea();
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
      {state.negocio == null ? (
        <InfoPanel msj="Seleccione un negocio para ver el chat." />
      ) : businesses.length === 0 ? (
        <LoadingPanel msj="Cargando negocios..." />
      ) : (
        selectedBusiness && (
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
            {/* Chat area */}
            <div
              className="flex-lg-row-fluid ms-lg-7 ms-xl-10 p-2 d-flex flex-column"
              style={{ minHeight: "calc(100vh - 200px)" }}
            >
              <div
                ref={chatMessengerRef}
                className="card flex-grow-1 d-flex flex-column"
                id="kt_chat_messenger"
              >
                {/* Messages area - debe tener scroll interno */}
                <div className="flex-grow-1 overflow-hidden">
                  <ChatMessages messages={messages} />
                </div>

                {/* Input bar - siempre visible en la parte inferior */}
                <div className="border-top">
                  <ChatInputBar
                    disabled={!selectedChat}
                    onSendText={handleSendText}
                    onSendAudio={handleSendAudio}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
