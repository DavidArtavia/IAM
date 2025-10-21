import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "@/context";
import { usuarioService } from "@/services";
import { notificationHelpers } from "@/utils";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { DTO_Usuario, DTO_Respuesta } from "@/models";
import { firstValueFrom } from "rxjs";

export const Verify = () => {
  const { user, setUser } = useContext(AuthContext);
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const didInit = useRef(false);

  const assertUser = (): DTO_Usuario | null => {
    if (!user || !user.iD_Usuario) {
      notificationHelpers.errorAlert(
        "Sesión no válida. Inicie sesión nuevamente."
      );
      return null;
    }
    return user as DTO_Usuario;
  };

  // util: iniciar countdown
  const startCountdown = (sec: number) => {
    try {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setSecondsLeft(sec);
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            if (timerRef.current) {
              window.clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000) as unknown as number;
    } catch {
      // ignore
    }
  };

  const toastEnvio = (
    res: DTO_Respuesta,
    fallbackOk: string,
    fallbackWarn: string
  ) => {
    const last = (res as any)?.resultado?.[(res as any)?.resultado?.length - 1];
    const emailEnviado = !!(
      last &&
      typeof last === "object" &&
      "emailEnviado" in last &&
      last.emailEnviado
    );
    if (emailEnviado) {
      notificationHelpers.successAlert(res.mensaje || fallbackOk);
      startCountdown(60);
    } else {
      // No se envió correo (usuario ya verificado o no hubo código)
      if (typeof notificationHelpers.warningAlert === "function") {
        notificationHelpers.warningAlert(res.mensaje || fallbackWarn);
      } else {
        notificationHelpers.successAlert(res.mensaje || fallbackWarn); // fallback si no tienes warningAlert
      }
    }
  };

  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      if (user) {
        firstValueFrom(usuarioService.generarCodigoVerificacion(user))
          .then((res) => {
            toastEnvio(
              res,
              "Código enviado a tu correo",
              "No se envió correo (usuario ya verificado o sin código)."
            );
          })
          .catch((err: unknown) => {
            console.error(err);
            notificationHelpers.errorAlert("No se pudo generar el código");
          });
      }
    }
  }, [user]);

  const reenviar = async () => {
    const u = assertUser();
    if (!u) return;
    try {
      setLoading(true);
      const res: DTO_Respuesta = await firstValueFrom<DTO_Respuesta>(
        usuarioService.reenviarCodigoVerificacion(u)
      );
      if (res.tipoRespuesta) {
        toastEnvio(
          res,
          "Código reenviado",
          "No se envió correo (usuario ya verificado o sin código)."
        );
      } else {
        notificationHelpers.errorAlert(
          res.mensaje || "No se pudo reenviar el código"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const validar = async () => {
    const u = assertUser();
    if (!u) return;

    if (!codigo.trim()) {
      notificationHelpers.errorAlert("Ingresa el código de verificación");
      return;
    }
    try {
      setLoading(true);
      const payload: DTO_Usuario = {
        ...u,
        codigoVerificacion: codigo.trim(),
      };

      const res: DTO_Respuesta = await firstValueFrom<DTO_Respuesta>(
        usuarioService.validarCodigoVerificacion(payload)
      );

      const cod = ((res as any)?.codigo as string | undefined)?.toUpperCase();

      // Éxito real: B052 (verificado) o B055 (ya verificado)
      const verificacionOK = cod === "B052" || cod === "B055";

      if (!verificacionOK) {
        // No marcar activo, no guardar token, no navegar
        notificationHelpers.errorAlert(
          res.mensaje || "Código inválido o vencido"
        );
        return;
      }

      // A partir de aquí SÍ es válido: actualizar estado y token
      const updated: DTO_Usuario = {
        ...u,
        estado: {
          ...u.estado,
          iD_Estado: 1,
          // compat si en otro lado usan PascalCase
          ...((u.estado as any)?.ID_Estado !== undefined
            ? { ID_Estado: 1 }
            : {}),
        } as any,
      };
      setUser(updated);
      localStorage.setItem("auth_user", JSON.stringify(updated));

      // Guardar accesToken si vino
      const nuevoToken = (res.resultado?.[0] as any)?.accesToken as
        | string
        | undefined;
      if (nuevoToken) {
        localStorage.setItem("accesToken", nuevoToken);
      }

      notificationHelpers.successAlert(res.mensaje || "Cuenta verificada");
      navigate(ROUTES.HOME, { replace: true });
    } catch (err: any) {
      const apiMsg =
        err?.response?.data?.mensaje ||
        err?.message ||
        "No se pudo validar el código";
      notificationHelpers.errorAlert(apiMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Deshabilitar botones durante el countdown o mientras está cargando
  const disabledByCountdown = secondsLeft > 0;
  const disableAllActions = loading || disabledByCountdown || !user?.iD_Usuario;

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="card w-100" style={{ maxWidth: 480 }}>
        <div className="card-body p-10">
          <h2 className="mb-4">Verifica tu cuenta</h2>
          <p className="text-muted mb-6">
            Te enviamos un código de verificación a tu correo. Ingresa el código
            para activar tu cuenta.
          </p>

          {/* Countdown */}
          {secondsLeft > 0 && (
            <div className="alert alert-info py-2">
              Puedes volver a solicitar un código en {secondsLeft}s.
            </div>
          )}

          <div className="mb-5">
            <label className="form-label">Código</label>
            <input
              className="form-control"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: a1b2"
              maxLength={10}
              disabled={loading}
            />
          </div>
          <div className="d-flex gap-3 align-items-center">
            <button
              className="btn btn-primary d-flex align-items-center"
              onClick={validar}
              disabled={loading || !user?.iD_Usuario}
            >
              {loading && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
              )}
              Validar
            </button>

            <button
              className="btn btn-light d-flex align-items-center"
              onClick={reenviar}
              disabled={disableAllActions || !user?.iD_Usuario}
            >
              {disableAllActions && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
              )}
              Reenviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
