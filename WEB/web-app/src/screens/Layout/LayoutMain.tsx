// LayoutMain.tsx
import { useContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants";
import { Link } from "react-router-dom";
import "./LayoutMain.css";
import { useLogout } from "@/hooks/useLogout";
import { ConfirmModal } from "@/components/Modals/LoadingModal/ConfirmModal";
import { AuthContext } from "@/context/AuthContext";

declare global {
  interface Window {
    KTDrawer: { createInstances: () => void };
    KTMenu: { createInstances: () => void };
    KTScroll: { createInstances: () => void };
  }
}

export const LayoutMain = () => {
  const { user } = useContext(AuthContext);
  const asideRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  //Manejo del modal de confirmaciones
  const [confirmModalMessage, setconfirmModalMessage] = useState<string>("");
  const [confirmModalTipe, setconfirmModalTipe] = useState<string>("");

  const logout = useLogout();

  useEffect(() => {
    // añade las clases globales que exige Metronic
    document.body.classList.add("aside-enabled", "aside-fixed");
    return () => {
      document.body.classList.remove("aside-enabled", "aside-fixed");
    };
  }, []);

  useEffect(() => {
    if (asideRef.current && window.KTDrawer) {
      // (re)crea drawers, menús y scrolls después de montar el DOM
      window.KTDrawer.createInstances();
      window.KTMenu?.createInstances?.();
      window.KTScroll?.createInstances?.();
    }
  }, []);

      const limpiarConfirmModalAcion = () => {
      setconfirmModalMessage("");
      setconfirmModalTipe("");
      }

      const abrirconfirmModal = (tipo: string, mensaje: string) => {
        setconfirmModalTipe(tipo); setconfirmModalMessage(mensaje);
        //@ts-expect-error - aqui se abre el modal
        const myModal = new bootstrap.Modal(document.getElementById('confirmModal'), {keyboard: false})
        myModal.show()
      }

        const cerrarconfirmModal = () => {
        setconfirmModalTipe(""); setconfirmModalMessage("");
        //@ts-expect-error - aqui se abre el modal
        const myModal = new bootstrap.Modal(document.getElementById('confirmModal'), {keyboard: false})
        myModal.hide()
      }

    const confirmModalAcion = (action: boolean) => {
      document.querySelector('.modal-backdrop.fade.show')?.remove();
      cerrarconfirmModal();
      limpiarConfirmModalAcion();
      switch (confirmModalTipe) {
        case 'login':
          if(action)
            logout();
          break;
      
        default:
          break;
      }
  };

  return (
    <div style={{ display: "contents" }}>
      {/* ASIDE */}
      <div
        ref={asideRef}
        id="kt_aside"
        className="aside pb-5 pt-5 pt-lg-0"
        data-kt-drawer="true"
        data-kt-drawer-name="aside"
        data-kt-drawer-activate="{default: true, lg: false}"
        data-kt-drawer-overlay="true"
        data-kt-drawer-width="{default:'80px', '300px': '100px'}"
        data-kt-drawer-direction="start"
        data-kt-drawer-toggle="#kt_aside_mobile_toggle"
      >
        <div className="aside-logo py-8" id="kt_aside_logo">
          <a href="/" className="d-flex align-items-center">
            <img alt="Logo" className="h-45px logo" src="src/assets/media/logos/logo-demo-6.svg" />
          </a>
        </div>

        <div className="aside-menu flex-column-fluid" id="kt_aside_menu">
          <div
            className="hover-scroll-overlay-y my-2 my-lg-5 pe-lg-n1"
            id="kt_aside_menu_wrapper"
            data-kt-scroll="true"
            data-kt-scroll-height="auto"
            data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_footer"
            data-kt-scroll-wrappers="#kt_aside, #kt_aside_menu"
            data-kt-scroll-offset="5px"
          >
            <div
              className="menu menu-column menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 fw-bold"
              id="kt_aside_menu"
              data-kt-menu="true"
            >
              <div className="menu-item py-2">
                <Link to={ROUTES.HOME}  className={`menu-link menu-center${(pathname === ROUTES.HOME) ? " active" : ""}`} data-bs-trigger="hover"
                  data-bs-dismiss="click"
                  data-bs-placement="right">
                  <span className="menu-icon me-0">
                    <i className="bi bi-house fs-2" />
                  </span>
                  <span className="menu-title">Inicio</span>

                </Link>
              </div>

              <div className="menu-item py-2">
                <Link to={ROUTES.CHAT_AI} className={`menu-link menu-center${(pathname === ROUTES.CHAT_AI) ? " active" : ""}`} data-bs-trigger="hover"
                  data-bs-dismiss="click"
                  data-bs-placement="right">
                  <span className="menu-icon me-0">
                    <i className="bi bi-chat-left fs-2" />
                  </span>
                  <span className="menu-title">Chat</span>

                </Link>
              </div>

              <div className="menu-item py-2">
                <Link to={ROUTES.NEGOCIO} className={`menu-link menu-center${(pathname === ROUTES.NEGOCIO) ? " active" : ""}`} data-bs-trigger="hover"
                  data-bs-dismiss="click"
                  data-bs-placement="right">
                  <span className="menu-icon me-0">
                    <i className="bi bi-briefcase fs-2" />
                  </span>
                  <span className="menu-title">Negocio</span>

                </Link>
              </div>

              <div className="menu-item py-2">
                <Link to={ROUTES.MONITOR} className={`menu-link menu-center${(pathname === ROUTES.MONITOR) ? " active" : ""}`} data-bs-trigger="hover"
                  data-bs-dismiss="click"
                  data-bs-placement="right">
                  <span className="menu-icon me-0">
                    <i className="bi bi-window fs-2" />
                  </span>
                  <span className="menu-title">Monitor</span>

                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* WRAPPER */}
      <div className="wrapper d-flex flex-column flex-row-fluid pt-0" id="kt_wrapper">
        {/* HEADER */}
        <div id="kt_header" className="header align-items-stretch">
          <div className="container-fluid d-flex align-items-stretch justify-content-between">
            <div
              className="d-flex align-items-center d-lg-none ms-n1 me-2"
              title="Show aside menu"
            >
              <button
                id="kt_aside_mobile_toggle"
                className="btn btn-icon btn-active-color-primary w-30px h-30px w-md-40px h-md-40px"
                type="button"
              >
                <span className="svg-icon svg-icon-2x mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M21 7H3C2.4 7 2 6.6 2 6V4C2 3.4 2.4 3 3 3H21C21.6 3 22 3.4 22 4V6C22 6.6 21.6 7 21 7Z"
                      fill="black"
                    />
                    <path
                      opacity="0.3"
                      d="M21 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14ZM22 20V18C22 17.4 21.6 17 21 17H3C2.4 17 2 17.4 2 18V20C2 20.6 2.4 21 3 21H21C21.6 21 22 20.6 22 20Z"
                      fill="black"
                    />
                  </svg>
                </span>
              </button>
            </div>

            {/* logo móvil */}
            <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
              <a href="/" className="d-lg-none">
                <img alt="Logo" className="h-30px" src="src/assets/media/logos/logo-2.svg" />
              </a>
            </div>

            <div className="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
              <div className="d-flex align-items-stretch" id="kt_header_nav" />

              <div
                className="d-flex align-items-center ms-1 ms-lg-3"
                id="kt_header_user_menu_toggle"
              >
                <div
                  className="cursor-pointer symbol symbol-30px symbol-md-40px menu-dropdown"
                  data-kt-menu-trigger="click"
                  data-kt-menu-attach="parent"
                  data-kt-menu-placement="bottom-end"
                  data-kt-menu-flip="bottom"
                >
                  {/* <img src="src/assets/media/avatars/150-26.jpg" alt="metronic" /> */}
                  <i className="bi bi-person-fill fs-1"></i>
                </div>

                <div
                  className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px"
                  data-kt-menu="true"
                  data-popper-placement="bottom-end"
                  style={{
                    zIndex: 105,
                    position: "fixed",
                    inset: "0 auto auto 0",
                    margin: 0,
                    transform: "translate(1382px, 65px)",
                  }}
                >
                  <div className="menu-item px-3">
                    <div className="menu-content d-flex align-items-center px-3">
                      <div className="symbol symbol-50px me-5">
                        <img
                          alt="Logo"
                          src="src/assets/media/avatars/150-26.jpg"
                        />
                      </div>

                      <div className="d-flex flex-column">
                        <div className="fw-bolder d-flex align-items-center fs-5">
                          {user?.nombreUsuario + ' ' + user?.apellido}

                        </div>
                        <a

                          className="fw-bold text-muted text-hover-primary fs-7"
                        >
                         {user?.correoUsuario}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="separator my-2" />

                  <div className="menu-item px-5">
                    <a className="menu-link px-5">
                      Mi perfil
                    </a>
                  </div>



                  <div
                    className="menu-item px-5"
                    data-kt-menu-trigger="hover"
                    data-kt-menu-placement="left-start"
                    data-kt-menu-flip="bottom, top"
                  >



                  </div>



                  <div className="separator my-2" />



                  <div className="menu-item px-5">
                    <a onClick={() => {abrirconfirmModal("login", "¿Desea cerrar la sesión?");}}

                      className="menu-link px-5"
                    >
                      Cerrar Sesión
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="content d-flex flex-column flex-column-fluid mt-10" id="kt_content">
          <Outlet /> {/* aquí se renderizan las rutas hijas */}
        </div>

        {/* FOOTER */}
        <div className="footer py-4 d-flex flex-lg-column" id="kt_footer">
          <div className="container-fluid d-flex flex-column flex-md-row align-items-center justify-content-between">
            <div className="text-dark order-2 order-md-1">
              <span className="text-muted fw-bold me-1">{new Date().getFullYear()}©</span>
              <a

                target="_blank"
                rel="noreferrer"
                className="text-gray-800 text-hover-primary"
              >
                Desarrollado por
              </a>
            </div>
          </div>
        </div>
      </div>


         <ConfirmModal confirmMessage={confirmModalMessage} onAction={() => confirmModalAcion} />
        


    </div>
  );
};
