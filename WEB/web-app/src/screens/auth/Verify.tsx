import { useContext, useState } from "react";
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
  const navigate = useNavigate();

  const assertUser = (): DTO_Usuario | null => {
    if (!user || !user.iD_Usuario) {
      notificationHelpers.errorAlert(
        "Sesión no válida. Inicie sesión nuevamente."
      );
      return null;
    }
    return user as DTO_Usuario;
  };

  const generar = async () => {
    const u = assertUser();
    if (!u) return;
    try {
      setLoading(true);
      // TIPAR explícitamente la respuesta
      const res: DTO_Respuesta = await firstValueFrom<DTO_Respuesta>(
        usuarioService.generarCodigoVerificacion(u)
      );
      if (res.tipoRespuesta) {
        notificationHelpers.successAlert(
          res.mensaje || "Código enviado al correo"
        );
      } else {
        notificationHelpers.errorAlert(
          res.mensaje || "No se pudo generar el código"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const reenviar = async () => {
    const u = assertUser();
    if (!u) return;
    try {
      setLoading(true);
      const res: DTO_Respuesta = await firstValueFrom<DTO_Respuesta>(
        usuarioService.reenviarCodigoVerificacion(u)
      );
      if (res.tipoRespuesta) {
        notificationHelpers.successAlert(res.mensaje || "Código reenviado");
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

      // Enviar DTO_Usuario con el código embebido (propiedad CodigoVerificacion en backend)
      const payload: DTO_Usuario = { ...u, codigoVerificacion: codigo.trim() };

      const res: DTO_Respuesta = await firstValueFrom<DTO_Respuesta>(
        usuarioService.validarCodigoVerificacion(payload)
      );

      if (res.tipoRespuesta) {
        // Marcar usuario como Activo (1) en FE
        const updated: DTO_Usuario = {
          ...u,
          estado: {
            ...u.estado,
            iD_Estado: 1,
            ...((u.estado as any)?.ID_Estado !== undefined
              ? { ID_Estado: 1 }
              : {}),
          } as any,
        };
        setUser(updated);
        localStorage.setItem("auth_user", JSON.stringify(updated));

        // Si el backend devuelve un nuevo accesToken tras activar, guardarlo
        const nuevoToken = (res.resultado?.[0] as any)?.accesToken as
          | string
          | undefined;
        if (nuevoToken) {
          localStorage.setItem("accesToken", nuevoToken);
        }

        notificationHelpers.successAlert(res.mensaje || "Cuenta verificada");
        navigate(ROUTES.HOME, { replace: true });
      } else {
        notificationHelpers.errorAlert(
          res.mensaje || "Código inválido o vencido"
        );
      }
    } finally {
      setLoading(false);
    }
  };

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
          <div className="d-flex gap-3">
            <button
              className="btn btn-primary"
              onClick={validar}
              disabled={loading || !user?.iD_Usuario}
            >
              Validar
            </button>
            <button
              className="btn btn-light"
              onClick={generar}
              disabled={loading || !user?.iD_Usuario}
            >
              Generar
            </button>
            <button
              className="btn btn-light"
              onClick={reenviar}
              disabled={loading || !user?.iD_Usuario}
            >
              Reenviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
