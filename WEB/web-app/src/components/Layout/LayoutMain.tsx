// LayoutMain.tsx
import { ROUTES } from "@/constants/routes";
import TallerLogo from "@/assets/media/logos/TallerLogo.png";
import { Outlet } from "react-router-dom";
import "./LayoutMain.css";
import { Link } from "react-router-dom";
import {
  HomeFilled,
  UploadOutlined,
  UserOutlined,
  LogoutOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Modal, theme } from "antd";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useLogout } from "@/hooks/useLogout";

const { Header, Content, Footer, Sider } = Layout;

export const LayoutMain = () => {
  const logout = useLogout();
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const { nombreUsuario = "", apellido = "" } = user || {};

  const showModal = () => {
    setOpen(true);
  };
  const handleCancel = () => {
    setOpen(false);
  };
  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
      logout();
    }, 2000);
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
          label: <Link to="/home">option1</Link>,
        },
        {
          key: "3-1",
          label: <Link to="/home">option2</Link>,
        },
      ],
    },
    {
      key: "4",
      icon: <LogoutOutlined />,
      label: "Cerrar sesión",
      onClick: showModal,
    },
  ];
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout>
      <Modal
        title="Confirmar cierre de sesión"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <p>¿Está seguro que desea cerrar sesión?</p>
      </Modal>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
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
              👋 ¡Hola, {nombreUsuario} {apellido}!
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
