import {
  Input,
  Button,
  Typography,
  Form,
  Flex,
  Checkbox,
  Col,
  Row,
  Divider,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { ROUTES } from "@/constants/routes";
import { LoadingModal } from "@/components/Modals/LoadingModal/LoadingModal";
import { useNotificationContext } from "@/context/NotificationContext";
import TallerLogo from "@/assets/media/logos/TallerLogo.png";
import api from "@/api/api";
import { API_ENDPOINTS } from "@/constants/apiEndPoints";
import { DTO_Usuario } from "@/models/DTO_Usuario";

const { Title, Text } = Typography;

export const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { notify } = useNotificationContext();
  const dto_usuario: DTO_Usuario = new DTO_Usuario();
  const { login } = useContext(AuthContext);

  const [loadingModal, setLoadingModal] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const validateEmail = (email: string): boolean => /\S+@\S+\.\S+/.test(email);

  const onFinish = async (values: DTO_Usuario) => {

    if (!values.correoUsuario || !values.pass) {
      notify.error({
        message: "Error",
        description: "Por favor, completa todos los campos.",
        placement: "bottomRight",
      });
      return;
    }

    if (!validateEmail(values.correoUsuario)) {
      notify.error({
        message: "Error",
        description: "Por favor, ingresa un correo electrónico válido.",
        placement: "bottomRight",
      });
      return;
    }

    setButtonLoading(true);
    setLoadingModal(true);

    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, values);
      const mensage = response.data.mensaje;

      if (response.data.tipoRespuesta) {

        const user = response.data.resultado[0] as DTO_Usuario;
        const accesToken = response.data.resultado[1].accesToken; 

        localStorage.setItem("accesToken", accesToken);
        login(user, accesToken);
        notify.success({
          message: mensage,
          description: `Hola ${
            user.nombreUsuario + " " + user.apellido
          }, bienvenido de nuevo 👋`,
          placement: "topRight",
        });
        // navigate(ROUTES.HOME);
        navigate(ROUTES.CHAT_AI);
      } else {
        setButtonLoading(false);
        setLoadingModal(false);
        notify.warning({
          message: "Advertencia",
          description: mensage,
          placement: "bottomRight",
        });
      }
    } catch (error) {
      notify.error({
        message: "Error",
        description: error instanceof Error ? error.message : "Error inesperado",
        placement: "bottomRight",
      });
      
    }
  };

  return (
    <div className="d-flex flex-column flex-root">
  <div
    className="d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed"
    style={{
      backgroundImage:
        'url("assets/media/illustrations/sketchy-1/14.png")',
    }}
  >
    <div className="d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20">
      <a className="mb-12">
        <img
          alt="Logo"
           src="src/assets/media/logos/logo-1.svg"
          className="h-40px"
        />
      </a>

      <div className="w-lg-500px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto">
        <form
          className="form w-100 fv-plugins-bootstrap5 fv-plugins-framework"
          noValidate
          id="kt_sign_in_form"
          action="#"
        >
          <div className="text-center mb-10">
            <h1 className="text-dark mb-3">Iniciar Sesión</h1>

            <div className="text-gray-400 fw-bold fs-4">
       
              <a
                href="../../demo6/dist/authentication/flows/basic/sign-up.html"
                className="link-primary fw-bolder"
              >
                Crear cuenta
              </a>
            </div>
          </div>

          <div className="fv-row mb-10 fv-plugins-icon-container">
            <label className="form-label fs-6 fw-bolder text-dark">
              Email
            </label>
            <input
              className="form-control form-control-lg form-control-solid"
              type="text"
              name="email"
              autoComplete="off"
              placeholder="ejemplo@gmail.com"
            />
            <div className="fv-plugins-message-container invalid-feedback" />
          </div>

          <div className="fv-row mb-10 fv-plugins-icon-container">
            <div className="d-flex flex-stack mb-2">
              <label className="form-label fw-bolder text-dark fs-6 mb-0">
                Password
              </label>
            </div>
            <input
              className="form-control form-control-lg form-control-solid"
              type="password"
              name="password"
              autoComplete="off"
            />
            <div className="fv-plugins-message-container invalid-feedback" />
          </div>

          <div className="text-center">
            <button 
              type="submit"
              id="kt_sign_in_submit"
              className="btn btn-lg btn-primary w-100 mb-5"
            >
              <span className="indicator-label">Continue</span>
              <span className="indicator-progress">
                Por favor espere…
                <span className="spinner-border spinner-border-sm align-middle ms-2" />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <div className="d-flex flex-center flex-column-auto p-10">
      <div className="d-flex align-items-center fw-bold fs-6" />
    </div>
  </div>
</div>
  );
};

export default Login;
