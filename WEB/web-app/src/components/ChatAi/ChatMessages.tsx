import { useEffect, useRef } from "react";
import { DTO_Mensaje } from "@/models/DTO_Mensaje";

const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

interface Props {
  messages: DTO_Mensaje[];
}

export default function ChatMessages({ messages }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto‐scroll al fondo cuando cambian mensajes
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 16 }}>
      {messages.map((m, i) => {
        const alignRight = m.fromUser === true;
        const isAudio = !!m.rutaAudio && !m.textoMensaje;

        return (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: alignRight ? "flex-end" : "flex-start",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                maxWidth: "60%",
                background: alignRight ? "#dcf8c6" : "#f0f0f0",
                borderRadius: 12,
                position: "relative",
                padding: 0,
              }}
            >
              {isAudio ? (
                <audio
                  controls
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    padding: "10px",
                  }}
                  src={m.rutaAudio}
                />
              ) : (
                <div
                  style={{
                    maxHeight: 200,
                    overflowY: "auto",
                    padding: "10px 14px",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.4,
                  }}
                >
                  {m.textoMensaje}
                </div>
              )}

              <span
                style={{
                  fontSize: 10,
                  position: "absolute",
                  bottom: -16,
                  right: alignRight ? 6 : "auto",
                  left: alignRight ? "auto" : 6,
                  color: "#666",
                }}
              >
                {formatTime(m.fechaMensaje)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
