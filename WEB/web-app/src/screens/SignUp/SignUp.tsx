import { useState } from "react";
import { Button, Form, Input, Typography, Col, Row, Divider } from "antd";
import TallerLogo from "@/assets/media/logos/TallerLogo.png";
import { Link, useNavigate } from "react-router-dom";
import { useNotificationContext } from "@/context/NotificationContext";
import { ROUTES } from "@/constants/routes";
import api from "@/api/api";
import { API_ENDPOINTS } from "@/constants/apiEndPoints";
import { DTO_Usuario } from "@/models/DTO_Usuario";
import { validatorNotify } from "@/utils/validators";
import "./SignUp.css";

const { Title, Text } = Typography;

export const SignUp = () => {
  const [form] = Form.useForm();
  const { notify } = useNotificationContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const dto_usuario: DTO_Usuario = new DTO_Usuario();

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const onFinish = async (values: DTO_Usuario) => {
    try {
      validatorNotify(values);

      // Se crean vacíos por de mantener la estructura de la API
      values.estado = { iD_Estado: 0, nombre: "", tabla: "" };
      values.rol = {
        iD_Rol: 0,
        iD_Usuario: 0,
        nombreRol: "",
        descripcionRol: "",
      };

      setLoading(true);
      const response = await api.post(API_ENDPOINTS.USERS.CREATE, values);

      if (response.data.codigo === "200") {
        notify.success({
          message: "Éxito",
          description: response.data.mensaje,
          placement: "bottomRight",
        });
        await sleep(2000);
        setLoading(false);
        navigate(ROUTES.LOGIN);
      } else {
        notify.warning({
          message: "Advertencia",
          description: response.data.mensaje,
          placement: "bottomRight",
        });
        setLoading(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message;

        if (errorMessage.startsWith("ValidationError:")) {
          const cleanMessage = errorMessage.replace("ValidationError: ", "");

          notify.error({
            message: "Error de Validación",
            description: cleanMessage,
            placement: "bottomRight",
          });
        } else {
          console.error("Error al crear usuario:", error);
          notify.error({
            message: "Error",
            description: "Error al conectar con el servidor.",
            placement: "bottomRight",
          });
        }
      } else {
        console.error("Error desconocido:", error);
        notify.error({
          message: "Error",
          description: "Ha ocurrido un error inesperado.",
          placement: "bottomRight",
        });
      }
      setLoading(false);
    }
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
      <Col xs={22} sm={20} md={16} lg={12} xl={10}>
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
          {/* Logo y título */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1.5rem",
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
            Registro de Usuario
          </Title>

          <Text
            style={{
              textAlign: "center",
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
              fontSize: "16px",
              color: "#555",
            }}
          >
            Complete el formulario para registrar un nuevo usuario
          </Text>
          <Divider style={{ margin: "1rem 0" }} />

          <Form
            form={form}
            name="signUp"
            layout="vertical"
            onFinish={onFinish}
            initialValues={dto_usuario}
            style={{ width: "100%" }}
            scrollToFirstError
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="NombreUsuario"
                  label="Nombre"
                  rules={[
                    {
                      required: true,
                      message: "Por favor, ingrese el nombre del usuario",
                    },
                  ]}
                >
                  <Input placeholder="Nombre Usuario" size="large" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="Apellido"
                  label="Apellidos"
                  rules={[
                    {
                      required: true,
                      message: "Por favor, ingrese el apellido del usuario",
                    },
                  ]}
                >
                  <Input placeholder="Apellidos" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="TelefonoUsuario"
              label="Teléfono"
              rules={[
                {
                  required: true,
                  message: "Por favor, ingrese el número de teléfono",
                },
                {
                  len: 8,
                  message: "El número debe tener exactamente 8 dígitos",
                },
              ]}
            >
              <Input
                placeholder="Teléfono Usuario"
                maxLength={8}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="CorreoUsuario"
              label="Correo"
              rules={[
                {
                  required: true,
                  message: "Por favor, ingrese el correo electrónico",
                },
                { type: "email", message: "Correo no válido" },
              ]}
            >
              <Input placeholder="Correo Usuario" size="large" />
            </Form.Item>

            <Form.Item
              name="Pass"
              label="Contraseña"
              rules={[
                { required: true, message: "Por favor, ingrese la contraseña" },
              ]}
              hasFeedback
            >
              <Input.Password placeholder="Contraseña" size="large" />
            </Form.Item>

            <Form.Item
              name="ConfirmarContraseña"
              label="Confirmar contraseña"
              dependencies={["Pass"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Por favor, confirme su contraseña",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("Pass") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("La contraseña que ingresó no coincide")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirmar Contraseña" size="large" />
            </Form.Item>

            {/* Campos no visibles para Estado y Rol */}
            <Form.Item name="Estado" hidden>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="Rol" hidden>
              <Input type="hidden" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "6px",
                  fontWeight: 500,
                  fontSize: "16px",
                  marginTop: "8px",
                }}
              >
                Registrar
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Text type="secondary">
                ¿Ya tienes una cuenta?{" "}
                <Link to={ROUTES.LOGIN} style={{ fontWeight: 500 }}>
                  Iniciar sesión
                </Link>
              </Text>
            </div>
          </Form>
        </div>
      </Col>
    </Row>
  );
};
