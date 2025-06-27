import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import sonidoMonitor from "../../assets/media/audios/Monitor.mp3";
import { errorHelpers, notificationHelpers } from "@/utils";
import { BusinessButtons, LoadingPanel, OrdenesSeccion } from "@/components";
import {
  DTO_ItemOrdenServicio,
  DTO_Negocio,
  DTO_OrdenServicio,
  DTO_Respuesta,
} from "@/models";
import {
  monitorService,
  itemsOrdenesService,
  ordenesService,
} from "@/services";
import { STATUS_TBL } from "@/constants";

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
    return obj && typeof obj === "object" && "iD_ItemOrdenServicio" in obj;
  };

  const isOrdenServicio = (obj: any): obj is DTO_OrdenServicio => {
    return obj && typeof obj === "object" && "iD_Cliente" in obj;
  };

  const [selectedBusiness, setSelectedBusiness] = useState<DTO_Negocio | null>(
    null
  );

  const cambiarEstadoOrdenServicio = (
    orden: DTO_OrdenServicio,
    estado: number
  ) => {
    orden.estado.iD_Estado = estado;
    const rawNote = orden.notaOrdenServicio || "";

    const cleanedNote = rawNote.includes("|")
      ? rawNote.substring(rawNote.lastIndexOf("|") + 1).trim()
      : rawNote.trim();

    orden.notaOrdenServicio = cleanedNote;
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
  const handleCheckboxChange = (
    item: DTO_ItemOrdenServicio,
    checked: boolean
  ) => {
    if (checked) {
      item.avance = 100;
    } else {
      item.avance = 0;
    }
    itemsOrdenesService.actualizarItemsOrdensDeServicio(item).subscribe({
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
        try {
          await connectionRef.current.stop();
        } catch {
          console.log("Error limpiando conexión");
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
        console.log("error estrayendo el token retornado");
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
          await new Promise((r) => setTimeout(r, 3000));
          return iniciarConexion();
        }
      }

      // Reintento normal
      if (!abortedRef.current) {
        // Usar retryTimeoutRef.current para almacenar el ID del timeout
        retryTimeoutRef.current = window.setTimeout(iniciarConexion, 3000); // `setTimeout` devuelve un número en el navegador
      }
    };

    const handleMensaje = (msg: any) => {
      if (abortedRef.current) return;

      /* --- qué recibimos --- */
      if (isItemOrdenServicio(msg)) {
        //Aquí entra si es un item de orden de servicio
        setItems((prev) => {
          const idx = prev.findIndex(
            (i) => i.iD_ItemOrdenServicio === msg.iD_ItemOrdenServicio
          );

          /* —— 1 · Eliminar si el estado es 19 —— */
          if (msg.estado?.iD_Estado === 19) {
            // si no existe, devolvemos el array tal cual
            return idx === -1 ? prev : prev.filter((_, i) => i !== idx);
          }

          /* —— 2 · Insertar o actualizar —— */
          return idx === -1
            ? [...prev, msg] // insertar
            : prev.map(
                (
                  i // actualizar
                ) =>
                  i.iD_ItemOrdenServicio === msg.iD_ItemOrdenServicio
                    ? { ...i, ...msg }
                    : i
              );
        });

        notificationHelpers.infoAlert(
          `Ítem actualizado: ${msg.nombreItemOrdenServicio} de la Orden # ${msg.iD_OrdenServicio}`
        );

        //Aquí entra si es una orden de servicio
      } else if (isOrdenServicio(msg)) {
        setOrdenes((prev) => {
          const idx = prev.findIndex(
            (o) => o.iD_OrdenServicio === msg.iD_OrdenServicio
          );

          /* —— 1 · Eliminar si el estado es 19 —— */
          if (msg.estado?.iD_Estado === 10) {
            // si no existe, devuelve el array original
            return idx === -1 ? prev : prev.filter((_, i) => i !== idx);
          }

          /* —— 2 · Insertar o actualizar —— */
          return idx === -1
            ? [...prev, msg] // insertar
            : prev.map(
                (
                  o // actualizar
                ) =>
                  o.iD_OrdenServicio === msg.iD_OrdenServicio
                    ? { ...o, ...msg }
                    : o
              );
        });

        notificationHelpers.infoAlert(
          `Orden #${msg.iD_OrdenServicio} modificada`
        );
      } else {
        console.warn("Tipo desconocido", msg);
        notificationHelpers.infoAlert("📢 Nuevo mensaje");
      }

      /* if (Notification.permission === "granted") {
        new Notification("📢 Nuevo mensaje", { body: msg, silent: true });
      }
        */
      audio.current.play().catch(() => {});
    };

    const handleReconnecting = () => {
      if (abortedRef.current) return;
      setEstadoConexion("Reconectando...");
      notificationHelpers.infoAlert(
        "Conexión perdida, intentando reconectar..."
      );
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
      if (abortedRef.current) {
        intentoRef.current = false;
        return;
      }

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
        if (abortedRef.current) {
          intentoRef.current = false;
          return;
        }
        setEstadoConexion("Conectado");
        notificationHelpers.successAlert("Monitor conectado");
      } catch (err: unknown) {
        // Primero, intentamos renovar token si aplica
        const texto = err instanceof Error ? err.message : String(err);
        const renovado = await extraerYRenovarToken(texto);
        if (renovado && !abortedRef.current) {
          await new Promise((r) => setTimeout(r, 500));
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
          );
          setItems(
            ((res as DTO_Respuesta).resultado[1] as DTO_ItemOrdenServicio[]) ||
              []
          );
        },
        error: (err) => errorHelpers.serverError(err),
        complete: () => setLoading(false),
      });

    return () => sub.unsubscribe();
  }, [selectedBusiness]);

  //#endregion

  //#region para manejo de cuentas

  const handleCreateCount = (countSelected: DTO_OrdenServicio) => {
    // Aquí puedes manejar la lógica para crear una cuenta
    console.log("Crear cuenta para:", countSelected);
  };
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
            <span
              style={{ marginRight: "5px", marginBottom: "-5px" }}
              className={`badge badge-circle ${
                estadoConexion === "Conectado"
                  ? " badge-success"
                  : " badge-danger"
              }`}
            ></span>
            Taller Mata
            <span className="fs-6 text-gray-400 fw-bold ms-1">
              {estadoConexion}
            </span>
          </h3>
        </div>
        <div className="row g-9">
          <OrdenesSeccion
            titulo="Nuevo"
            colorBarra="bg-secondary"
            estado={STATUS_TBL.ORDER_SERVICE.NEW}
            ordenes={ordenes}
            items={items}
            onAvanceChange={handleCheckboxChange}
            onEstadoChange={cambiarEstadoOrdenServicio}
          />
          <OrdenesSeccion
            titulo="En proceso"
            colorBarra="bg-primary"
            estado={STATUS_TBL.ORDER_SERVICE.IN_PROCESS}
            ordenes={ordenes}
            items={items}
            onAvanceChange={handleCheckboxChange}
            onEstadoChange={cambiarEstadoOrdenServicio}
          />
          <OrdenesSeccion
            titulo="Completado"
            colorBarra="bg-success"
            estado={STATUS_TBL.ORDER_SERVICE.COMPLETED}
            ordenes={ordenes}
            items={items}
            onAvanceChange={handleCheckboxChange}
            onEstadoChange={cambiarEstadoOrdenServicio}
            onClickCreateCount={handleCreateCount}
          />
          <OrdenesSeccion
            titulo="En espera"
            colorBarra="bg-warning"
            estado={STATUS_TBL.ORDER_SERVICE.PENDING}
            ordenes={ordenes}
            items={items}
            onAvanceChange={handleCheckboxChange}
            onEstadoChange={cambiarEstadoOrdenServicio}
          />
        </div>
      </div>
    </div>
  );
};
