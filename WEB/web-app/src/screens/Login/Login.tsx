import { Input, Button, Typography, Card, Divider, Space } from "antd";
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined, AppleOutlined } from "@ant-design/icons";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { ROUTES } from "@/constants/routes";
import { LoadingModal } from "@/components/Modals/LoadingModal/LoadingModal";
import { useNotificationContext } from "@/context/NotificationContext";

const { Title } = Typography;

interface User {
  id: number;
  name: string;
  email: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const { notify } = useNotificationContext();
  const { setUserInfo } = useContext(AuthContext);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loadingModal, setLoadingModal] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const handleQuickLogin = () => {
    const devUser = {
      id: 1,
      name: "Dev User",
      email: "dev@example.com",
    };

    setPassword("123456");
    setUserInfo(devUser);
    sessionStorage.setItem("userInfo", JSON.stringify(devUser));

    navigate(ROUTES.HOME);
  };

  const validateEmail = (email: string): boolean => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async () => {
    if (!email || !password) {
      notify.error({
        message: "Error",
        description: "Por favor, completa todos los campos.",
        placement: "bottomRight",
      });
      return;
    }

    if (!validateEmail(email)) {
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
      const response = await fakeLogin(email, password); // Reemplazarás esto con tu API real
      
      if (response.user) {
        setUserInfo(response.user);
        notify.success({
          message: "Inicio de sesión exitoso",
          description: `Hola ${response.user.name}, bienvenido de nuevo 👋`,
          placement: "topRight",
        });
      }

      navigate(ROUTES.HOME);
    } catch (error) {
      notify.error({
        message: "Error al iniciar sesión",
        description:
          error instanceof Error ? error.message : "Credenciales incorrectas",
        placement: "bottomRight",
      });
    } finally {
      setButtonLoading(false);
      setLoadingModal(false);
    }
  };

  return (
    <Card
      style={{
        maxWidth: 400,
        margin: "10% auto",
        padding: 24,
        boxShadow: "0 0 10px rgba(0,0,0,0.075)",
        borderRadius: 8,
      }}
    >
      {loadingModal && (
        <LoadingModal loadingMessage="Verificando credenciales..." />
      )}
      <Title level={3} style={{ textAlign: "center" }}>
        Iniciar Sesión
      </Title>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <Typography.Text type="secondary" style={{ fontSize: "16px" }}>
          Nuevo aqui?
          <Link to="/sign-up" style={{ marginLeft: "5px" }}>
            Crear una cuenta
          </Link>
        </Typography.Text>
      </div>
      <span>Email</span>
      <Input
        size="large"
        placeholder="example@gmail.com"
        prefix={<UserOutlined />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <span>Password</span>
        <Link to="/password-reset" style={{ fontSize: "14px" }}>
          Forgot Password?
        </Link>
      </div>
      <Input.Password
        size="large"
        placeholder="Contraseña"
        prefix={<LockOutlined />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: 24 }}
      />
      <Button
        type="primary"
        block
        size="large"
        loading={buttonLoading}
        onClick={handleLogin}
      >
        Iniciar Sesión
      </Button>
      <Divider plain>or</Divider>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Button
          icon={<GoogleOutlined />}
          style={{
            width: "100%",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Continue with Google
        </Button>

        <Button
          icon={<FacebookOutlined />}
          style={{
            width: "100%",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Continue with Facebook
        </Button>

        <Button
          icon={<AppleOutlined />}
          style={{
            width: "100%",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Continue with Apple
        </Button>
      </Space>

      <hr style={{ margin: "2rem 0" }} />

      {/* 🔧 Botón de desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <div>
          <span style={{ display: "block", textAlign: "center", marginBottom: "1rem", color: "#888" }}>
            Visible solo en modo dev
          </span>
          <Button
            onClick={handleQuickLogin}
            style={{
              padding: "1rem 2rem",
              backgroundColor: "#4CAF50",
              color: "#000",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            🔓 Saltar Login (Modo Dev)
          </Button>
        </div>
      )}
    </Card>
  );
};

export default Login;

// Simulación temporal de login (reemplazar can la API real después)

const fakeLogin = (
  email: string,
  password: string,
): Promise<{ user: User }> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
     if (email === "dev@gmail.com" && password === "123456") {
        resolve({ user: { id: 1, name: "David", email } });
      } else {
        reject(new Error("Credenciales inválidas"));
      }
    }, 1500);
  });
