import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import NurseDashboardService from "../../../services/NurseDashboard.service";
import "../../../styles/Dashboard.css";

const NurseDashboard = () => {
  const { user: currentUser, token } = useAuth();

  // Состояния для кабинетов
  const [assignedCabinets, setAssignedCabinets] = useState([]);
  const [selectedCabinet, setSelectedCabinet] = useState(null);

  // Состояния для смен
  const [activeShifts, setActiveShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);

  // Состояния для пациентов
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Состояния для процедур
  const [patientProcedures, setPatientProcedures] = useState([]);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });

  const getCurrentLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getProcedureCompletionDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const loadAssignedCabinets = async () => {
      try {
        const cabinets = await NurseDashboardService.getAssignedCabinets(
          currentUser.id,
          token,
        );
        setAssignedCabinets(cabinets);
      } catch (error) {
        showNotification("Ошибка загрузки кабинетов", "error");
        console.error("Ошибка загрузки кабинетов:", error);
      }
    };
    loadAssignedCabinets();
  }, [currentUser.id, token]);

  useEffect(() => {
    const loadActiveShifts = async () => {
      try {
        const shifts = await NurseDashboardService.getActiveShifts(token);
        setActiveShifts(shifts);
      } catch (error) {
        showNotification("Ошибка загрузки смен", "error");
        console.error("Ошибка загрузки смен:", error);
      }
    };
    loadActiveShifts();
  }, [token]);

  useEffect(() => {
    if (selectedCabinet && selectedShift && token) {
      const loadPatients = async () => {
        try {
          const patientsData =
            await NurseDashboardService.getPatientsForCabinetAndShift(
              selectedCabinet.cabinetId,
              selectedShift.id,
              token,
            );
          setPatients(patientsData);
          setSelectedPatient(null);
        } catch (error) {
          console.error("Ошибка загрузки пациентов:", error);
          showNotification("Ошибка загрузки пациентов", "error");
        }
      };
      loadPatients();
    }
  }, [selectedCabinet, selectedShift, token]);

  useEffect(() => {
    if (selectedPatient && selectedCabinet && token) {
      const loadProcedures = async () => {
        try {
          const proceduresForCabinet = selectedPatient.procedures.filter(
            (proc) => proc.cabinetNumber === selectedCabinet.cabinetNumber,
          );

          const proceduresWithCompletions = await Promise.all(
            proceduresForCabinet.map(async (proc) => {
              const completions =
                await NurseDashboardService.getProcedureCompletions(
                  proc.id,
                  token,
                );
              return {
                ...proc,
                completions,
                completedToday: completions.some(
                  (c) =>
                    getProcedureCompletionDate(c.completedAt) ===
                    getCurrentLocalDate(),
                ),
              };
            }),
          );

          setPatientProcedures(proceduresWithCompletions);
        } catch (error) {
          console.error("Ошибка загрузки процедур:", error);
          showNotification("Ошибка загрузки процедур", "error");
        }
      };
      loadProcedures();
    }
  }, [selectedPatient, selectedCabinet, token]);

  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
      setTimeout(
        () => setNotification({ message: "", type: "", visible: false }),
        300,
      );
    }, 5000);
  };

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.fullName.toLowerCase().includes(searchLower) ||
      (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
      (patient.phone && patient.phone.toLowerCase().includes(searchLower))
    );
  });

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const handleCompleteProcedure = async (procedureId) => {
    if (!window.confirm("Отметить процедуру как выполненную на сегодня?"))
      return;
    try {
      await NurseDashboardService.markProcedureAsCompleted(
        procedureId,
        currentUser.id,
        `Выполнено ${new Date().toLocaleDateString()}`,
        token,
      );

      const proceduresForCabinet = selectedPatient.procedures.filter(
        (proc) => proc.cabinetNumber === selectedCabinet.cabinetNumber,
      );

      const proceduresWithCompletions = await Promise.all(
        proceduresForCabinet.map(async (proc) => {
          const completions =
            await NurseDashboardService.getProcedureCompletions(proc.id, token);
          return {
            ...proc,
            completions,
            completedToday: completions.some(
              (c) =>
                getProcedureCompletionDate(c.completedAt) ===
                getCurrentLocalDate(),
            ),
          };
        }),
      );

      setPatientProcedures(proceduresWithCompletions);

      showNotification(
        "Процедура успешно отмечена как выполненная на сегодня",
        "success",
      );
    } catch (error) {
      showNotification("Ошибка при отметке процедуры", "error");
      console.error("Ошибка при отметке процедуры:", error);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="main-container">
        <div className="main-content">
          <div className="registrar-header">
            <h1 className="registrar-title">Кабинет медработника</h1>
            <div className="registrar-welcome">
              <span>Здравствуйте! {currentUser?.fullName}</span>
              <div className="registrar-role-icon">
                <i className="fas fa-user-nurse"></i>
              </div>
            </div>
          </div>

          <div
            className={`notification-container ${notification.visible ? "visible" : ""}`}
          >
            {notification.message && (
              <div className={`notification ${notification.type}`}>
                <i
                  className={`fas ${notification.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}
                ></i>
                {notification.message}
              </div>
            )}
          </div>

          <div className="registrar-content">
            <div className="users-section">
              <div className="users-controls">
                <div className="users-list-header">
                  <h2 className="users-list-title">Мои кабинеты</h2>
                </div>
              </div>

              <div className="shifts-list">
                {assignedCabinets.length > 0 ? (
                  <div className="shifts-container">
                    {assignedCabinets.map((cabinet) => (
                      <div
                        key={cabinet.cabinetId}
                        className={`shift-item ${selectedCabinet?.cabinetId === cabinet.cabinetId ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedCabinet(cabinet);
                          setSelectedShift(null);
                          setSelectedPatient(null);
                        }}
                      >
                        <div className="shift-name">
                          Кабинет {cabinet.cabinetNumber}
                        </div>
                        <div className="shift-dates">{cabinet.cabinetName}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Нет закрепленных кабинетов</p>
                )}
              </div>

              {selectedCabinet && (
                <>
                  <div className="users-controls" style={{ marginTop: "20px" }}>
                    <div className="users-list-header">
                      <h2 className="users-list-title">Активные смены</h2>
                    </div>
                  </div>

                  <div className="shifts-list">
                    {activeShifts.length > 0 ? (
                      <div className="shifts-container">
                        {activeShifts.map((shift) => (
                          <div
                            key={shift.id}
                            className={`shift-item ${selectedShift?.id === shift.id ? "selected" : ""}`}
                            onClick={() => {
                              setSelectedShift(shift);
                              setSelectedPatient(null);
                            }}
                          >
                            <div className="shift-name">{shift.name}</div>
                            <div className="shift-dates">
                              {new Date(shift.startDate).toLocaleDateString()} -{" "}
                              {new Date(shift.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Нет активных смен</p>
                    )}
                  </div>
                </>
              )}

              {selectedShift && (
                <>
                  <div className="users-controls" style={{ marginTop: "20px" }}>
                    <div className="users-list-header">
                      <h2 className="users-list-title">Пациенты</h2>
                      <div className="search-user">
                        <i className="fas fa-search"></i>
                        <input
                          type="text"
                          placeholder="Поиск пациента"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="users-list-container">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className={`user-item ${selectedPatient?.id === patient.id ? "active" : ""}`}
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <div className="user-avatar">
                            {getInitials(patient.fullName)}
                          </div>
                          <div className="user-info">
                            <h3 className="user-name">{patient.fullName}</h3>
                            <p className="user-details">
                              Тел.: {patient.phone} | Email: {patient.email}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>Пациенты не найдены</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="user-details-section">
              <div className="user-details-header">
                <h2 className="user-details-title">
                  {selectedPatient
                    ? `Процедуры пациента: ${selectedPatient.fullName}`
                    : "Выберите пациента"}
                </h2>
              </div>

              {selectedPatient && selectedCabinet ? (
                <>
                  {patientProcedures.length > 0 ? (
                    <div className="shift-registration-section">
                      <div className="procedure-group">
                        <h4>
                          Кабинет {selectedCabinet.cabinetNumber}:{" "}
                          {selectedCabinet.cabinetName}
                        </h4>
                        <ul className="procedures-list">
                          {patientProcedures.map((procedure) => (
                            <li key={procedure.id} className="procedure-item">
                              <div className="procedure-info">
                                <span className="procedure-name">
                                  {procedure.procedureName}
                                  <span className="procedure-duration">
                                    ({procedure.defaultDuration} мин.)
                                  </span>
                                  {procedure.completedToday && (
                                    <span className="completed-badge">
                                      <i className="fas fa-check-circle"></i>{" "}
                                      Выполнено сегодня
                                    </span>
                                  )}
                                </span>
                                <span className="procedure-note">
                                  {procedure.notes || (
                                    <span className="no-note">
                                      (нет примечания)
                                    </span>
                                  )}
                                </span>
                                {procedure.completions?.length > 0 && (
                                  <div className="completion-history">
                                    <small>
                                      <i className="fas fa-history"></i>{" "}
                                      Выполнено раз:{" "}
                                      {procedure.completions.length}
                                    </small>
                                    <small>
                                      <i className="far fa-calendar-alt"></i>{" "}
                                      Последний раз:{" "}
                                      {new Date(
                                        [...procedure.completions].sort(
                                          (a, b) =>
                                            new Date(b.completedAt) -
                                            new Date(a.completedAt),
                                        )[0].completedAt,
                                      ).toLocaleString("ru-RU", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </small>
                                  </div>
                                )}
                              </div>
                              <div className="procedure-actions">
                                {!procedure.completedToday && (
                                  <button
                                    className="action-btn complete-btn"
                                    onClick={() =>
                                      handleCompleteProcedure(procedure.id)
                                    }
                                    title="Отметить как выполненную"
                                  >
                                    <i className="fas fa-check"></i> Отметить
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Блок истории выполненных процедур */}
                      <div className="procedure-history-section">
                        <h4 className="history-title">
                          <i className="fas fa-history"></i> История выполненных
                          процедур
                        </h4>
                        <div className="history-container">
                          {patientProcedures.some(
                            (proc) => proc.completions?.length > 0,
                          ) ? (
                            patientProcedures
                              .filter((proc) => proc.completions?.length > 0)
                              .map((procedure) => (
                                <div
                                  key={`history-${procedure.id}`}
                                  className="procedure-history-item"
                                >
                                  <div className="procedure-history-header">
                                    <span className="procedure-name">
                                      {procedure.procedureName}
                                    </span>
                                    <span className="procedure-count">
                                      Выполнено раз:{" "}
                                      {procedure.completions.length}
                                    </span>
                                  </div>
                                  <div className="completion-dates">
                                    {procedure.completions
                                      .sort(
                                        (a, b) =>
                                          new Date(b.completedAt) -
                                          new Date(a.completedAt),
                                      )
                                      .map((completion, idx) => (
                                        <div
                                          key={idx}
                                          className="completion-date"
                                        >
                                          <i className="far fa-calendar-check"></i>
                                          {new Date(
                                            completion.completedAt,
                                          ).toLocaleString("ru-RU", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                          <span className="completed-by">
                                            (Медработник:{" "}
                                            {completion.completedByName ||
                                              "не указан"}
                                            )
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="no-history">
                              Нет данных о выполненных процедурах
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-user-selected">
                      <p>Нет назначенных процедур для данного кабинета</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-user-selected">
                  <p>
                    {!selectedCabinet
                      ? "Выберите кабинет из списка"
                      : !selectedShift
                        ? "Выберите смену"
                        : "Выберите пациента из списка для просмотра процедур"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
