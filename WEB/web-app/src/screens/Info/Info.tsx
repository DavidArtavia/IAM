export const Info = () => {
  return (
    <div className="container py-5">
      <div
        className="row justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <i
                className="bi bi-house-door-fill mb-3"
                style={{ fontSize: "4rem", color: "#0d6efd" }}
              ></i>
              <h2 className="mb-2 fw-bold">¡Bienvenido!</h2>
              <p className="text-muted mb-4">
                Explora y administra toda la información relevante de la
                aplicación desde este espacio centralizado.
              </p>
              {/* Alerta de versión beta */}
              <div
                className="alert alert-info bg-opacity-10 border-info mb-4"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-2 fs-4"></i>
                  <div>
                    <strong className="d-block mb-1">Nota importante</strong>
                    Este sistema se encuentra en <b>versión Beta</b> y está en
                    constante evolución. Agradecemos su comprensión mientras
                    mejoramos la plataforma.
                  </div>
                </div>
              </div>
              <div className="row mb-4">
                <div className="col-12 col-md-6 mb-3 mb-md-0">
                  <div className="card border-0 bg-light h-100">
                    <div className="card-body">
                      <i
                        style={{ fontSize: "2rem", color: "#0d6efd" }}
                        className="bi bi-arrow-repeat"
                      ></i>
                      <h5 className="card-title fw-semibold">
                        Próximas actualizaciones
                      </h5>
                      <p className="card-text text-muted">
                        El sistema está en constante evolución para ofrecerte
                        una mejor experiencia. Próximamente podrás disfrutar de
                        nuevas funcionalidades como:
                      </p>
                      <ul className="text-muted text-start mb-0">
                        <li>
                          Pantalla de estadísticas y visualización de gráficas
                          interactivas
                        </li>
                        <li>Mejoras en la navegación y usabilidad</li>
                        <li>Reportes personalizados</li>
                        <li>Optimización de rendimiento</li>
                        <li>Integración con nuevos módulos</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-light h-100">
                    <div className="card-body">
                      <i
                        className="bi bi-shield-check mb-2"
                        style={{ fontSize: "2rem", color: "#198754" }}
                      ></i>
                      <h5 className="card-title fw-semibold">
                        Seguridad y soporte
                      </h5>
                      <p className="card-text text-muted">
                        Priorizamos la seguridad de tus datos y ofrecemos
                        soporte dedicado para resolver cualquier inconveniente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="d-flex justify-content-center gap-3 mb-3">
                <a href="/docs" className="btn btn-primary">
                  <i className="bi bi-journal-text me-2"></i>
                  Documentación
                </a>
                <a href="/soporte" className="btn btn-outline-secondary">
                  <i className="bi bi-life-preserver me-2"></i>
                  Soporte
                </a>
              </div>
              <div className="d-flex justify-content-center gap-3">
                <a href="/roadmap" className="btn btn-outline-primary">
                  <i className="bi bi-map me-2"></i>
                  Roadmap
                </a>
                <a href="/feedback" className="btn btn-outline-success">
                  <i className="bi bi-chat-dots me-2"></i>
                  Enviar feedback
                </a>
              </div> */}
              <div className="text-center mt-4">
                <small className="text-muted">
                  &copy; {new Date().getFullYear()} IAM Web App. Todos los
                  derechos reservados.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
