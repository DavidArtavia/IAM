import { useState } from "react";
import TallerLogo from "@/assets/img/TallerLogo.png";
import { useNotificationContext } from "@/context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input } from "antd";
import { ROUTES } from "@/constants/routes";
import api from "@/api/api";
import { API_ENDPOINTS } from "@/constants/apiEndPoints";
import { DTO_Usuario } from "@/models/DTO_Usuario";
import { validatorNotify } from "@/utils/validators";

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};


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

      // Se mandan vacíos por de mantener la estructura de la API
      values.Estado = { ID_Estado: 0, Nombre: "", Tabla: "" };
      values.Rol = {
        ID_Rol: 0,
        ID_Usuario: 0,
        NombreRol: "",
        DescripcionRol: "",
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
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
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

        <Form
          {...formItemLayout}
          form={form}
          name="signUp"
          onFinish={onFinish}
          initialValues={dto_usuario}
          style={{
            width: "35%",
            maxWidth: 600,
            padding: 24,
            boxShadow: "0 0 10px rgba(5, 5, 5, 0.1)",
            borderRadius: 8,
            backgroundColor: "#fff",
          }}
          scrollToFirstError
        >
          <h1
            style={{
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "24px",
              color: "#333",
            }}
          >
            Registro de Usuario
          </h1>

          <hr
            style={{
              marginBottom: "20px",
              border: "none",
              borderTop: "1px solid #ddd",
            }}
          />

          <p
            style={{
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "16px",
              color: "#555",
            }}
          >
            Complete el formulario para registrar un nuevo usuario.
          </p>

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
            <Input placeholder="Nombre Usuario" />
          </Form.Item>

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
            <Input placeholder="Apellidos" />
          </Form.Item>

          <Form.Item
            name="TelefonoUsuario"
            label="Teléfono"
            rules={[
              {
                required: true,
                message: "Por favor, ingrese el número de teléfono",
              },
              { len: 8, message: "El número debe tener exactamente 8 dígitos" },
            ]}
          >
            <Input placeholder="Teléfono Usuario" maxLength={8} />
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
            <Input placeholder="Correo Usuario" />
          </Form.Item>

          <Form.Item
            name="Pass"
            label="Contraseña"
            rules={[
              { required: true, message: "Por favor, ingrese la contraseña" },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Contraseña" />
          </Form.Item>

          {/* Campos no visibles para Estado y Rol */}
          <Form.Item name="Estado" hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="Rol" hidden>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit" loading={loading}>
              Registrar
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};