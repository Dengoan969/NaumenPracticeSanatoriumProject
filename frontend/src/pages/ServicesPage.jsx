import React, { useState, useEffect } from "react";
import procedureService from "../services/procedureService";
import "../styles/ServicesPage.css";

const ServicesPage = () => {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const response = await procedureService.getAllProcedures();
        setProcedures(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Произошла ошибка при загрузке процедур");
        setLoading(false);
      }
    };

    fetchProcedures();
  }, []);

  // Группировка процедур по кабинетам
  const groupedProcedures = procedures.reduce((acc, procedure) => {
    if (!acc[procedure.cabinetId]) {
      acc[procedure.cabinetId] = {
        cabinetId: procedure.cabinetId,
        cabinetName: procedure.cabinetName,
        cabinetNumber: procedure.cabinetNumber,
        procedures: [],
      };
    }
    acc[procedure.cabinetId].procedures.push(procedure);
    return acc;
  }, {});

  // Сортировка кабинетов по номеру в порядке возрастания
  const sortedCabinets = Object.values(groupedProcedures).sort((a, b) => {
    return a.cabinetNumber.localeCompare(b.cabinetNumber, undefined, {
      numeric: true,
    });
  });

  return (
    <div className="sp-wrapper">
      <div className="sp-container">
        <div className="sp-header">
          <div className="sp-title">Услуги санатория</div>
        </div>

        <div className="sp-content">
          <div className="sp-section">
            <h3 className="sp-section-title">Основные услуги</h3>

            <div className="sp-grid">
              <div className="sp-service-card">
                <div className="sp-service-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#23618E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <h4 className="sp-service-title">Проживание</h4>
                <p className="sp-service-text">
                  Двухместные номера с отдельным санузлом и душем
                </p>
              </div>

              <div className="sp-service-card">
                <div className="sp-service-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#23618E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </div>
                <h4 className="sp-service-title">Белье</h4>
                <p className="sp-service-text">
                  Комплект белья со сменой 1 раз в 7 дней
                </p>
              </div>

              <div className="sp-service-card">
                <div className="sp-service-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#23618E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                  </svg>
                </div>
                <h4 className="sp-service-title">Питание</h4>
                <p className="sp-service-text">
                  3-х разовое горячее питание по нормам
                </p>
              </div>

              <div className="sp-service-card">
                <div className="sp-service-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#23618E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                  </svg>
                </div>
                <h4 className="sp-service-title">Лечение</h4>
                <p className="sp-service-text">
                  Комплекс лечебно-оздоровительных процедур
                </p>
              </div>

              <div className="sp-service-card">
                <div className="sp-service-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#23618E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="3"
                      width="20"
                      height="14"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <h4 className="sp-service-title">Интернет</h4>
                <p className="sp-service-text">Услуги по доступу в Интернет</p>
              </div>
            </div>
          </div>

          <div className="sp-section">
            <h3 className="sp-section-title">Лечебные процедуры</h3>

            {loading ? (
              <div className="sp-loading-message">
                <div className="sp-spinner"></div>
                <p>Загрузка данных о процедурах...</p>
              </div>
            ) : error ? (
              <div className="sp-error-message">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d32f2f"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>{error}</p>
              </div>
            ) : procedures.length === 0 ? (
              <div className="sp-no-procedures">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                <p>Нет доступных процедур</p>
              </div>
            ) : (
              <div className="sp-cabinets-container">
                {sortedCabinets.map((cabinet) => (
                  <div key={cabinet.cabinetId} className="sp-cabinet-card">
                    <h4 className="sp-cabinet-title">
                      Кабинет: {cabinet.cabinetName} (№{cabinet.cabinetNumber})
                    </h4>
                    <div className="sp-procedures-list">
                      {cabinet.procedures.map((procedure) => (
                        <div key={procedure.id} className="sp-procedure-item">
                          <div className="sp-procedure-info">
                            <h5 className="sp-procedure-name">
                              {procedure.name}
                            </h5>
                            <p className="sp-procedure-duration">
                              Продолжительность: {procedure.defaultDuration}{" "}
                              мин.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
