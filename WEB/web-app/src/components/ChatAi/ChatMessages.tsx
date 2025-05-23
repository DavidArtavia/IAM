import { useEffect, useRef } from "react";
import { DTO_Mensaje } from "@/models";
import { dateHelpers } from "@/utils";

interface Props {
  messages: DTO_Mensaje[];
}

export const ChatMessages = ({ messages }: Props) => {

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto‐scroll al fondo cuando cambian mensajes
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="card-body" id="kt_chat_messenger_body">
      <div
        className="scroll-y me-n5 pe-5 h-300px h-lg-auto"
        data-kt-element="messages"
        data-kt-scroll="true"
        data-kt-scroll-activate="{default: false, lg: true}"
        data-kt-scroll-max-height="auto"
        data-kt-scroll-dependencies="#kt_header, #kt_toolbar, #kt_footer, #kt_chat_messenger_header, #kt_chat_messenger_footer"
        data-kt-scroll-wrappers="#kt_content, #kt_chat_messenger_body"
        data-kt-scroll-offset="-2px"
        style={{ maxHeight: "771px" }}
      >


        {messages.map((mensage) => {
          const isAudio = !!mensage.rutaAudio && !mensage.textoMensaje;

          return (
            <div key={mensage.iD_Mensaje} className={`d-flex mb-10${(mensage.tipo === "assistant") ? " justify-content-start" : " justify-content-end"}`} >
              <div className={`d-flex flex-column${(mensage.tipo === "assistant") ? " align-items-start" : " align-items-end"}`}>
                <div className="d-flex align-items-center mb-2">
                  <div className="symbol symbol-35px symbol-circle">
                    {mensage.tipo === "assistant" ?
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-robot" viewBox="0 0 16 16">
                        <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135" />
                        <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5" />
                      </svg> :
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                        <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                      </svg>}

                  </div>
                  <div className="ms-3">
                    <a href="#" className="fs-5 fw-bolder text-gray-900 text-hover-primary me-1">
                      {mensage.tipo === "assistant" ? <p className="m-0" >IAM Asistente</p> : <p className="m-0">Yo</p>
                      }

                    </a>
                    <span className="text-muted fs-7 mb-1">{dateHelpers.formatTimeDifference(mensage.fechaMensaje)}</span>
                  </div>
                </div>
                <div
                  className={`p-5 rounded text-dark fw-bold mw-lg-400px${(mensage.tipo === "assistant") ? " bg-light-info text-start" : " bg-light-primary text-end"}`}
                  data-kt-element="message-text"
                >

                  {isAudio ? (
                    <audio
                      controls
                      style={{
                        width: "100%",
                        borderRadius: "12px",
                        padding: "10px",
                      }}
                      src={mensage.rutaAudio}
                    />
                  )
                    :
                    mensage.textoMensaje}
                </div>
              </div>
            </div>

          )
        })}
      </div>
    </div>

  );
}
