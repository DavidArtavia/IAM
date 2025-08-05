import { useContext, useEffect, useRef } from "react";
import { DTO_Mensaje } from "@/models";
import { dateHelpers } from "@/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AuthContext } from "@/context";

interface Props {
  messages: DTO_Mensaje[];
}

export const ChatMessages = ({ messages }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useContext(AuthContext);

  // auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      // Usamos smooth scroll solo si no estamos al final
      const isNearBottom =
        el.scrollHeight - el.clientHeight - el.scrollTop < 100;

      if (isNearBottom || messages.length <= 1) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages]);

  return (
    <>
      {/* — Header intacto — */}
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

      {/* — Cuerpo con scroll — */}
      <div className="card-body" id="kt_chat_messenger_body">
        <div
          ref={scrollRef}
          className="overflow-auto"
          style={{ maxHeight: "75vh", padding: "1rem", scrollBehavior: "smooth" }}
        >
          {messages.map((msg, idx) => {
            const isBot = msg.envia === "IAM";
            return (
              <div
                key={msg.iD_Mensaje ?? idx}
                className={`d-flex mb-4 ${
                  isBot ? "justify-content-start" : "justify-content-end"
                }`}
              >
                <div className="d-flex flex-column align-items-start">
                  {/*begin::User*/}
                  <div className="d-flex align-items-center mb-2">
                    {/*begin::Avatar*/}
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {isBot ? (
                        <div
                          className="bg-light-info rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 40, height: 40 }}
                        >
                          {/* SVG robot */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            className="bi bi-robot text-primary"
                            viewBox="0 0 16 16"
                          >
                            {/* … paths … */}
                            <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135" />
                            <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5" />{" "}
                          </svg>
                        </div>
                      ) : (
                        <div
                          className="bg-light-primary rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 40, height: 40 }}
                        >
                          {/* SVG persona */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            className="bi bi-person-circle text-primary"
                            viewBox="0 0 16 16"
                          >
                            {/* … paths … */}
                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                            <path
                              fillRule="evenodd"
                              d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                            />{" "}
                          </svg>
                        </div>
                      )}
                    </div>
                    {/*end::Avatar*/}
                    {/*begin::Details*/}
                    <div className="ms-3">
                      <a
                        href="#"
                        className="fs-5 fw-bolder text-gray-900 text-hover-primary me-1"
                      >
                        {isBot
                          ? "IAM Bot"
                          : user
                          ? `${user.nombreUsuario ?? ""}`
                          : "Usuario"}
                      </a>
                      <span className="text-muted fs-7 mb-1">
                        {dateHelpers.formatRelativeOrDate(msg.fechaMensaje)}
                      </span>
                    </div>
                    {/*end::Details*/}
                  </div>
                  {/*end::User*/}
                  {/*begin::Text*/}
                  {/* Burbuja */}
                  <div
                    className={`ms-3 p-3 shadow-sm rounded text-wrap ${
                      isBot
                        ? "p-5 rounded bg-light-info text-dark fw-bold mw-lg-400px text-start"
                        : "p-5 rounded bg-light-primary text-dark fw-bold mw-lg-400px text-end"
                    }`}
                    data-kt-element="message-text"
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // enlaces abren nueva pestaña
                        a: ({ /*node,*/ ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                      }}
                    >
                      {msg.contenido}
                    </ReactMarkdown>

                    {msg.rutaAudio && (
                      <audio
                        controls
                        className="w-100 mt-2"
                        src={msg.rutaAudio}
                      />
                    )}
                  </div>
                  {/*end::Text*/}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
