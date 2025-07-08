import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ChatSidebar, ChatMessages, ChatInputBar } from "@/components";
import { chatService } from "@/services";
import { DTO_Negocio, DTO_Mensaje } from "@/models";
import { errorHelpers, procesarRespuesta, processResponse } from "@/utils";
import { useApp } from "@/hooks/useApp";
export const ChatAi = () => {
    //🔄 Estado general
    const { state } = useApp();
    useEffect(() => {
        if (state.negocio) {
            setSelectedBusiness(state.negocio);
            handleSelectBusiness(state.negocio);
            setBusinesses(state.listaNegocios);
        }
    }, [state]);
    //#endregion
    const [businesses, setBusinesses] = useState([]);
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(new DTO_Negocio());
    const [selectedChat, setChat] = useState(null);
    const handleSelectBusiness = (negocio) => {
        setSelectedBusiness(negocio);
        setChat(null);
        setMessages([]);
        chatService.obtenerChatsPorNegocio(negocio).subscribe({
            next: (result) => {
                setChats(processResponse(result));
            },
            error: (err) => errorHelpers.serverError(err),
        });
    };
    const handleSelectChat = (chat) => {
        setChat(chat);
        setMessages([]);
        chatService.obtenerMensajesPorChat(chat).subscribe({
            next: (result) => {
                // si vienen anidados, los aplana; si no, deja tal cual
                const raw = result.resultado;
                const flat = Array.isArray(raw[0])
                    ? raw.flat()
                    : raw;
                setMessages(flat);
            },
            error: (err) => errorHelpers.serverError(err),
        });
    };
    const handleSendText = (text) => {
        if (!selectedChat)
            return;
        const userMsg = new DTO_Mensaje();
        userMsg.iD_ChatIA = selectedChat.iD_ChatIA;
        userMsg.envia = "USUARIO";
        userMsg.contenido = text;
        userMsg.recibe = "IAM";
        chatService.enviarMensajeTexto(userMsg).subscribe({
            next: (result) => {
                const newMsg = processResponse(result);
                setMessages((m) => [...m, newMsg]);
            },
            error: (err) => errorHelpers.serverError(err),
        });
    };
    const handleSendAudio = (blob) => {
        if (!selectedChat)
            return;
        const userMsg = new DTO_Mensaje();
        userMsg.iD_ChatIA = selectedChat.iD_ChatIA;
        userMsg.envia = "USUARIO";
        userMsg.audio = new File([blob], "audio.wav", { type: blob.type });
        userMsg.recibe = "IAM";
        chatService.enviarMensajeAudio(userMsg).subscribe({
            next: (result) => {
                const newMsg = procesarRespuesta(result);
                setMessages((m) => [...m, newMsg]);
            },
            error: (err) => errorHelpers.serverError(err),
        });
    };
    return (_jsxs("div", { className: "row p-4 col-12 gx-0", children: [state.negocio == null, _jsxs("div", { className: `d-flex flex-column flex-lg-row mt-10${businesses.length ? "" : " d-none"}`, children: [_jsx("div", { className: "flex-column flex-lg-row-auto w-100 w-lg-300px w-xl-400px mb-10 mb-lg-0 p-2", children: _jsx(ChatSidebar, { chats: chats, selectedChat: selectedChat, onSelectChat: handleSelectChat, negocio: selectedBusiness }) }), _jsx("div", { className: "flex-lg-row-fluid ms-lg-7 ms-xl-10 p-2", children: _jsxs("div", { className: "card", id: "kt_chat_messenger", children: [_jsx(ChatMessages, { messages: messages }), _jsx(ChatInputBar, { disabled: !selectedChat, onSendText: handleSendText, onSendAudio: handleSendAudio })] }) })] })] }));
};
