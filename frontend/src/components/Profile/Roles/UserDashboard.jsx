import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import UserDashboardService from "../../../services/UserDashboard.service";
import "../../../styles/Dashboard.css";

const UserDashboard = () => {
  const { user: currentUser, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [activeShifts, setActiveShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedCabinet, setSelectedCabinet] = useState(null);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, shiftsData, activeShiftsData] = await Promise.all([
          UserDashboardService.getProfile(currentUser.id, token),
          UserDashboardService.getShifts(currentUser.id, token),
          UserDashboardService.getActiveShifts(),
        ]);

        setProfile(profileData);
        setShifts(shiftsData);
        setActiveShifts(activeShiftsData);
      } catch (err) {
        console.error("API Error:", err);
        showNotification(
          err.response?.data?.message || "Ошибка загрузки данных",
          "error",
        );
        setError(err.response?.data?.message || "Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.id, token]);

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

  const getUniqueCabinets = (shift) => {
    if (!shift || !shift.appointments) return [];
    const cabinetsMap = new Map();
    shift.appointments.forEach((app) => {
      if (!cabinetsMap.has(app.cabinetNumber)) {
        cabinetsMap.set(app.cabinetNumber, {
          cabinetNumber: app.cabinetNumber,
          cabinetName: app.cabinetName,
        });
      }
    });
    return Array.from(cabinetsMap.values());
  };

  const getProceduresForCabinet = (shift, cabinetNumber) => {
    if (!shift || !shift.appointments) return [];
    return shift.appointments.filter(
      (app) => app.cabinetNumber === cabinetNumber,
    );
  };

  const getProcedureCompletions = (procedureId, shift) => {
    if (!shift || !shift.completedProcedures) return [];
    return shift.completedProcedures
      .filter((cp) => cp.appointmentId === procedureId)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("ru-RU", options);
  };

  const formatDateTime = (dateString) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("ru-RU", options);
  };

  if (loading)
    return (
      <div className="content-wrapper">
        <div className="main-container">
          <div className="main-content">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i> Загрузка данных...
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="content-wrapper">
        <div className="main-container">
          <div className="main-content">
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="content-wrapper">
      <div className="main-container">
        <div className="main-content">
          <div className="registrar-header">
            <h1 className="registrar-title">Личный кабинет</h1>
            <div className="registrar-welcome">
              <span>Здравствуйте! {currentUser?.fullName}</span>
              <div className="registrar-role-icon">
                <i className="fas fa-user"></i>
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
              {/* Блок профиля */}
              <div className="users-controls">
                <div className="users-list-header">
                  <h2 className="users-list-title">Мой профиль</h2>
                </div>
              </div>

              {profile && (
                <div className="profile-info-card">
                  <div className="profile-grid">
                    <div className="profile-field">
                      <div className="profile-field-label">
                        <i className="fas fa-user-tag"></i> ФИО
                      </div>
                      <div className="profile-field-value highlight-text">
                        {profile.fullName}
                      </div>
                    </div>

                    <div className="profile-field">
                      <div className="profile-field-label">
                        <i className="fas fa-envelope"></i> Email
                      </div>
                      <div className="profile-field-value highlight-email">
                        {profile.email}
                      </div>
                    </div>

                    <div className="profile-field">
                      <div className="profile-field-label">
                        <i className="fas fa-phone"></i> Телефон
                      </div>
                      <div className="profile-field-value highlight-phone">
                        {profile.phone || (
                          <span className="empty-value">Не указан</span>
                        )}
                      </div>
                    </div>

                    <div className="profile-field">
                      <div className="profile-field-label">
                        <i className="fas fa-birthday-cake"></i> Дата рождения
                      </div>
                      <div className="profile-field-value highlight-date">
                        {profile.birthDate ? (
                          formatDate(profile.birthDate)
                        ) : (
                          <span className="empty-value">Не указана</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Блок смен */}
              <div className="users-controls" style={{ marginTop: "20px" }}>
                <div className="users-list-header">
                  <h2 className="users-list-title">Мои смены</h2>
                  <button
                    className="action-btn archive-btn"
                    onClick={() => setShowArchived(!showArchived)}
                  >
                    <i
                      className={`fas ${showArchived ? "fa-eye-slash" : "fa-archive"}`}
                    ></i>
                    {showArchived ? "Скрыть архив" : "Показать архив"}
                  </button>
                </div>
              </div>

              <div className="shifts-list">
                {shifts.length > 0 ? (
                  <div className="shifts-container">
                    {shifts
                      .filter(
                        (shift) =>
                          showArchived ||
                          activeShifts.some((s) => s.id === shift.shiftId),
                      )
                      .map((shift) => (
                        <div
                          key={shift.shiftId}
                          className={`shift-item ${selectedShift?.shiftId === shift.shiftId ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedShift(shift);
                            setSelectedCabinet(null);
                          }}
                        >
                          <div className="shift-name">{shift.shiftName}</div>
                          <div className="shift-dates">
                            {formatDate(shift.startDate)} -{" "}
                            {formatDate(shift.endDate)}
                            {!activeShifts.some(
                              (s) => s.id === shift.shiftId,
                            ) && <span className="archived-badge">Архив</span>}
                          </div>
                          <div className="shift-status">
                            {shift.roomNumber
                              ? `Комната: ${shift.roomNumber}`
                              : "Оформление без комнаты"}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p>Нет данных о сменах</p>
                )}
              </div>
            </div>

            <div className="user-details-section">
              <div className="user-details-header">
                <h2 className="user-details-title">
                  {selectedShift
                    ? `Смена: ${selectedShift.shiftName}`
                    : "Выберите смену"}
                </h2>
              </div>

              {selectedShift ? (
                <>
                  {!selectedCabinet ? (
                    <div className="shift-details">
                      <div className="registration-info">
                        <p>
                          <strong>Период:</strong>{" "}
                          {formatDate(selectedShift.startDate)} —{" "}
                          {formatDate(selectedShift.endDate)}
                        </p>
                        <p>
                          <strong>Оформление:</strong>
                          {selectedShift.roomNumber
                            ? ` Комната ${selectedShift.roomNumber}${selectedShift.roomDescription ? ` (${selectedShift.roomDescription})` : ""}`
                            : " Без комнаты"}
                        </p>
                        <p>
                          <strong>Процедуры:</strong>{" "}
                          {selectedShift.appointments.length} назначено,{" "}
                          {selectedShift.completedProcedures?.length || 0}{" "}
                          выполнено (общее количество)
                        </p>
                      </div>

                      <h4 className="cabinets-title">
                        <i className="fas fa-door-open"></i> Доступные кабинеты
                      </h4>

                      <div className="cabinets-list">
                        {getUniqueCabinets(selectedShift).length > 0 ? (
                          getUniqueCabinets(selectedShift).map((cabinet) => (
                            <div
                              key={cabinet.cabinetNumber}
                              className={`cabinet-item ${selectedCabinet?.cabinetNumber === cabinet.cabinetNumber ? "selected" : ""}`}
                              onClick={() => setSelectedCabinet(cabinet)}
                            >
                              <div className="cabinet-number">
                                Кабинет {cabinet.cabinetNumber}
                              </div>
                              <div className="cabinet-name">
                                {cabinet.cabinetName}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p>Нет назначенных кабинетов</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="shift-procedures">
                      <div className="procedures-header">
                        <h3>
                          <i className="fas fa-door-open"></i> Кабинет{" "}
                          {selectedCabinet.cabinetNumber}:{" "}
                          {selectedCabinet.cabinetName}
                        </h3>
                        <button
                          className="action-btn back-btn"
                          onClick={() => setSelectedCabinet(null)}
                        >
                          <i className="fas fa-chevron-left"></i> Назад
                        </button>
                      </div>

                      <div className="procedure-group">
                        <h4>
                          <i className="fas fa-procedures"></i> Назначенные
                          процедуры
                        </h4>
                        {getProceduresForCabinet(
                          selectedShift,
                          selectedCabinet.cabinetNumber,
                        ).length > 0 ? (
                          <ul className="procedures-list">
                            {getProceduresForCabinet(
                              selectedShift,
                              selectedCabinet.cabinetNumber,
                            ).map((procedure) => {
                              const completions = getProcedureCompletions(
                                procedure.id,
                                selectedShift,
                              );
                              return (
                                <li
                                  key={procedure.id}
                                  className="procedure-item"
                                >
                                  <div className="procedure-info">
                                    <span className="procedure-name">
                                      {procedure.procedureName}
                                      <span className="procedure-duration">
                                        ({procedure.defaultDuration} мин.)
                                      </span>
                                    </span>
                                    <span className="procedure-note">
                                      {procedure.notes || (
                                        <span className="no-note">
                                          (нет примечания)
                                        </span>
                                      )}
                                    </span>
                                    <div className="procedure-meta">
                                      <small>
                                        <i className="fas fa-user-md"></i>{" "}
                                        Назначил: {procedure.doctorName}
                                      </small>
                                      <small>
                                        <i className="far fa-calendar-alt"></i>{" "}
                                        Дата назначения:{" "}
                                        {formatDate(procedure.appointmentDate)}
                                      </small>
                                    </div>
                                    {completions.length > 0 && (
                                      <div className="completion-history">
                                        <small>
                                          <i className="fas fa-history"></i>{" "}
                                          Выполнено раз: {completions.length}
                                        </small>
                                        <small>
                                          <i className="far fa-calendar-check"></i>{" "}
                                          Последний раз:{" "}
                                          {formatDateTime(
                                            completions[0].completedAt,
                                          )}
                                        </small>
                                      </div>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p>Нет назначенных процедур для этого кабинета</p>
                        )}
                      </div>

                      {/* История выполненных процедур */}
                      <div className="procedure-history-section">
                        <h4 className="history-title">
                          <i className="fas fa-history"></i> История выполненных
                          процедур в кабинете {selectedCabinet.cabinetNumber}
                        </h4>
                        <div className="history-container">
                          {selectedShift.completedProcedures?.filter((cp) =>
                            getProceduresForCabinet(
                              selectedShift,
                              selectedCabinet.cabinetNumber,
                            ).some((app) => app.id === cp.appointmentId),
                          ).length > 0 ? (
                            selectedShift.completedProcedures
                              .filter((cp) =>
                                getProceduresForCabinet(
                                  selectedShift,
                                  selectedCabinet.cabinetNumber,
                                ).some((app) => app.id === cp.appointmentId),
                              )
                              .sort(
                                (a, b) =>
                                  new Date(b.completedAt) -
                                  new Date(a.completedAt),
                              )
                              .map((completion, idx) => {
                                const procedure =
                                  selectedShift.appointments.find(
                                    (app) =>
                                      app.id === completion.appointmentId,
                                  );
                                return (
                                  <div
                                    key={idx}
                                    className="procedure-history-item"
                                  >
                                    <div className="procedure-history-header">
                                      <span className="procedure-name">
                                        {completion.procedureName}
                                      </span>
                                      <span className="procedure-date">
                                        {formatDateTime(completion.completedAt)}
                                      </span>
                                    </div>
                                    <div className="completion-details">
                                      <p>
                                        <i className="fas fa-user-md"></i>{" "}
                                        Выполнил: {completion.completedByName}
                                      </p>
                                      {completion.notes && (
                                        <p>
                                          <i className="fas fa-sticky-note"></i>{" "}
                                          Примечание: {completion.notes}
                                        </p>
                                      )}
                                      {procedure && (
                                        <p>
                                          <i className="fas fa-calendar-plus"></i>{" "}
                                          Дата назначения:{" "}
                                          {formatDate(
                                            procedure.appointmentDate,
                                          )}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                          ) : (
                            <div className="no-history">
                              Нет данных о выполненных процедурах в этом
                              кабинете
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-user-selected">
                  <p>Выберите смену из списка для просмотра деталей</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
