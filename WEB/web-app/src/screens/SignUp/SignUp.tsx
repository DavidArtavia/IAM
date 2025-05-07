import { useState } from "react";
import TallerLogo from "@/assets/img/TallerLogo.png";
import { useNotificationContext } from "@/context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input } from "antd";
import { ROUTES } from "@/constants/routes";
import api from "@/api/api";
import { API_ENDPOINTS } from "@/constants/apiEndPoints";
import Users from "@/models/Users";

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

  const validatorNotify = (values: Users) => {
     const {
       NombreUsuario,
       Apellido,
       TelefonoUsuario,
       CorreoUsuario,
       Pass,
     } = values;
    if (!/^[a-zA-Z\s]+$/.test(NombreUsuario)) {
      return notify.error({
        message: "Error",
        description: "El nombre solo debe contener letras y espacios.",
        placement: "bottomRight",
      });
    }

    if (!/^[a-zA-Z\s]+$/.test(Apellido)) {
      return notify.error({
        message: "Error",
        description: "El apellido solo debe contener letras y espacios.",
        placement: "bottomRight",
      });
    }

    if (!/^\d{8}$/.test(TelefonoUsuario)) {
      return notify.error({
        message: "Error",
        description:
          "El teléfono debe contener exactamente 8 dígitos numéricos.",
        placement: "bottomRight",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CorreoUsuario)) {
      return notify.error({
        message: "Error",
        description: "Por favor, ingresa un correo electrónico válido.",
        placement: "bottomRight",
      });
    }

    if (Pass.length < 6) {
      return notify.error({
        message: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        placement: "bottomRight",
      });
    }
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const onFinish = async (values: Users) => {
        
    try {
      
      validatorNotify(values); // Llamar a la función de validación
      const user: Users = {
        ID_Usuario: values?.ID_Usuario,
        ID_Estado: values?.ID_Estado,
        NombreUsuario: values.NombreUsuario,
        Apellido: values.Apellido,
        TelefonoUsuario: values.TelefonoUsuario,
        CorreoUsuario: values.CorreoUsuario,
        Pass: values.Pass,
      };
      
      setLoading(true);
      const response = await api.post(API_ENDPOINTS.USERS.CREATE, user);

      if (response.status === 200) {
        
        notify.success({ message: "Éxito", description: "Usuario creado con éxito.", placement: "bottomRight", });
        sleep(2000);
        setLoading(false); 
        navigate(ROUTES.LOGIN); 
        
      } else {
        notify.warning({
          message: "Advertencia",
          description: "No se pudo crear el usuario. Verifique los datos ingresados.",
          placement: "bottomRight",
        });
        setLoading(false); 
      }


    } catch (error) {
      console.error("Error al crear usuario:", error);
      notify.error({ message: "Error", description: "Error al conectar con el servidor.", placement: "bottomRight", });
      setLoading(false);
    }

  };

  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100vh", // ocupa toda la pantalla
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
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

        {/* Formulario centrado */}
        <Form
          {...formItemLayout}
          form={form}
          name="signUp"
          onFinish={onFinish}
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

          {/* Tus campos del formulario */}
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