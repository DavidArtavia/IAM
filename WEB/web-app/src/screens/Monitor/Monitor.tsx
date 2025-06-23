import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import sonidoMonitor from "../../assets/media/audios/Monitor.mp3";
import { errorHelpers, notificationHelpers } from "@/utils";
import { BusinessButtons, LoadingPanel } from "@/components";
import { DTO_ItemOrdenServicio, DTO_Negocio, DTO_OrdenServicio, DTO_Respuesta } from "@/models";
import { monitorService, itemsOrdenesService, ordenesService } from "@/services";




export const FechaEntregaBadge = ({
  fechaEntrega,
  fechaCreacion,
}: {
  fechaEntrega: Date | string | null;
  fechaCreacion: Date | string | null | undefined;
}) => {
  /* ────────────────────────────
   * Validaciones iniciales
   * ──────────────────────────── */
  if (!fechaEntrega || !fechaCreacion) return null;

  const fEntrega =
    typeof fechaEntrega === 'string' ? new Date(fechaEntrega) : fechaEntrega;
  const fCreacion =
    typeof fechaCreacion === 'string' ? new Date(fechaCreacion) : fechaCreacion;

  if (isNaN(fEntrega.getTime()) || isNaN(fCreacion.getTime())) return null;

  /* ────────────────────────────
   * 1 ▸ Porcentaje de progreso
   * ──────────────────────────── */
  const totalMs = fEntrega.getTime() - fCreacion.getTime();
  const transMs = Date.now() - fCreacion.getTime();
  const pct =
    totalMs <= 0 ? 1 : Math.min(Math.max(transMs / totalMs, 0), 1); // 0–1

  /* ────────────────────────────
   * 2 ▸ Selección de clase
   * ──────────────────────────── */
  let badgeClass = 'badge badge-light'; // 0–20 %
  if (pct > 0.6) badgeClass = 'badge badge-light-danger';   // 60–100 %
  else if (pct > 0.4) badgeClass = 'badge badge-light-warning';  // 40–60 %
  else if (pct > 0.2) badgeClass = 'badge badge-light-success';  // 20–40 %

  /* ────────────────────────────
   * 3 ▸ Formateo de fecha
   * ──────────────────────────── */
  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };
  let texto = fEntrega.toLocaleDateString('es-ES', opts).replace(',', '');
  texto = texto.charAt(0).toUpperCase() + texto.slice(1);

  return <div className={badgeClass}>{texto}</div>;
};
export const Monitor = () => {

  const [estadoConexion, setEstadoConexion] = useState("Desconectado");
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const audio = useRef(new Audio(sonidoMonitor));
  const intentoRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [ordenes, setOrdenes] = useState<DTO_OrdenServicio[]>([]);
  const [items, setItems] = useState<DTO_ItemOrdenServicio[]>([]);
  const retryTimeoutRef = useRef<number | null>(null);
  const abortedRef = useRef(false);
  const isItemOrdenServicio = (obj: any): obj is DTO_ItemOrdenServicio => {
    return obj && typeof obj === 'object' && 'iD_ItemOrdenServicio' in obj;
  }

  const isOrdenServicio = (obj: any): obj is DTO_OrdenServicio => {
    return obj && typeof obj === 'object' && 'iD_Cliente' in obj;
  }

  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );


  const cambiarEstadoOrdenServicio = (orden: DTO_OrdenServicio, estado: number) => {
    orden.estado.iD_Estado = estado;

    ordenesService.actualizarOrdensDeServicio(orden).subscribe({
      next: (result) => {
        notificationHelpers.infoAlert(result?.mensaje);
      },
      error: (err) => errorHelpers.serverError(err),
    });


  };




  // Maneja la selección de un negocio
  const handleSelectBusiness = (neg: DTO_Negocio) => {
    setSelectedBusiness(neg);
  };

  // Maneja el avance de un item
  const handleCheckboxChange = (item: DTO_ItemOrdenServicio, checked: boolean) => {

    if (checked) {
      item.avance = 100;
    } else {
      item.avance = 0;
    }
    itemsOrdenesService
      .actualizarItemsOrdensDeServicio(item)
      .subscribe({
        next: (res) => {
          if (!(res as DTO_Respuesta).tipoRespuesta) {
            notificationHelpers.errorAlert((res as DTO_Respuesta).mensaje);
          }

        },
        error: (err) => errorHelpers.serverError(err),
        complete: () => setLoading(false),
      });

  };


  //#region websoket
  const getToken = () => localStorage.getItem("accesToken") || "";

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    abortedRef.current = false;

    const limpiarConexion = async () => {
      if (connectionRef.current) {
        connectionRef.current.off("RecibirNotificacion");
        try { await connectionRef.current.stop(); } catch {
          console.log('Error limpiando conexión');

        }
        connectionRef.current = null;
      }
    };




    const construirConexion = () =>
      new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:44330/hub/monitorOSHub", {
          accessTokenFactory: () => getToken(),
          withCredentials: true,
        })
        .configureLogging(signalR.LogLevel.None)
        .build();

    const extraerYRenovarToken = async (payloadText: string) => {
      const match = payloadText.match(/{.*}/s);
      if (!match) return false;
      try {
        const json = JSON.parse(match[0]);
        const nt = json?.resultado?.[0]?.accesToken;
        if (nt) {
          localStorage.setItem("accesToken", nt);
          console.info("🆕 Token renovado desde negociación SignalR");
          return true;
        }
      } catch {
        console.log('error estrayendo el token retornado');

      }
      return false;
    };

    const handleDisconnect = async (error?: Error) => {
      if (abortedRef.current) return;

      setEstadoConexion("Desconectado");
      notificationHelpers.errorAlert("Monitor desconectado");

      // Intentar renovar token si viene en el error
      if (error?.message.includes('"accesToken"')) {
        const renovado = await extraerYRenovarToken(error.message);
        if (renovado && !abortedRef.current) {
          // Pequeño retardo antes de reconectar
          await new Promise(r => setTimeout(r, 3000));
          return iniciarConexion();
        }
      }

      // Reintento normal
      if (!abortedRef.current) {
        // Usar retryTimeoutRef.current para almacenar el ID del timeout
        retryTimeoutRef.current = window.setTimeout(iniciarConexion, 3000);  // `setTimeout` devuelve un número en el navegador
      }
    };

    const handleMensaje = (msg: any) => {
      if (abortedRef.current) return;

      /* --- qué recibimos --- */
      if (isItemOrdenServicio(msg)) {
        //Aquí entra si es un item de orden de servicio
        setItems(prev => {
          const idx = prev.findIndex(
            i => i.iD_ItemOrdenServicio === msg.iD_ItemOrdenServicio
          );

          /* —— 1 · Eliminar si el estado es 19 —— */
          if (msg.estado?.iD_Estado === 19) {
            // si no existe, devolvemos el array tal cual
            return idx === -1 ? prev : prev.filter((_, i) => i !== idx);
          }

          /* —— 2 · Insertar o actualizar —— */
          return idx === -1
            ? [...prev, msg]                                           // insertar
            : prev.map(i =>                                            // actualizar
              i.iD_ItemOrdenServicio === msg.iD_ItemOrdenServicio
                ? { ...i, ...msg }
                : i
            );
        });

        notificationHelpers.infoAlert(`Ítem actualizado: ${msg.nombreItemOrdenServicio} de la Orden # ${msg.iD_OrdenServicio}`);

        //Aquí entra si es una orden de servicio
      } else if (isOrdenServicio(msg)) {
        console.log('ORDEN MODIFICADA');
        console.log(msg);


        setOrdenes(prev => {
          const idx = prev.findIndex(
            o => o.iD_OrdenServicio === msg.iD_OrdenServicio
          );

          /* —— 1 · Eliminar si el estado es 19 —— */
          if (msg.estado?.iD_Estado === 10) {
            // si no existe, devuelve el array original
            return idx === -1 ? prev : prev.filter((_, i) => i !== idx);
          }

          /* —— 2 · Insertar o actualizar —— */
          return idx === -1
            ? [...prev, msg]                               // insertar
            : prev.map(o =>                                // actualizar
              o.iD_OrdenServicio === msg.iD_OrdenServicio
                ? { ...o, ...msg }
                : o
            );
        });

        notificationHelpers.infoAlert(`Orden #${msg.iD_OrdenServicio} modificada`);
      } else {
        console.warn('Tipo desconocido', msg);
        notificationHelpers.infoAlert('📢 Nuevo mensaje');
      }


      if (Notification.permission === "granted") {
        new Notification("📢 Nuevo mensaje", { body: msg, silent: true });
      }
      audio.current.play().catch(() => { });
    };

    const handleReconnecting = () => {
      if (abortedRef.current) return;
      setEstadoConexion("Reconectando...");
      notificationHelpers.infoAlert("Conexión perdida, intentando reconectar...");
    };

    const handleReconnected = () => {
      if (abortedRef.current) return;
      setEstadoConexion("Conectado");
      notificationHelpers.successAlert("Reconectado al monitor");
    };

    const iniciarConexion = async () => {
      if (abortedRef.current || intentoRef.current) return;
      intentoRef.current = true;

      await limpiarConexion();
      if (abortedRef.current) { intentoRef.current = false; return; }

      const token = getToken();
      if (!token) {
        notificationHelpers.errorAlert("Token no disponible.");
        intentoRef.current = false;
        return;
      }

      const connection = construirConexion();
      connectionRef.current = connection;

      connection.on("RecibirNotificacion", handleMensaje);
      connection.onreconnecting(handleReconnecting);
      connection.onreconnected(handleReconnected);
      connection.onclose(handleDisconnect);

      try {
        await connection.start();
        if (abortedRef.current) { intentoRef.current = false; return; }
        setEstadoConexion("Conectado");
        notificationHelpers.successAlert("Monitor conectado");
      } catch (err: unknown) {
        // Primero, intentamos renovar token si aplica
        const texto = err instanceof Error ? err.message : String(err);
        const renovado = await extraerYRenovarToken(texto);
        if (renovado && !abortedRef.current) {
          await new Promise(r => setTimeout(r, 500));
          intentoRef.current = false;
          return iniciarConexion();
        }
        // Si no era token, o no pudimos renovar, manejamos desconexión
        await handleDisconnect(err instanceof Error ? err : undefined);
      } finally {
        intentoRef.current = false;
      }
    };

    iniciarConexion();

    return () => {
      abortedRef.current = true;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current); // Limpiar usando retryTimeoutRef.current
      }
      limpiarConexion().then(() => {
        setEstadoConexion("Desconectado");
        notificationHelpers.infoAlert("Monitor cerrado al salir de la vista");
      });
    };
  }, []);
  //#endregion

  //#region cargar monitor

  // 4. Cargar órdenes al seleccionar un negocio
  useEffect(() => {
    if (!selectedBusiness) return;
    setLoading(true);


    const sub = monitorService
      .cargarMonitorOrdenServicio(selectedBusiness)
      .subscribe({
        next: (res) => {
          setOrdenes(
            ((res as DTO_Respuesta).resultado[0] as DTO_OrdenServicio[]) || []
          )
          setItems(
            ((res as DTO_Respuesta).resultado[1] as DTO_ItemOrdenServicio[]) || []
          )
        },
        error: (err) => errorHelpers.serverError(err),
        complete: () => setLoading(false),
      });

    return () => sub.unsubscribe();
  }, [selectedBusiness]);

  //#endregion

  return (
    <div>
      <div className="row p-4 gx-0">
        <BusinessButtons
          title="Seleccione un negocio"
          selectedBusiness={selectedBusiness}
          handleSelectBusiness={handleSelectBusiness}
        />

        {loading && <LoadingPanel msj="Cargando, por favor espere..." />}

      </div>

      <div id="kt_content_container" className="container-xxl">



        <div className="d-flex flex-wrap flex-stack pt-10 pb-8">

          <h3 className="fw-bolder my-2">

            <span style={{ marginRight: '5px', marginBottom: '-5px' }} className={`badge badge-circle ${(estadoConexion === "Conectado") ? " badge-success" : " badge-danger"}`}> </span>
            Taller Mata
            <span className="fs-6 text-gray-400 fw-bold ms-1">

              {estadoConexion}</span>
          </h3>

        </div>


        <div className="tab-content">

          <div id="kt_project_targets_card_pane" className="tab-pane fade show active">

            <div className="row g-9">

              <div className="col-md-3 col-lg-12 col-xl-3">

                <div className="mb-9">
                  <div className="d-flex flex-stack">
                    <div className="fw-bolder fs-4">Ingreso<span className="fs-6 text-gray-400 ms-2">1</span></div>

                  </div>
                  <div className="h-3px w-100 bg-warning"></div>
                </div>


                {ordenes.filter(m => m.estado.iD_Estado == 6).map((m) => (


                  <div className="card mb-6 mb-xl-9" key={m.iD_OrdenServicio}>
                    <div className="card-body">
                      <div className="d-flex flex-stack mb-3">Entrega:

                        <FechaEntregaBadge
                          key={m.iD_OrdenServicio}
                          fechaEntrega={m.fechaEstimadaEntrega}
                          fechaCreacion={m.fechaOrdenServicio}
                        />

                        <div>
                          <button type="button" className="btn btn-sm btn-icon btn-color-light-dark btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                            <span className="svg-icon svg-icon-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                  <rect x="5" y="5" width="5" height="5" rx="1" fill="#000000" />
                                  <rect x="14" y="5" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                                  <rect x="5" y="14" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                                  <rect x="14" y="14" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                                </g>
                              </svg>
                            </span>
                          </button>
                          <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-bold w-200px py-3" data-kt-menu="true">
                            <div className="menu-item px-3">
                              <div className="menu-content text-muted pb-2 px-3 fs-7 text-uppercase">Payments</div>
                            </div>
                            <div className="menu-item px-3">
                              <a href="#" className="menu-link px-3">Create Invoice</a>
                            </div>
                            <div className="menu-item px-3">
                              <a href="#" className="menu-link flex-stack px-3">Create Payment
                                <i className="fas fa-exclamation-circle ms-2 fs-7" data-bs-toggle="tooltip" title="" data-bs-original-title="Specify a target name for future usage and reference" aria-label="Specify a target name for future usage and reference"></i></a>
                            </div>
                            <div className="menu-item px-3">
                              <a href="#" className="menu-link px-3">Generate Bill</a>
                            </div>
                            <div className="menu-item px-3" data-kt-menu-trigger="hover" data-kt-menu-placement="right-end" data-kt-menu-flip="bottom, top">
                              <a href="#" className="menu-link px-3">
                                <span className="menu-title">Subscription</span>
                                <span className="menu-arrow"></span>
                              </a>
                              <div className="menu-sub menu-sub-dropdown w-175px py-4">
                                <div className="menu-item px-3">
                                  <a href="#" className="menu-link px-3">Plans</a>
                                </div>
                                <div className="menu-item px-3">
                                  <a href="#" className="menu-link px-3">Billing</a>
                                </div>
                                <div className="menu-item px-3">
                                  <a href="#" className="menu-link px-3">Statements</a>
                                </div>
                                <div className="separator my-2"></div>
                                <div className="menu-item px-3">
                                  <div className="menu-content px-3">
                                    <label className="form-check form-switch form-check-custom form-check-solid">
                                      <input className="form-check-input w-30px h-20px" type="checkbox" value="1" name="notifications" />
                                      <span className="form-check-label text-muted fs-6">Recuring</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="menu-item px-3 my-1">
                              <a href="#" className="menu-link px-3">Settings</a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <a href="#" className="fs-4 fw-bolder mb-1 text-gray-900 text-hover-primary">Orden #{m.iD_OrdenServicio}</a>
                      </div>
                      <div className="fs-6 fw-bold text-gray-600 mb-5">
                        {m.referenciaJSON
                          .map(r => r.valor)
                          .join(', ')}
                      </div><div className="separator" style={{ marginBottom: '15px' }}></div>
                      {items.filter(i => i.iD_OrdenServicio == m.iD_OrdenServicio).map((item) => (
                        <div className="mb-2" key={item.iD_ItemOrdenServicio} >
                          <div className="form-check form-check-custom form-check-solid">
                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" checked={item.avance == 100} onChange={(e) => handleCheckboxChange(item, e.target.checked)} />
                            <label className="form-check-label" >{item.nombreItemOrdenServicio}</label>
                          </div>
                        </div>
                      ))}
                      <div className="separator" style={{ marginBottom: '15px' }}></div>
                      <p className="text-gray-700 py-3 fw-bold fw-6">{m.notaOrdenServicio}</p>
                      <div className="d-flex flex-stack flex-wrapr"><div className="symbol-group symbol-hover" style={{ marginLeft: '0' }}>

                        {m.estado.iD_Estado != 8 ? (
                          <div className="border border-dashed border-gray-300 rounded py-3 px-3 text-gray-600" onClick={() => cambiarEstadoOrdenServicio(m, 8)}>
                            <span className="svg-icon svg-icon-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pause-btn-fill" viewBox="0 0 16 16">
                                <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2m6.25-7C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5m3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5" />
                              </svg>
                            </span>
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-300 rounded py-3 px-3 text-gray-600" style={{ marginLeft: '5px' }} onClick={() => cambiarEstadoOrdenServicio(m, 7)}>
                            <span className="svg-icon svg-icon-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-play-btn-fill" viewBox="0 0 16 16">
                                <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2m6.79-6.907A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                              </svg>
                            </span>
                          </div>
                        )}
                      </div>

                        <div className="d-flex my-1" onClick={() => cambiarEstadoOrdenServicio(m, 7)}>

                          <div className="border border-dashed border-gray-300 rounded py-3 px-3 text-gray-600">
                            <span className="svg-icon svg-icon-3" >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-square-fill" viewBox="0 0 16 16">
                                <path d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1"></path>
                              </svg>
                            </span>

                          </div>
                        </div>
                      </div>


                    </div>
                  </div>

                ))}
              </div>
              <div className="col-md-3 col-lg-12 col-xl-3">
                <div className="mb-9">
                  <div className="d-flex flex-stack">
                    <div className="fw-bolder fs-4">En proceso<span className="fs-6 text-gray-400 ms-2">2</span></div>

                  </div>
                  <div className="h-3px w-100 bg-primary"></div>
                </div>

                {ordenes.filter(m => m.estado.iD_Estado == 7).map((m) => (

                  <div className="card mb-6 mb-xl-9" key={m.iD_OrdenServicio}>
                    <div className="card-body">
                      <div className="d-flex flex-stack mb-3">

                        Entrega:   <FechaEntregaBadge
                          key={m.iD_OrdenServicio}
                          fechaEntrega={m.fechaEstimadaEntrega}
                          fechaCreacion={m.fechaOrdenServicio}
                        />
                        <div>
                          <button type="button" className="btn btn-sm btn-icon btn-color-light-dark btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                            <span className="svg-icon svg-icon-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                  <rect x="5" y="5" width="5" height="5" rx="1" fill="#000000" />
                                  <rect x="14" y="5" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                                  <rect x="5" y="14" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                                  <rect x="14" y="14" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                                </g>
                              </svg>

                            </span>
                          </button>
                          <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-bold w-200px py-3" data-kt-menu="true">
                            <div className="menu-item px-3">
                              <div className="menu-content text-muted pb-2 px-3 fs-7 text-uppercase">Payments</div>
                            </div>
                            <div className="menu-item px-3">
                              <a href="#" className="menu-link px-3">Create Invoice</a>
                            </div>
                            <div className="menu-item px-3">
                              <a href="#" className="menu-link flex-stack px-3">Create Payment
                                <i className="fas fa-exclamation-circle ms-2 fs-7" data-bs-toggle="tooltip" title="" data-bs-original-title="Specify a target name for future usage and reference" aria-label="Specify a target name for future usage and reference"></i></a>
                            </div>
                            <div className="menu-item px-3">
                              <a href="#" className="menu-link px-3">Generate Bill</a>
                            </div>
                            <div className="menu-item px-3" data-kt-menu-trigger="hover" data-kt-menu-placement="right-end" data-kt-menu-flip="bottom, top">
                              <a href="#" className="menu-link px-3">
                                <span className="menu-title">Subscription</span>
                                <span className="menu-arrow"></span>
                              </a>
                              <div className="menu-sub menu-sub-dropdown w-175px py-4">
                                <div className="menu-item px-3">
                                  <a href="#" className="menu-link px-3">Plans</a>
                                </div>
                                <div className="menu-item px-3">
                                  <a href="#" className="menu-link px-3">Billing</a>
                                </div>
                                <div className="menu-item px-3">
                                  <a href="#" className="menu-link px-3">Statements</a>
                                </div>
                                <div className="separator my-2"></div>
                                <div className="menu-item px-3">
                                  <div className="menu-content px-3">
                                    <label className="form-check form-switch form-check-custom form-check-solid">
                                      <input className="form-check-input w-30px h-20px" type="checkbox" value="1" name="notifications" />
                                      <span className="form-check-label text-muted fs-6">Recuring</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="menu-item px-3 my-1">
                              <a href="#" className="menu-link px-3">Settings</a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <a href="#" className="fs-4 fw-bolder mb-1 text-gray-900 text-hover-primary">Orden #{m.iD_OrdenServicio}</a>
                      </div>
                      <div className="fs-6 fw-bold text-gray-600 mb-5">
                        {m.referenciaJSON
                          .map(r => r.valor)
                          .join(', ')}</div><div className="separator" style={{ marginBottom: '15px' }}></div>
                      {items.filter(i => i.iD_OrdenServicio == m.iD_OrdenServicio).map((item) => (
                        <div className="mb-2" key={item.iD_ItemOrdenServicio} >
                          <div className="form-check form-check-custom form-check-solid">
                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" checked={item.avance == 100} onChange={(e) => handleCheckboxChange(item, e.target.checked)} />
                            <label className="form-check-label" >{item.nombreItemOrdenServicio}</label>
                          </div>
                        </div>
                      ))}
                                            <div className="separator" style={{ marginBottom: '15px' }}></div>
                      <p className="text-gray-700 py-3 fw-bold fw-6">{m.notaOrdenServicio}</p>
                      <div className="d-flex flex-stack flex-wrapr"><div className="symbol-group symbol-hover" style={{ marginLeft: '0' }}>

                        {m.estado.iD_Estado != 8 ? (
                          <div className="border border-dashed border-gray-300 rounded py-3 px-3 text-gray-600" onClick={() => cambiarEstadoOrdenServicio(m, 8)}>
                            <span className="svg-icon svg-icon-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pause-btn-fill" viewBox="0 0 16 16">
                                <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2m6.25-7C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5m3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5" />
                              </svg>
                            </span>
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-300 rounded py-3 px-3 text-gray-600" style={{ marginLeft: '5px' }} onClick={() => cambiarEstadoOrdenServicio(m, 7)}>
                            <span className="svg-icon svg-icon-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-play-btn-fill" viewBox="0 0 16 16">
                                <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2m6.79-6.907A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                              </svg>
                            </span>
                          </div>
                        )}
                      </div>

                        <div className="d-flex my-1" onClick={() => cambiarEstadoOrdenServicio(m, 9)} >

                          <div className="border border-dashed border-gray-300 rounded py-3 px-3 text-gray-600">
                            <span className="svg-icon svg-icon-3" >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-square-fill" viewBox="0 0 16 16">
                                <path d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1"></path>
                              </svg>
                            </span>

                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}

                {/* <div className="card mb-6 mb-xl-9">
                
                  <div className="card-body">
                    <div className="d-flex flex-stack mb-3">
                      <div className="badge badge-light">Jueves 5 de junio</div>
                      <div>
                        <button type="button" className="btn btn-sm btn-icon btn-color-light-dark btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                          <span className="svg-icon svg-icon-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <rect x="5" y="5" width="5" height="5" rx="1" fill="#000000" />
                                <rect x="14" y="5" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                                <rect x="5" y="14" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                                <rect x="14" y="14" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                              </g>
                            </svg>

                          </span>
                        </button>
                        <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-bold w-200px py-3" data-kt-menu="true">
                          <div className="menu-item px-3">
                            <div className="menu-content text-muted pb-2 px-3 fs-7 text-uppercase">Payments</div>
                          </div>
                          <div className="menu-item px-3">
                            <a href="#" className="menu-link px-3">Create Invoice</a>
                          </div>
                          <div className="menu-item px-3">
                            <a href="#" className="menu-link flex-stack px-3">Create Payment
                              <i className="fas fa-exclamation-circle ms-2 fs-7" data-bs-toggle="tooltip" title="" data-bs-original-title="Specify a target name for future usage and reference" aria-label="Specify a target name for future usage and reference"></i></a>
                          </div>
                          <div className="menu-item px-3">
                            <a href="#" className="menu-link px-3">Generate Bill</a>
                          </div>
                          <div className="menu-item px-3" data-kt-menu-trigger="hover" data-kt-menu-placement="right-end" data-kt-menu-flip="bottom, top">
                            <a href="#" className="menu-link px-3">
                              <span className="menu-title">Subscription</span>
                              <span className="menu-arrow"></span>
                            </a>
                            <div className="menu-sub menu-sub-dropdown w-175px py-4">
                              <div className="menu-item px-3">
                                <a href="#" className="menu-link px-3">Plans</a>
                              </div>
                              <div className="menu-item px-3">
                                <a href="#" className="menu-link px-3">Billing</a>
                              </div>
                              <div className="menu-item px-3">
                                <a href="#" className="menu-link px-3">Statements</a>
                              </div>
                              <div className="separator my-2"></div>
                              <div className="menu-item px-3">
                                <div className="menu-content px-3">
                                  <label className="form-check form-switch form-check-custom form-check-solid">
                                    <input className="form-check-input w-30px h-20px" type="checkbox" value="1" name="notifications" />
                                    <span className="form-check-label text-muted fs-6">Recuring</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="menu-item px-3 my-1">
                            <a href="#" className="menu-link px-3">Settings</a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <a href="#" className="fs-4 fw-bolder mb-1 text-gray-900 text-hover-primary">Julanito</a>
                    </div>
                    <div className="fs-6 fw-bold text-gray-600 mb-5">Lambo, AGV123, 2026</div><div className="separator" style={{ marginBottom: '15px' }}></div>
                    <div className="mb-2">
                      <div className="form-check form-check-custom form-check-solid">
                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                        <label className="form-check-label" >Oberjol</label>
                      </div>
                    </div><div className="mb-2">
                      <div className="form-check form-check-custom form-check-solid">
                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                        <label className="form-check-label" >Instalar Cut-Out</label>
                      </div>
                    </div><div className="mb-2">
                      <div className="form-check form-check-custom form-check-solid">
                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                        <label className="form-check-label" >Rellenado de Coolant</label>
                      </div>
                    </div>
                    <div className="d-flex flex-stack flex-wrapr"><div className="symbol-group symbol-hover" style={{ marginLeft: '0' }}>
                      <div className="border border-dashed border-gray-300 rounded py-3 px-3">
                        <i className="bi bi-check2-square fs-1x" style={{ fontSize: '1.5rem' }}></i>

                        <span className="ms-1 fs-7 fw-bolder text-gray-600">2</span>
                      </div><div className="border border-dashed border-gray-300 rounded py-3 px-3" style={{ marginLeft: '5px' }}>
                        <span className="svg-icon svg-icon-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path opacity="0.3" d="M20 3H4C2.89543 3 2 3.89543 2 5V16C2 17.1046 2.89543 18 4 18H4.5C5.05228 18 5.5 18.4477 5.5 19V21.5052C5.5 22.1441 6.21212 22.5253 6.74376 22.1708L11.4885 19.0077C12.4741 18.3506 13.6321 18 14.8167 18H20C21.1046 18 22 17.1046 22 16V5C22 3.89543 21.1046 3 20 3Z" fill="black"></path>
                            <rect x="6" y="12" width="7" height="2" rx="1" fill="black"></rect>
                            <rect x="6" y="7" width="12" height="2" rx="1" fill="black"></rect>
                          </svg>
                        </span>
                        <span className="ms-1 fs-7 fw-bolder text-gray-600">0</span>
                      </div>

                    </div>

                      <div className="d-flex my-1">

                        <div className="border border-dashed border-gray-300 rounded py-3 px-3 text-gray-600">
                          <span className="svg-icon svg-icon-3" >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-square-fill" viewBox="0 0 16 16">
                              <path d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1"></path>
                            </svg>
                          </span>

                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}


              </div>
              <div className="col-md-3 col-lg-12 col-xl-3">
                <div className="mb-9">
                  <div className="d-flex flex-stack">
                    <div className="fw-bolder fs-4">Completado<span className="fs-6 text-gray-400 ms-2">1</span></div>

                  </div>
                  <div className="h-3px w-100 bg-success"></div>
                </div>

                {ordenes.filter(m => m.estado.iD_Estado == 9).map((m) => (
                  <div className="card mb-6 mb-xl-9" key={m.iD_OrdenServicio}>
                    <div className="card-body">
                      <div className="d-flex flex-stack mb-3">

                        Entrega:   <FechaEntregaBadge
                          key={m.iD_OrdenServicio}
                          fechaEntrega={m.fechaEstimadaEntrega}
                          fechaCreacion={m.fechaOrdenServicio} />


                        <div>
                          <button type="button" className="btn btn-sm btn-icon btn-color-light-dark btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                            <span className="svg-icon svg-icon-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                  <rect x="5" y="5" width="5" height="5" rx="1" fill="#000000" />
                                  <rect x="14" y="5" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                                  <rect x="5" y="14" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                                  <rect x="14" y="14" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                                </g>
                              </svg>

                            </span>
                          </button>
                          <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-bold w-200px py-3" data-kt-menu="true">
                            <div className="menu-item px-3">
                              <div className="menu-content text-muted pb-2 px-3 fs-7 text-uppercase">Payments</div>
                            </div>
                            <div className="menu-item px-3">
                              <a href="#" className="menu-link px-3">Create Invoice</a>
                            </div>
                            <div className="menu-item px-3">
                              <a href="#" className="menu-link flex-stack px-3">Create Payment
                                <i className="fas fa-exclamation-circle ms-2 fs-7" data-bs-toggle="tooltip" title="" data-bs-original-title="Specify a target name for future usage and reference" aria-label="Specify a target name for future usage and reference"></i></a>
                            </div>
                            <div className="menu-item px-3">
                              <a href="#" className="menu-link px-3">Generate Bill</a>
                            </div>
                            <div className="menu-item px-3" data-kt-menu-trigger="hover" data-kt-menu-placement="right-end" data-kt-menu-flip="bottom, top">
                              <a href="#" className="menu-link px-3">
                                <span className="menu-title">Subscription</span>
                                <span className="menu-arrow"></span>
                              </a>
                              <div className="menu-sub menu-sub-dropdown w-175px py-4">
                                <div className="menu-item px-3">
                                  <a href="#" className="menu-link px-3">Plans</a>
                                </div>
                                <div className="menu-item px-3">
                                  <a href="#" className="menu-link px-3">Billing</a>
                                </div>
                                <div className="menu-item px-3">
                                  <a href="#" className="menu-link px-3">Statements</a>
                                </div>
                                <div className="separator my-2"></div>
                                <div className="menu-item px-3">
                                  <div className="menu-content px-3">
                                    <label className="form-check form-switch form-check-custom form-check-solid">
                                      <input className="form-check-input w-30px h-20px" type="checkbox" value="1" name="notifications" />
                                      <span className="form-check-label text-muted fs-6">Recuring</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="menu-item px-3 my-1">
                              <a href="#" className="menu-link px-3">Settings</a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <a href="#" className="fs-4 fw-bolder mb-1 text-gray-900 text-hover-primary">Orden #{m.iD_OrdenServicio}</a>
                      </div>
                      <div className="fs-6 fw-bold text-gray-600 mb-5">
                        {m.referenciaJSON
                          .map(r => r.valor)
                          .join(', ')}</div><div className="separator" style={{ marginBottom: '15px' }}></div>

                      {items.filter(i => i.iD_OrdenServicio == m.iD_OrdenServicio).map((item) => (
                        <div className="mb-2" key={item.iD_ItemOrdenServicio} >
                          <div className="form-check form-check-custom form-check-solid">
                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" checked={item.avance == 100} onChange={(e) => handleCheckboxChange(item, e.target.checked)} />
                            <label className="form-check-label" >{item.nombreItemOrdenServicio}</label>
                          </div>
                        </div>
                      ))}
                      <div className="separator" style={{ marginBottom: '15px' }}></div>
                      <p className="text-gray-700 py-3 fw-bold fw-6">{m.notaOrdenServicio}</p>
                      <div className="d-flex flex-stack flex-wrapr"><div className="symbol-group symbol-hover" style={{ marginLeft: '0' }} >

                        {m.estado.iD_Estado != 8 ? (
                          <div className="border border-dashed border-gray-300 rounded py-3 px-3 text-gray-600" onClick={() => cambiarEstadoOrdenServicio(m, 8)}>
                            <span className="svg-icon svg-icon-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pause-btn-fill" viewBox="0 0 16 16">
                                <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2m6.25-7C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5m3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5" />
                              </svg>
                            </span>
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-300 rounded py-3 px-3 text-gray-600" style={{ marginLeft: '5px' }} onClick={() => cambiarEstadoOrdenServicio(m, 7)}>
                            <span className="svg-icon svg-icon-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-play-btn-fill" viewBox="0 0 16 16">
                                <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2m6.79-6.907A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                              </svg>
                            </span>
                          </div>
                        )}
                      </div>

                        <div className="d-flex my-1">

                          <div className="border border-dashed border-gray-300 rounded py-3 px-3 text-gray-600">
                            <span className="svg-icon svg-icon-3" >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-square-fill" viewBox="0 0 16 16">
                                <path d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1"></path>
                              </svg>
                            </span>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
              <div className="col-md-3 col-lg-12 col-xl-3">
                <div className="mb-9">
                  <div className="d-flex flex-stack">
                    <div className="fw-bolder fs-4">En Pausa<span className="fs-6 text-gray-400 ms-2">1</span></div>

                  </div>
                  <div className="h-3px w-100 bg-info"></div>
                </div>
                {ordenes.filter(m => m.estado.iD_Estado == 8).map((m) => (
                  <div className="card mb-6 mb-xl-9" key={m.iD_OrdenServicio}>
                    <div className="card-body">
                      <div className="d-flex flex-stack mb-3">

                        Entrega:   <FechaEntregaBadge
                          key={m.iD_OrdenServicio}
                          fechaEntrega={m.fechaEstimadaEntrega}
                          fechaCreacion={m.fechaOrdenServicio} />
                        <div>
                          <button type="button" className="btn btn-sm btn-icon btn-color-light-dark btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                            <span className="svg-icon svg-icon-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                  <rect x="5" y="5" width="5" height="5" rx="1" fill="#000000" />
                                  <rect x="14" y="5" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                                  <rect x="5" y="14" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                                  <rect x="14" y="14" width="5" height="5" rx="1" fill="#000000" opacity="0.3" />
                                </g>
                              </svg>

                            </span>
                          </button>
                          <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-bold w-200px py-3" data-kt-menu="true">
                            <div className="menu-item px-3">
                              <div className="menu-content text-muted pb-2 px-3 fs-7 text-uppercase">Payments</div>
                            </div>
                            <div className="menu-item px-3">
                              <a href="#" className="menu-link px-3">Create Invoice</a>
                            </div>
                            <div className="menu-item px-3">
                              <a href="#" className="menu-link flex-stack px-3">Create Payment
                                <i className="fas fa-exclamation-circle ms-2 fs-7" data-bs-toggle="tooltip" title="" data-bs-original-title="Specify a target name for future usage and reference" aria-label="Specify a target name for future usage and reference"></i></a>
                            </div>
                            <div className="menu-item px-3">
                              <a href="#" className="menu-link px-3">Generate Bill</a>
                            </div>
                            <div className="menu-item px-3" data-kt-menu-trigger="hover" data-kt-menu-placement="right-end" data-kt-menu-flip="bottom, top">
                              <a href="#" className="menu-link px-3">
                                <span className="menu-title">Subscription</span>
                                <span className="menu-arrow"></span>
                              </a>
                              <div className="menu-sub menu-sub-dropdown w-175px py-4">
                                <div className="menu-item px-3">
                                  <a href="#" className="menu-link px-3">Plans</a>
                                </div>
                                <div className="menu-item px-3">
                                  <a href="#" className="menu-link px-3">Billing</a>
                                </div>
                                <div className="menu-item px-3">
                                  <a href="#" className="menu-link px-3">Statements</a>
                                </div>
                                <div className="separator my-2"></div>
                                <div className="menu-item px-3">
                                  <div className="menu-content px-3">
                                    <label className="form-check form-switch form-check-custom form-check-solid">
                                      <input className="form-check-input w-30px h-20px" type="checkbox" value="1" name="notifications" />
                                      <span className="form-check-label text-muted fs-6">Recuring</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="menu-item px-3 my-1">
                              <a href="#" className="menu-link px-3">Settings</a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <a href="#" className="fs-4 fw-bolder mb-1 text-gray-900 text-hover-primary">Orden #{m.iD_OrdenServicio}</a>
                      </div>
                      <div className="fs-6 fw-bold text-gray-600 mb-5">
                        {m.referenciaJSON
                          .map(r => r.valor)
                          .join(', ')}</div><div className="separator" style={{ marginBottom: '15px' }}></div>
                      {items.filter(i => i.iD_OrdenServicio == m.iD_OrdenServicio).map((item) => (
                        <div className="mb-2" key={item.iD_ItemOrdenServicio} >
                          <div className="form-check form-check-custom form-check-solid">
                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" checked={item.avance == 100} onChange={(e) => handleCheckboxChange(item, e.target.checked)} />
                            <label className="form-check-label" >{item.nombreItemOrdenServicio}</label>
                          </div>
                        </div>
                      ))}
                      <div className="separator" style={{ marginBottom: '15px' }}></div>
                      <p className="text-gray-700 py-3 fw-bold fw-6">{m.notaOrdenServicio}</p>
                      <div className="d-flex flex-stack flex-wrapr"><div className="symbol-group symbol-hover" style={{ marginLeft: '0' }}>

                        {m.estado.iD_Estado != 8 ? (
                          <div className="border border-dashed border-gray-300 rounded py-3 px-3 text-gray-600" onClick={() => cambiarEstadoOrdenServicio(m, 8)}>
                            <span className="svg-icon svg-icon-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pause-btn-fill" viewBox="0 0 16 16">
                                <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2m6.25-7C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5m3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5" />
                              </svg>
                            </span>
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-300 rounded py-3 px-3 text-gray-600" style={{ marginLeft: '5px' }} onClick={() => cambiarEstadoOrdenServicio(m, 7)}>
                            <span className="svg-icon svg-icon-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-play-btn-fill" viewBox="0 0 16 16">
                                <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2m6.79-6.907A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                              </svg>
                            </span>
                          </div>
                        )}
                      </div>

                        <div className="d-flex my-1">

                          <div className="border border-dashed border-gray-300 rounded py-3 px-3 text-gray-600">
                            <span className="svg-icon svg-icon-3" >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-square-fill" viewBox="0 0 16 16">
                                <path d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1"></path>
                              </svg>
                            </span>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}


              </div>
            </div>
          </div>
          <div id="kt_project_targets_table_pane" className="tab-pane fade">
            <div className="card card-flush">
              <div className="card-body pt-3">
                <div id="kt_profile_overview_table_wrapper" className="dataTables_wrapper dt-bootstrap4 no-footer"><div className="table-responsive"><table id="kt_profile_overview_table" className="table table-row-bordered table-row-dashed gy-4 align-middle fw-bolder dataTable no-footer" role="grid">
                  <thead className="fs-7 text-gray-400 text-uppercase">
                    <tr role="row"><th className="min-w-250px sorting" aria-controls="kt_profile_overview_table" rowSpan={1} colSpan={1} aria-label="Target: activate to sort column ascending" style={{ width: "0px" }}>Target</th><th className="min-w-90px sorting" aria-controls="kt_profile_overview_table" rowSpan={1} colSpan={1} aria-label="Section: activate to sort column ascending" style={{ width: "0px" }}>Section</th><th className="min-w-150px sorting" aria-controls="kt_profile_overview_table" rowSpan={1} colSpan={1} aria-label="Due Date: activate to sort column ascending" style={{ width: "0px" }}>Due Date</th><th className="min-w-90px sorting" aria-controls="kt_profile_overview_table" rowSpan={1} colSpan={1} aria-label="Members: activate to sort column ascending" style={{ width: "0px" }}>Members</th><th className="min-w-90px sorting" aria-controls="kt_profile_overview_table" rowSpan={1} colSpan={1} aria-label="Status: activate to sort column ascending" style={{ width: "0px" }}>Status</th><th className="min-w-50px sorting" aria-controls="kt_profile_overview_table" rowSpan={1} colSpan={1} aria-label=": activate to sort column ascending" style={{ width: "0px" }}></th></tr>
                  </thead>
                  <tbody className="fs-6">









                    <tr className="odd">
                      <td className="fw-bolder">
                        <a href="#" className="text-gray-900 text-hover-primary">Meeting with customer</a>
                      </td>
                      <td data-order="Invalid date">
                        <span className="badge badge-light fw-bold me-auto">UI Design</span>
                      </td>
                      <td>Aug 14, 2020</td>
                      <td>
                        <div className="symbol-group symbol-hover fs-8">
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Melody Macy">
                            <img alt="Pic" src="assets/media/avatars/150-3.jpg" />
                          </div>
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="John Mixin">
                            <img alt="Pic" src="assets/media/avatars/150-11.jpg" />
                          </div>
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Susan Redwood">
                            <span className="symbol-label bg-primary text-inverse-primary fw-bolder">S</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-light-primary fw-bolder me-auto">In Progress</span>
                      </td>
                      <td className="text-end">
                        <a href="#" className="btn btn-bg-light btn-active-color-primary btn-sm">View</a>
                      </td>
                    </tr><tr className="even">
                      <td className="fw-bolder">
                        <a href="#" className="text-gray-900 text-hover-primary">User Module Testing</a>
                      </td>
                      <td data-order="Invalid date">
                        <span className="badge badge-light fw-bold me-auto">Phase 2.6 QA</span>
                      </td>
                      <td>Mar 24, 2020</td>
                      <td>
                        <div className="symbol-group symbol-hover fs-8">
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Alan Warden">
                            <span className="symbol-label bg-warning text-inverse-warning fw-bolder">A</span>
                          </div>
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Robin Watterman">
                            <span className="symbol-label bg-success text-inverse-success fw-bolder">R</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-light-success fw-bolder me-auto">Completed</span>
                      </td>
                      <td className="text-end">
                        <a href="#" className="btn btn-bg-light btn-active-color-primary btn-sm">View</a>
                      </td>
                    </tr><tr className="odd">
                      <td className="fw-bolder">
                        <a href="#" className="text-gray-900 text-hover-primary">Sales report page</a>
                      </td>
                      <td data-order="Invalid date">
                        <span className="badge badge-light fw-bold me-auto">QA</span>
                      </td>
                      <td>Feb 20, 2020</td>
                      <td>
                        <div className="symbol-group symbol-hover fs-8">
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Melody Macy">
                            <img alt="Pic" src="assets/media/avatars/150-3.jpg" />
                          </div>
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Kristen Goodwin">
                            <img alt="Pic" src="assets/media/avatars/150-8.jpg" />
                          </div>
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Mikaela Collins">
                            <span className="symbol-label bg-info text-inverse-info fw-bolder">M</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-light fw-bolder me-auto">Yet to start</span>
                      </td>
                      <td className="text-end">
                        <a href="#" className="btn btn-bg-light btn-active-color-primary btn-sm">View</a>
                      </td>
                    </tr><tr className="even">
                      <td className="fw-bolder">
                        <a href="#" className="text-gray-900 text-hover-primary">Meeting with customer</a>
                      </td>
                      <td data-order="Invalid date">
                        <span className="badge badge-light fw-bold me-auto">Prototype</span>
                      </td>
                      <td>Nov 15, 2020</td>
                      <td>
                        <div className="symbol-group symbol-hover fs-8">
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Robin Watterman">
                            <span className="symbol-label bg-success text-inverse-success fw-bolder">R</span>
                          </div>
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Brian Cox">
                            <img alt="Pic" src="assets/media/avatars/150-4.jpg" />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-light-success fw-bolder me-auto">Completed</span>
                      </td>
                      <td className="text-end">
                        <a href="#" className="btn btn-bg-light btn-active-color-primary btn-sm">View</a>
                      </td>
                    </tr><tr className="odd">
                      <td className="fw-bolder">
                        <a href="#" className="text-gray-900 text-hover-primary">Design main Dashboard</a>
                      </td>
                      <td data-order="Invalid date">
                        <span className="badge badge-light fw-bold me-auto">UI Design</span>
                      </td>
                      <td>Dec 2, 2020</td>
                      <td>
                        <div className="symbol-group symbol-hover fs-8">
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Melody Macy">
                            <img alt="Pic" src="assets/media/avatars/150-3.jpg" />
                          </div>
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Emma Smith">
                            <img alt="Pic" src="assets/media/avatars/150-1.jpg" />
                          </div>
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Lucy Matthews">
                            <img alt="Pic" src="assets/media/avatars/150-10.jpg" />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-light-success fw-bolder me-auto">Completed</span>
                      </td>
                      <td className="text-end">
                        <a href="#" className="btn btn-bg-light btn-active-color-primary btn-sm">View</a>
                      </td>
                    </tr><tr className="even">
                      <td className="fw-bolder">
                        <a href="#" className="text-gray-900 text-hover-primary">User Module Testing</a>
                      </td>
                      <td data-order="Invalid date">
                        <span className="badge badge-light fw-bold me-auto">Development</span>
                      </td>
                      <td>Oct 18, 2020</td>
                      <td>
                        <div className="symbol-group symbol-hover fs-8">
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Francis Mitcham">
                            <img alt="Pic" src="assets/media/avatars/150-5.jpg" />
                          </div>
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Deanna Taylor">
                            <img alt="Pic" src="assets/media/avatars/150-6.jpg" />
                          </div>
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Mikaela Collins">
                            <span className="symbol-label bg-info text-inverse-info fw-bolder">M</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-light-primary fw-bolder me-auto">In Progress</span>
                      </td>
                      <td className="text-end">
                        <a href="#" className="btn btn-bg-light btn-active-color-primary btn-sm">View</a>
                      </td>
                    </tr><tr className="odd">
                      <td className="fw-bolder">
                        <a href="#" className="text-gray-900 text-hover-primary">To check User Management</a>
                      </td>
                      <td data-order="Invalid date">
                        <span className="badge badge-light fw-bold me-auto">Pahse 3.2</span>
                      </td>
                      <td>Oct 17, 2020</td>
                      <td>
                        <div className="symbol-group symbol-hover fs-8">
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Lucy Matthews">
                            <img alt="Pic" src="assets/media/avatars/150-10.jpg" />
                          </div>
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Kristen Goodwin">
                            <img alt="Pic" src="assets/media/avatars/150-8.jpg" />
                          </div>
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Michelle Swanston">
                            <img alt="Pic" src="assets/media/avatars/150-13.jpg" />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-light fw-bolder me-auto">Yet to start</span>
                      </td>
                      <td className="text-end">
                        <a href="#" className="btn btn-bg-light btn-active-color-primary btn-sm">View</a>
                      </td>
                    </tr><tr className="even">
                      <td className="fw-bolder">
                        <a href="#" className="text-gray-900 text-hover-primary">Create Roles Module</a>
                      </td>
                      <td data-order="Invalid date">
                        <span className="badge badge-light fw-bold me-auto">Branding</span>
                      </td>
                      <td>Jun 16, 2020</td>
                      <td>
                        <div className="symbol-group symbol-hover fs-8">
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Michelle Swanston">
                            <img alt="Pic" src="assets/media/avatars/150-13.jpg" />
                          </div>
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Robin Watterman">
                            <span className="symbol-label bg-success text-inverse-success fw-bolder">R</span>
                          </div>
                          <div className="symbol symbol-25px symbol-circle" data-bs-toggle="tooltip" title="" data-bs-original-title="Alan Warden">
                            <span className="symbol-label bg-warning text-inverse-warning fw-bolder">A</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-light fw-bolder me-auto">Yet to start</span>
                      </td>
                      <td className="text-end">
                        <a href="#" className="btn btn-bg-light btn-active-color-primary btn-sm">View</a>
                      </td>
                    </tr></tbody>
                </table></div><div className="row"><div className="col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start"></div><div className="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end"></div></div></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};