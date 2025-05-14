// LayoutMain.tsx
import { ROUTES } from "@/constants/routes";
import TallerLogo from "@/assets/img/TallerLogo.png";
import { Outlet } from "react-router-dom";
import "./LayoutMain.css";
import { Link } from "react-router-dom";
import {
  HomeFilled,
  UploadOutlined,
  UserOutlined,
  LogoutOutlined,
  PieChartOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const { Header, Content, Footer, Sider } = Layout;

export const LayoutMain = () => {
  const { user } = useContext(AuthContext);
  console.log("user", user);
  
  // Define los items usando Link en lugar de <a href>
  const handleLogout = () => {
    // Aquí puedes agregar la lógica para destruir la sesión, por ejemplo:
    //localStorage.clear(); // Limpia el almacenamiento local
    sessionStorage.clear(); // Limpia el almacenamiento de sesión
    console.log("Sesión destruida");
  };

  const items = [
    {
      key: "0",
      icon: <HomeFilled />,
      label: <Link to={ROUTES.HOME}>Home</Link>,
    },
    {
      key: "1",
      icon: <MessageOutlined />,
      label: <Link to={ROUTES.CHAT_AI}>Chat IA</Link>,
    },
    // {
    //   key: "1",
    //   icon: <PieChartOutlined />,
    //   label: <Link to={ROUTES.STATISTICS}>Estadisticas</Link>,
    // },
    {
      key: "2",
      icon: <UploadOutlined />,
      label: "Subir Archivos",
    },
    {
      key: "3",
      icon: <UserOutlined />,
      label: "Usuario",
      children: [
        {
          key: "3-1",
          label: <Link to="/home">option</Link>,
        },
        {
          key: "3-2",
          label: (
            <Link to="/login" onClick={handleLogout}>
              Cerrar Sesión
            </Link>
          ),
        },
      ],
    },
    {
      key: "4",
      icon: <LogoutOutlined />,
      label: (
        <Link to={ROUTES.LOGIN} onClick={handleLogout}>
          logout
        </Link>
      ),
    },
  ];
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div style={{ padding: "16px", textAlign: "center" }}>
          <img
            src={TallerLogo}
            alt="Taller Logo"
            style={{ width: "80%", maxHeight: "64px", objectFit: "contain" }}
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["4"]}
          items={items}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ color: "#000", margin: 0 }}>My App</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ fontWeight: "bold" }}>
              👋 ¡Hola, {user?.nombreUsuario} {user?.apellido }!
            </div>
            <img
              src={TallerLogo}
              alt="Taller Logo"
              style={{
                height: "30px",
                width: "30px",
                borderRadius: "50%",
              }}
            />
          </div>
        </Header>

        <Content style={{ margin: "24px 16px 0" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Taller APP ©{new Date().getFullYear()} Created by ProgDAVAA
        </Footer>
      </Layout>
    </Layout>
  );
};
