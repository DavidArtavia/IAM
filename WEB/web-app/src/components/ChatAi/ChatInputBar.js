import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import Recorder from 'recorder-js';
export const ChatInputBar = ({ disabled, onSendText, onSendAudio }) => {
    const [text, setText] = useState("");
    const [recording] = useState(false);
    const ref = useRef(null);
    const recorderRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [, setAudioURL] = useState(null);
    useEffect(() => {
        ref.current?.focus();
    }, []);
    const sendText = () => {
        if (!text.trim())
            return;
        onSendText(text.trim());
        setText("");
        ref.current?.focus();
    };
    const startRecording = async () => {
        // 1) Pedimos permisos y capturamos el stream de micrófono
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // 2) Creamos AudioContext y Recorder
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const recorder = new Recorder(audioContext, { /* opcionales: bufferLen, numChannels… */});
        recorderRef.current = recorder;
        // 3) Inicializamos y arrancamos
        await recorder.init(stream);
        recorder.start();
        setIsRecording(true);
    };
    const stopRecording = async () => {
        if (!recorderRef.current)
            return;
        // 4) Paramos y obtenemos el blob WAV
        const { blob } = await recorderRef.current.stop();
        setIsRecording(false);
        // 5) Mostramos preview y enviamos a quien escuche
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        onSendAudio(blob);
    };
    return (_jsxs("div", { style: { display: "flex", padding: 8, background: "#fff", gap: 8 }, children: [_jsx("input", { onChange: (e) => setText(e.target.value), type: "text", id: "kt_chat_messenger_footer", className: "form-control", placeholder: disabled ? "Selecciona un chat o cree uno nuevo" : "Escribe un mensaje...", disabled: disabled, onKeyDown: (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        sendText();
                    }
                } }), _jsx("button", { "data-bs-toggle": "tooltip", "data-bs-placement": "top", title: text.trim()
                    ? "Enviar texto"
                    : recording
                        ? "Suelta para enviar"
                        : "Mantén presionado para grabar", className: `btn btn-icon me-2 mb-2${(isRecording) ? " btn-danger" : " btn-primary"}`, disabled: disabled, onClick: text.trim() ? sendText : undefined, onMouseDown: !text.trim() ? startRecording : undefined, onMouseUp: !text.trim() ? stopRecording : undefined, onMouseLeave: !text.trim() && recording ? stopRecording : undefined, children: text.trim() ?
                    _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", fill: "currentColor", className: "bi bi-send", viewBox: "0 0 16 16", children: _jsx("path", { d: "M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" }) }) :
                    _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", fill: "currentColor", className: "bi bi-mic", viewBox: "0 0 16 16", children: [_jsx("path", { d: "M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5" }), _jsx("path", { d: "M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3" })] }) })] }));
};
