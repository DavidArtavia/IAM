interface Props {
    disabled: boolean;
    onSendText: (msg: string) => void;
    onSendAudio: (blob: Blob) => void;
}
export declare const ChatInputBar: ({ disabled, onSendText, onSendAudio }: Props) => import("react/jsx-runtime").JSX.Element;
export {};
