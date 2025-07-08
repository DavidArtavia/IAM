import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { chatService } from "@/services";
import { dateHelpers, errorHelpers, notificationHelpers, procesarRespuesta } from "@/utils";
import { useEffect, useState } from "react";
export const ChatSidebar = ({ chats, selectedChat, onSelectChat, negocio }) => {
    const [newChat, setNewChat] = useState();
    useEffect(() => {
        setNewChat(chats);
    }, [chats]);
    const handleNewChat = () => {
        if (!negocio)
            return;
        chatService.crearChat(negocio).subscribe({
            next: (result) => {
                notificationHelpers.infoAlert(result.mensaje || "Chat creado exitosamente");
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
    return (_jsx("div", { children: _jsxs("div", { className: "card card-flush", children: [_jsxs("div", { className: "card-header pt-7", id: "kt_chat_contacts_header", children: [_jsx("h3", { className: "card-title", children: "Chats Activos" }), _jsx("div", { className: "card-toolbar", children: _jsxs("button", { type: "button", title: "Nuevo Chat", disabled: negocio.iD_Negocio === 0, onClick: handleNewChat, className: "btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm", children: [_jsx("i", { className: "bi bi-plus-lg fs-5" }), _jsx("span", { className: "d-none d-sm-inline", children: "Nuevo Chat" })] }) })] }), _jsx("div", { className: "card-body", children: newChat?.map((chat) => (_jsxs("div", { onClick: () => onSelectChat(chat), children: [_jsxs("div", { className: "d-flex flex-stack", children: [_jsxs("div", { className: "d-flex align-items-center", children: [_jsx("div", { className: "symbol symbol-45px symbol-circle", children: _jsx("span", { className: `symbol-label fs-6 fw-bolder${selectedChat?.iD_ChatIA === chat?.iD_ChatIA
                                                        ? " bg-dark"
                                                        : " "}`, children: _jsx("i", { className: "bi bi-chat-left-text fs-1" }) }) }), _jsxs("div", { className: "ms-5", children: [_jsxs("a", { href: "#kt_chat_messenger_footer", className: "fs-5 fw-bolder text-gray-900 text-hover-primary mb-2", children: ["Chat #", newChat?.findIndex((c) => c.iD_ChatIA === chat.iD_ChatIA) + 1] }), _jsx("div", { className: "fw-bold text-muted", children: dateHelpers.formatFechaDDMMYYYY(chat.fechaInicial) })] })] }), _jsx("div", { className: "d-flex flex-column align-items-end ms-2", children: _jsx("span", { className: "text-muted fs-7 mb-1", children: dateHelpers.formatTimeDifference(chat.fechaInicial) }) })] }), _jsx("div", { className: "separator border-solid mt-10 mb-12" })] }, chat.iD_ChatIA))) })] }) }));
};
