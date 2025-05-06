import { useState } from "react";
import { Progress, Select, Checkbox, Switch, Button } from "antd";
import "./Statistics.css";

// type Props = {};

export const Statistics = () => {
  // Estado para manejar los filtros si fuera necesario
  const [filterStatus, setFilterStatus] = useState("");
  const [authorChecked, setAuthorChecked] = useState(false);
  const [customerChecked, setCustomerChecked] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [counter, setCounter] = useState(0);

  return (
    <div className="statistics-column">
      {/* Mixed Widget 4 */}
      <div className="statistics-card">
        {/* Header */}
        <div className="statistics-card-header">
          <h3 className="statistics-card-title">
            <span className="statistics-title-label">Action Needed</span>
            <span className="statistics-title-subtitle">
              Complete your profile setup
            </span>
          </h3>
          <div className="statistics-card-toolbar">
            {/* Menu Button */}
            <button
              type="button"
              className="statistics-menu-button"
              onClick={() => {
                // Aquí iría la lógica para mostrar/ocultar el menú
                console.log("Menu clicked");
              }}
            >
              {/* SVG Icon */}
              <span className="statistics-svg-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24px"
                  height="24px"
                  viewBox="0 0 24 24"
                >
                  <g
                    stroke="none"
                    strokeWidth="1"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <rect
                      x="5"
                      y="5"
                      width="5"
                      height="5"
                      rx="1"
                      fill="#000000"
                    ></rect>
                    <rect
                      x="14"
                      y="5"
                      width="5"
                      height="5"
                      rx="1"
                      fill="#000000"
                      opacity="0.3"
                    ></rect>
                    <rect
                      x="5"
                      y="14"
                      width="5"
                      height="5"
                      rx="1"
                      fill="#000000"
                      opacity="0.3"
                    ></rect>
                    <rect
                      x="14"
                      y="14"
                      width="5"
                      height="5"
                      rx="1"
                      fill="#000000"
                      opacity="0.3"
                    ></rect>
                  </g>
                </svg>
              </span>
            </button>

            {/* Filter Menu - Podría convertirse en su propio componente */}
            <div className="statistics-menu">
              {/* Header */}
              <div className="statistics-menu-header">
                <div className="statistics-menu-title">Filter Options</div>
              </div>

              {/* Separator */}
              <div className="statistics-separator"></div>

              {/* Form */}
              <div className="statistics-form">
                {/* Status Input Group */}
                <div className="statistics-input-group">
                  <label className="statistics-label">Status:</label>
                  <div>
                    <Select
                      className="statistics-select"
                      value={filterStatus}
                      onChange={(value) => setFilterStatus(value)}
                      style={{ width: "100%" }}
                      placeholder="Select option"
                      options={[
                        { value: "1", label: "Approved" },
                        { value: "2", label: "Pending" },
                        { value: "3", label: "In Process" },
                        { value: "4", label: "Rejected" },
                      ]}
                    />
                  </div>
                </div>

                {/* Member Type Input Group */}
                <div className="statistics-input-group">
                  <label className="statistics-label">Member Type:</label>
                  <div className="statistics-checkbox-group">
                    {/* Author Checkbox */}
                    <Checkbox
                      className="statistics-checkbox-label"
                      checked={authorChecked}
                      onChange={(e) => setAuthorChecked(e.target.checked)}
                    >
                      <span className="statistics-checkbox-text">Author</span>
                    </Checkbox>

                    {/* Customer Checkbox */}
                    <Checkbox
                      className="statistics-checkbox-label"
                      checked={customerChecked}
                      onChange={(e) => setCustomerChecked(e.target.checked)}
                    >
                      <span className="statistics-checkbox-text">Customer</span>
                    </Checkbox>
                  </div>
                </div>

                {/* Notifications Input Group */}
                <div className="statistics-input-group">
                  <label className="statistics-label">Notifications:</label>
                  <div className="statistics-switch">
                    <Switch
                      checked={notificationsEnabled}
                      onChange={(checked) => setNotificationsEnabled(checked)}
                      size="small"
                    />
                    <label className="statistics-switch-label">Enabled</label>
                  </div>
                </div>

                {/* Actions */}
                <div className="statistics-actions">
                  <Button
                    type="default"
                    size="small"
                    className="statistics-reset-button"
                    onClick={() => {
                      // Reset logic
                      setFilterStatus("");
                      setAuthorChecked(false);
                      setCustomerChecked(true);
                      setNotificationsEnabled(true);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    className="statistics-apply-button"
                    onClick={() => {
                      // Apply filters logic
                      console.log("Filters applied");
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="statistics-card-body">
          <div className="statistics-chart-container">
            {/* Usando el componente Progress de Ant Design */}
            <Progress
              type="dashboard"
              percent={counter}
              width={200}
              strokeColor="#00bfff"
              trailColor="#000"
              strokeWidth={10}
              format={(percent) => `${percent}%`}
            />
          </div>

          <div className="statistics-footer">
            <p className="statistics-note">
              <span className="statistics-badge">Notes:</span>&nbsp; Current
              sprint requires stakeholders
              <br />
              to approve newly amended policies
            </p>
            <Button
              type="primary"
              block
              size="large"
              className="statistics-action-button"
              onClick={() => {
                // Acción al hacer clic en el botón
                setCounter(counter + 2);
              }}
            >
              Incrementar ➕ 2️⃣
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
