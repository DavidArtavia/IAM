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
import TallerLogo from "@/assets/img/TallerLogo.png";
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

    if (!values.CorreoUsuario || !values.Pass) {
      notify.error({
        message: "Error",
        description: "Por favor, completa todos los campos.",
        placement: "bottomRight",
      });
      return;
    }

    if (!validateEmail(values.CorreoUsuario)) {
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
      console.log("El response que recibo", response);      

      if (response.data.tipoRespuesta) {
        const user: DTO_Usuario = response.data.resultado[0];
        const accesToken = response.data.resultado[1].accesToken; 

        login(user, accesToken);
        notify.success({
          message: "Inicio de sesión exitoso",
          description: `Hola ${user.NombreUsuario + " " + user.Apellido}, bienvenido de nuevo 👋`,
          placement: "topRight",
        });
        navigate(ROUTES.HOME);
      } else {
        notify.error({
          message: "Error",
          description: "Credenciales incorrectas",
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

    // try {
    //   console.log("Valores que se envio", values);
      
    //   const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, values);
    //   console.log("El response que recibo", response);

    //   // Descomenta cuando tengas la respuesta correcta del backend
    //   if (response.data.tipoRespuesta) {
    //     const user: DTO_Usuario = response.data.resultado[0];
        
    //     setUserInfo(user);
    //     console.log('entro al login la respuesta fue true');
        
    //     notify.success({
    //       message: "Inicio de sesión exitoso",
    //       description: `Hola ${user.NombreUsuario +" "+ user.Apellido }, bienvenido de nuevo 👋`,
    //       placement: "topRight",
    //     });
    //     navigate(ROUTES.HOME);
    //   }
    // } catch (error) {
    //   notify.error({
    //     message: "Error al iniciar sesión",
    //     description:
    //       error instanceof Error ? error.message : "Credenciales incorrectas",
    //     placement: "bottomRight",
    //   });
    // } finally {
    //   setButtonLoading(false);
    //   setLoadingModal(false);
    // }
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <Col xs={22} sm={20} md={16} lg={10} xl={8}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2rem",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
          }}
        >
          {loadingModal && (
            <LoadingModal loadingMessage="Verificando credenciales..." />
          )}

          {/* Logo y título */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "rem",
            }}
          >
            <img
              alt="Logo"
              src={TallerLogo}
              style={{
                width: "80px",
                maxHeight: "64px",
                objectFit: "contain",
                marginRight: "1rem",
              }}
            />
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              MAIK TALLER
            </span>
          </div>

          <Title level={3} style={{ textAlign: "center", margin: 0 }}>
            Iniciar Sesión
          </Title>
          <div style={{ textAlign: "center", margin: "1rem 0 2rem" }}>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              ¿Nuevo aquí?
              <Link
                to={ROUTES.SIGNUP}
                style={{ marginLeft: "8px", fontWeight: 500 }}
              >
                Crear una cuenta
              </Link>
            </Text>
          </div>
          <Divider style={{ margin: "2rem 0" }} />

          <Form
            form={form}
            name="login"
            layout="vertical"
            onFinish={onFinish}
            initialValues={dto_usuario}
            style={{ width: "100%" }}
            scrollToFirstError
          >
            <Form.Item
              name="CorreoUsuario"
              rules={[
                {
                  required: true,
                  message: "Por favor, ingrese el correo electrónico",
                },
                { type: "email", message: "Correo no válido" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="example@gmail.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="Pass"
              rules={[
                { required: true, message: "Por favor, ingrese la contraseña" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Contraseña"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Flex justify="space-between" align="center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Recordar</Checkbox>
                </Form.Item>
                <Link to={API_ENDPOINTS.AUTH.FORGOT_PASSWORD}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </Flex>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={buttonLoading}
                size="large"
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "6px",
                  fontWeight: 500,
                  fontSize: "16px",
                }}
              >
                Iniciar Sesión
              </Button>
            </Form.Item>

            {process.env.NODE_ENV === "development" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "24px 0",
                  }}
                >
                  <div style={{ flex: 1, height: "1px", background: "#eee" }} />
                  <Text
                    type="secondary"
                    style={{ margin: "0 16px", fontSize: "14px" }}
                  >
                    Visible solo en modo dev
                  </Text>
                  <div style={{ flex: 1, height: "1px", background: "#eee" }} />
                </div>

                <Button
                  type="default"
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#4CAF50",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    height: "auto",
                  }}
                >
                  🔓 Saltar Login (Modo Dev)
                </Button>
              </div>
            )}
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default Login;