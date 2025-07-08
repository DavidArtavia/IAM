import { DTO_ChatIA, DTO_Negocio } from "@/models";
interface Props {
    chats: Array<DTO_ChatIA>;
    selectedChat: DTO_ChatIA | null;
    onSelectChat: (chat: DTO_ChatIA) => void;
    negocio: DTO_Negocio;
}
export declare const ChatSidebar: ({ chats, selectedChat, onSelectChat, negocio }: Props) => import("react/jsx-runtime").JSX.Element;
export {};
