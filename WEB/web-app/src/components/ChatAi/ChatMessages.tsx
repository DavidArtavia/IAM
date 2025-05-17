import { DTO_Mensaje } from "@/models/DTO_Mensaje";

const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

interface Props {
  messages: DTO_Mensaje[];
}

export default function ChatMessages({ messages }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {messages.map((m, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: m.fromUser ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{
              maxWidth: "60%",
              padding: "10px 14px",
              borderRadius: "18px",
              background: m.fromUser ? "#DCF8C6" : "#FFF",
              position: "relative",
            }}
          >
            {m.tipo === "texto" ? (
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {m.textoMensaje}
              </p>
            ) : (
              <audio controls src={URL.createObjectURL(m.audio!)} />
            )}
            <span
              style={{
                fontSize: 10,
                position: "absolute",
                bottom: -16,
                right: m.fromUser ? 6 : "auto",
                left: m.fromUser ? "auto" : 6,
                color: "#999",
              }}
            >
              {formatTime(new Date(m.fechaMensaje))}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
