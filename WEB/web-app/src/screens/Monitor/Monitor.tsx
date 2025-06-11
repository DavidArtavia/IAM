import React, { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import sonidoMonitor from "../../assets/media/audios/Monitor.mp3";
import { notificationHelpers } from "@/utils"

export const Monitor = () => {
  const [mensajes, setMensajes] = useState<string[]>([]);
  const [estadoConexion, setEstadoConexion] = useState("Desconectado");
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const audio = useRef(new Audio(sonidoMonitor)); // evitar crear múltiples instancias
  const token = localStorage.getItem("accesToken");
  // Solicitar permiso para notificaciones una sola vez
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

 useEffect(() => {
  let connection: signalR.HubConnection;

  const iniciarConexion = async () => {
    
    if (!token) {
      console.warn("⚠️ Token no disponible.");
      return;
    }

    // Detener conexión previa si existe
    if (connectionRef.current) {
      console.log("🔁 Deteniendo conexión previa...");
      await connectionRef.current.stop();
      connectionRef.current = null;
    }

    connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:44330/hub/monitorOSHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    const onMensaje = (mensaje: string) => {
      setMensajes((prev) => [...prev, mensaje]);
      notificationHelpers.infoAlert("Orden de servicio modificada");

      if (Notification.permission === "granted") {
        new Notification("📢 Nuevo mensaje", {
          body: mensaje,
          icon: "/assets/media/icons/ni.ico",
          silent: true
        });
      }

      audio.current.play().catch((err) => {
        console.warn("🔇 No se pudo reproducir el audio:", err);
      });
    };

    connection.on("RecibirNotificacion", onMensaje);

    connection.onreconnecting(() => {setEstadoConexion("Reconectando..."); notificationHelpers.infoAlert("Monitor desconectado");});
    connection.onreconnected(() => {setEstadoConexion("Conectado"); notificationHelpers.successAlert(`Monitor Conectado`);});
    connection.onclose(() => {setEstadoConexion("Desconectado"); notificationHelpers.infoAlert("Monitor desconectado"); });
  
    try {
      await connection.start();
      notificationHelpers.successAlert(`Monitor Conectado`);
      setEstadoConexion("Conectado");
    } catch (err: any) {
      
      setEstadoConexion("Error");

      if (err.name === "AbortError") {
        setTimeout(() => iniciarConexion(), 1500);
      }
    }
  };

  iniciarConexion();

  // Cleanup al desmontar la vista
  return () => {
    if (connectionRef.current) {
      
      connectionRef.current.stop().then(() => {
        connectionRef.current = null;
        setEstadoConexion("Desconectado");
      });
    }
  };
}, []);

  return (
    <div id="kt_content_container" className="container-xxl">

      <div className="d-flex flex-wrap flex-stack pt-10 pb-8">

        <h3 className="fw-bolder my-2">
          
          <span style={{marginRight: '5px',marginBottom: '-5px'}} className={`badge badge-circle ${(estadoConexion === "Conectado") ? " badge-success" : " badge-danger"}`}> </span>
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

              <div className="card mb-6 mb-xl-9">
                <div className="card-body">
                  <div className="d-flex flex-stack mb-3">
                    <div className="badge badge-light-warning">Jueves 5 de junio</div>
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
                    <a href="#" className="fs-4 fw-bolder mb-1 text-gray-900 text-hover-primary">Juanito Mora</a>
                  </div>
                  <div className="fs-6 fw-bold text-gray-600 mb-5">Ford Mustang, AGV5877, 2025</div><div className="separator" style={{ marginBottom: '15px' }}></div>
                  <div className="mb-2">
                    <div className="form-check form-check-custom form-check-solid">
                      <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                      <label className="form-check-label" >Cambio Aseite</label>
                    </div>
                  </div><div className="mb-2">
                    <div className="form-check form-check-custom form-check-solid">
                      <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                      <label className="form-check-label" >Cambio de filtro</label>
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

                      <span className="ms-1 fs-7 fw-bolder text-gray-600">8</span>
                    </div><div className="border border-dashed border-gray-300 rounded py-3 px-3" style={{ marginLeft: '5px' }}>
                      <span className="svg-icon svg-icon-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path opacity="0.3" d="M20 3H4C2.89543 3 2 3.89543 2 5V16C2 17.1046 2.89543 18 4 18H4.5C5.05228 18 5.5 18.4477 5.5 19V21.5052C5.5 22.1441 6.21212 22.5253 6.74376 22.1708L11.4885 19.0077C12.4741 18.3506 13.6321 18 14.8167 18H20C21.1046 18 22 17.1046 22 16V5C22 3.89543 21.1046 3 20 3Z" fill="black"></path>
                          <rect x="6" y="12" width="7" height="2" rx="1" fill="black"></rect>
                          <rect x="6" y="7" width="12" height="2" rx="1" fill="black"></rect>
                        </svg>
                      </span>
                      <span className="ms-1 fs-7 fw-bolder text-gray-600">4</span>
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
              </div>


            </div>
            <div className="col-md-3 col-lg-12 col-xl-3">
              <div className="mb-9">
                <div className="d-flex flex-stack">
                  <div className="fw-bolder fs-4">En proceso<span className="fs-6 text-gray-400 ms-2">2</span></div>

                </div>
                <div className="h-3px w-100 bg-primary"></div>
              </div>


              <div className="card mb-6 mb-xl-9">
                <div className="card-body">
                  <div className="d-flex flex-stack mb-3">
                    <div className="badge badge-light-danger">Miercoles 25 de abril</div>
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
                    <a href="#" className="fs-4 fw-bolder mb-1 text-gray-900 text-hover-primary">Danny Cantillano</a>
                  </div>
                  <div className="fs-6 fw-bold text-gray-600 mb-5">Geely Coolray, CCJ844, 2025</div><div className="separator" style={{ marginBottom: '15px' }}></div>
                  <div className="mb-2">
                    <div className="form-check form-check-custom form-check-solid">
                      <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                      <label className="form-check-label" >Cambio Aseite</label>
                    </div>
                  </div><div className="mb-2">
                    <div className="form-check form-check-custom form-check-solid">
                      <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                      <label className="form-check-label" >Cambio de filtro</label>
                    </div>
                  </div>
                  <div className="d-flex flex-stack flex-wrapr"><div className="symbol-group symbol-hover" style={{ marginLeft: '0' }}>
                    <div className="border border-dashed border-gray-300 rounded py-3 px-3">
                      <i className="bi bi-check2-square fs-1x" style={{ fontSize: '1.5rem' }}></i>

                      <span className="ms-1 fs-7 fw-bolder text-gray-600">0</span>
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
              </div><div className="card mb-6 mb-xl-9">
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
              </div>


            </div><div className="col-md-3 col-lg-12 col-xl-3">
              <div className="mb-9">
                <div className="d-flex flex-stack">
                  <div className="fw-bolder fs-4">En Pausa<span className="fs-6 text-gray-400 ms-2">1</span></div>

                </div>
                <div className="h-3px w-100 bg-info"></div>
              </div>
              <div className="card mb-6 mb-xl-9">
                <div className="card-body">
                  <div className="d-flex flex-stack mb-3">
                    <div className="badge badge-light">Vierdes 10 de agosto</div>
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
                    <a href="#" className="fs-4 fw-bolder mb-1 text-gray-900 text-hover-primary">Sutanito</a>
                  </div>
                  <div className="fs-6 fw-bold text-gray-600 mb-5">Ford Bronco, ABC4356, 2026</div><div className="separator" style={{ marginBottom: '15px' }}></div>
                  <div className="mb-2">
                    <div className="form-check form-check-custom form-check-solid">
                      <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                      <label className="form-check-label" >Revisión General</label>
                    </div>
                  </div><div className="mb-2">
                    <div className="form-check form-check-custom form-check-solid">
                      <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                      <label className="form-check-label" >Ahumado de focos</label>
                    </div>
                  </div><div className="mb-2">
                    <div className="form-check form-check-custom form-check-solid">
                      <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                      <label className="form-check-label" >Tratamiento cerámico</label>
                    </div>
                  </div>
                  <div className="separator" style={{ marginBottom: '15px' }}></div><p className="text-info py-3 fw-bold fw-6">Falta el producto para el tratamiento cerámico</p>
                  <div className="d-flex flex-stack flex-wrapr"><div className="symbol-group symbol-hover" style={{ marginLeft: '0' }}>
                    <div className="border border-dashed border-gray-300 rounded py-3 px-3">
                      <i className="bi bi-check2-square fs-1x" style={{ fontSize: '1.5rem' }}></i>

                      <span className="ms-1 fs-7 fw-bolder text-gray-600">8</span>
                    </div><div className="border border-dashed border-gray-300 rounded py-3 px-3" style={{ marginLeft: '5px' }}>
                      <span className="svg-icon svg-icon-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path opacity="0.3" d="M20 3H4C2.89543 3 2 3.89543 2 5V16C2 17.1046 2.89543 18 4 18H4.5C5.05228 18 5.5 18.4477 5.5 19V21.5052C5.5 22.1441 6.21212 22.5253 6.74376 22.1708L11.4885 19.0077C12.4741 18.3506 13.6321 18 14.8167 18H20C21.1046 18 22 17.1046 22 16V5C22 3.89543 21.1046 3 20 3Z" fill="black"></path>
                          <rect x="6" y="12" width="7" height="2" rx="1" fill="black"></rect>
                          <rect x="6" y="7" width="12" height="2" rx="1" fill="black"></rect>
                        </svg>
                      </span>
                      <span className="ms-1 fs-7 fw-bolder text-gray-600">4</span>
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
              </div>



            </div>
            <div className="col-md-3 col-lg-12 col-xl-3">
              <div className="mb-9">
                <div className="d-flex flex-stack">
                  <div className="fw-bolder fs-4">Completado<span className="fs-6 text-gray-400 ms-2">1</span></div>

                </div>
                <div className="h-3px w-100 bg-success"></div>
              </div>


              <div className="card mb-6 mb-xl-9">
                <div className="card-body">
                  <div className="d-flex flex-stack mb-3">
                    <div className="badge badge-light-success">Jueves 5 de junio</div>
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
                    <a href="#" className="fs-4 fw-bolder mb-1 text-gray-900 text-hover-primary">Elza Patito</a>
                  </div>
                  <div className="fs-6 fw-bold text-gray-600 mb-5">Chevrolet Camaro, TYH786, 2025</div><div className="separator" style={{ marginBottom: '15px' }}></div>
                  <div className="mb-2">
                    <div className="form-check form-check-custom form-check-solid">
                      <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                      <label className="form-check-label" >Cambio Aseite</label>
                    </div>
                  </div><div className="mb-2">
                    <div className="form-check form-check-custom form-check-solid">
                      <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                      <label className="form-check-label" >Cambio de filtro</label>
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

                      <span className="ms-1 fs-7 fw-bolder text-gray-600">8</span>
                    </div><div className="border border-dashed border-gray-300 rounded py-3 px-3" style={{ marginLeft: '5px' }}>
                      <span className="svg-icon svg-icon-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path opacity="0.3" d="M20 3H4C2.89543 3 2 3.89543 2 5V16C2 17.1046 2.89543 18 4 18H4.5C5.05228 18 5.5 18.4477 5.5 19V21.5052C5.5 22.1441 6.21212 22.5253 6.74376 22.1708L11.4885 19.0077C12.4741 18.3506 13.6321 18 14.8167 18H20C21.1046 18 22 17.1046 22 16V5C22 3.89543 21.1046 3 20 3Z" fill="black"></path>
                          <rect x="6" y="12" width="7" height="2" rx="1" fill="black"></rect>
                          <rect x="6" y="7" width="12" height="2" rx="1" fill="black"></rect>
                        </svg>
                      </span>
                      <span className="ms-1 fs-7 fw-bolder text-gray-600">4</span>
                    </div>

                  </div>

                    <div className="d-flex my-1">

                      <div className="border border-dashed border-gray-300 rounded py-3 px-3 text-gray-600">
                        <span className="svg-icon svg-icon-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-square-fill" viewBox="0 0 16 16">
                            <path d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1"></path>
                          </svg>
                        </span>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
  );
};