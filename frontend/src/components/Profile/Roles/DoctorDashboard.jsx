import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import shiftService from "../../../services/ShiftService";
import doctorDashboardService from "../../../services/DoctorDashboard.service";
import "../../../styles/Dashboard.css";

const DoctorDashboard = () => {
  const { user: currentUser, token } = useAuth();

  const [activeShifts, setActiveShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientProcedures, setPatientProcedures] = useState([]);
  const [allProcedures, setAllProcedures] = useState([]);
  const [isProcedureFormOpen, setIsProcedureFormOpen] = useState(false);
  const [procedureFormData, setProcedureFormData] = useState({
    procedureId: "",
    note: "",
  });
  const [procedureSearchTerm, setProcedureSearchTerm] = useState("");
  const [editingNote, setEditingNote] = useState({
    id: null,
    note: "",
  });
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [shiftsData, proceduresData] = await Promise.all([
          shiftService.getActiveShifts(token),
          doctorDashboardService.getAllProcedures(token),
        ]);
        setActiveShifts(shiftsData);
        setAllProcedures(proceduresData);
      } catch (error) {
        showNotification("Ошибка загрузки данных", "error");
        console.error("Ошибка загрузки:", error);
      }
    };
    loadInitialData();
  }, [token]);

  useEffect(() => {
    if (selectedShift) {
      setSelectedPatient(null);
      setPatientProcedures([]);
    }
  }, [selectedShift]);

  useEffect(() => {
    const loadShiftPatients = async () => {
      if (selectedShift && token) {
        try {
          const registrations =
            await doctorDashboardService.getShiftRegistrations(
              selectedShift.id,
              token,
            );
          const patientsData = registrations.map((reg) => ({
            id: reg.userId,
            fullName: reg.userFullName,
            phone: reg.userPhone || "не указан",
            email: reg.userEmail || "не указан",
            roomNumber: reg.roomNumber,
          }));
          setPatients(patientsData);
        } catch (error) {
          console.error("Ошибка загрузки пациентов:", error);
          showNotification("Ошибка загрузки пациентов", "error");
        }
      }
    };
    loadShiftPatients();
  }, [selectedShift, token]);

  useEffect(() => {
    const loadPatientProcedures = async () => {
      if (selectedPatient && selectedShift && token) {
        try {
          const procedures = await doctorDashboardService.getPatientProcedures(
            selectedPatient.id,
            selectedShift.id,
            token,
          );
          setPatientProcedures(procedures);
        } catch (error) {
          console.error("Ошибка загрузки процедур:", error);
          showNotification("Ошибка загрузки процедур", "error");
        }
      } else {
        setPatientProcedures([]);
      }
    };
    loadPatientProcedures();
  }, [selectedPatient, selectedShift, token]);

  const filteredProcedures = allProcedures.filter((procedure) => {
    const searchLower = procedureSearchTerm.toLowerCase();
    return (
      procedure.name.toLowerCase().includes(searchLower) ||
      procedure.cabinetName.toLowerCase().includes(searchLower) ||
      procedure.cabinetNumber.toString().includes(searchLower)
    );
  });

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

  const groupedProcedures = patientProcedures.reduce((acc, appointment) => {
    const key = `${appointment.cabinetNumber}`;
    if (!acc[key]) {
      acc[key] = {
        cabinetNumber: appointment.cabinetNumber,
        cabinetName: appointment.cabinetName,
        procedures: [],
      };
    }
    acc[key].procedures.push({
      id: appointment.id,
      name: appointment.procedureName,
      note: appointment.notes,
      cabinetNumber: appointment.cabinetNumber,
      cabinetName: appointment.cabinetName,
      duration: appointment.defaultDuration,
    });
    return acc;
  }, {});

  const handleAddProcedure = async (e) => {
    e.preventDefault();
    if (!procedureFormData.procedureId) {
      showNotification("Выберите процедуру", "error");
      return;
    }

    try {
      await doctorDashboardService.assignProcedureToPatient(
        selectedPatient.id,
        procedureFormData.procedureId,
        procedureFormData.note,
        currentUser.id,
        selectedShift.id,
        token,
      );
      showNotification("Процедура успешно добавлена", "success");
      const updatedProcedures =
        await doctorDashboardService.getPatientProcedures(
          selectedPatient.id,
          selectedShift.id,
          token,
        );
      setPatientProcedures(updatedProcedures);
      setProcedureFormData({ procedureId: "", note: "" });
      setProcedureSearchTerm("");
      setIsProcedureFormOpen(false);
    } catch (error) {
      showNotification("Ошибка при добавлении процедуры", "error");
      console.error("Ошибка при добавлении процедуры:", error);
    }
  };

  const handleDeleteProcedure = async (appointmentId) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту процедуру?"))
      return;
    try {
      await doctorDashboardService.removeProcedureFromPatient(
        appointmentId,
        token,
      );
      showNotification("Процедура успешно удалена", "success");
      const updatedProcedures =
        await doctorDashboardService.getPatientProcedures(
          selectedPatient.id,
          selectedShift.id,
          token,
        );
      setPatientProcedures(updatedProcedures);
    } catch (error) {
      showNotification("Ошибка при удалении процедуры", "error");
      console.error("Ошибка при удалении процедуры:", error);
    }
  };

  const handleEditNote = (procedure) => {
    setEditingNote({
      id: procedure.id,
      note: procedure.note || "",
    });
  };

  const handleSaveNote = async (appointmentId) => {
    try {
      await doctorDashboardService.updateProcedureNote(
        appointmentId,
        editingNote.note,
        token,
      );
      showNotification("Примечание успешно обновлено", "success");
      setPatientProcedures((prevProcedures) =>
        prevProcedures.map((proc) =>
          proc.id === appointmentId
            ? { ...proc, notes: editingNote.note }
            : proc,
        ),
      );
      setEditingNote({ id: null, note: "" });
    } catch (error) {
      console.error("Ошибка при сохранении примечания:", error);
      showNotification("Ошибка при обновлении примечания", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingNote({ id: null, note: "" });
  };

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.fullName.toLowerCase().includes(searchLower) ||
      (patient.roomNumber &&
        patient.roomNumber.toLowerCase().includes(searchLower))
    );
  });

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="content-wrapper">
      <div className="main-container">
        <div className="main-content">
          <div className="registrar-header">
            <h1 className="registrar-title">Кабинет врача</h1>
            <div className="registrar-welcome">
              <span>Здравствуйте! {currentUser?.fullName}</span>
              <div className="registrar-role-icon">
                <i className="fas fa-user-md"></i>
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
                        onClick={() => setSelectedShift(shift)}
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
                {selectedPatient && (
                  <button
                    className="edit-user-btn"
                    onClick={() => setIsProcedureFormOpen(!isProcedureFormOpen)}
                  >
                    <i className="fas fa-plus"></i>
                    Добавить процедуру
                  </button>
                )}
              </div>

              {selectedPatient ? (
                <>
                  {isProcedureFormOpen && (
                    <div
                      className="user-form active"
                      style={{ marginBottom: "20px" }}
                    >
                      <form onSubmit={handleAddProcedure}>
                        <div className="form-row">
                          <div className="form-group">
                            <div className="searchable-select">
                              <div className="search-input-container">
                                <input
                                  type="text"
                                  placeholder="Поиск процедуры..."
                                  value={procedureSearchTerm}
                                  onChange={(e) =>
                                    setProcedureSearchTerm(e.target.value)
                                  }
                                  className="search-input"
                                />
                              </div>
                              <div className="options-container">
                                {filteredProcedures.length > 0 ? (
                                  filteredProcedures.map((procedure) => (
                                    <div
                                      key={procedure.id}
                                      className={`option-item ${procedureFormData.procedureId === procedure.id ? "selected" : ""}`}
                                      onClick={() =>
                                        setProcedureFormData({
                                          ...procedureFormData,
                                          procedureId: procedure.id,
                                        })
                                      }
                                    >
                                      <div className="option-name">
                                        {procedure.name}
                                      </div>
                                      <div className="option-details">
                                        {procedure.cabinetName} (каб.{" "}
                                        {procedure.cabinetNumber}) -{" "}
                                        {procedure.defaultDuration} мин.
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="no-options">
                                    Процедуры не найдены
                                  </div>
                                )}
                              </div>
                              {procedureFormData.procedureId && (
                                <div className="selected-procedure">
                                  Выбрано:{" "}
                                  {
                                    allProcedures.find(
                                      (p) =>
                                        p.id === procedureFormData.procedureId,
                                    )?.name
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <input
                              type="text"
                              id="note"
                              placeholder="Введите примечание (необязательно)"
                              value={procedureFormData.note}
                              onChange={(e) =>
                                setProcedureFormData({
                                  ...procedureFormData,
                                  note: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="form-actions">
                          <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => setIsProcedureFormOpen(false)}
                          >
                            Отмена
                          </button>
                          <button
                            type="submit"
                            className="save-btn"
                            disabled={!procedureFormData.procedureId}
                          >
                            Добавить
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {Object.keys(groupedProcedures).length > 0 ? (
                    <div className="shift-registration-section">
                      {Object.values(groupedProcedures).map((group) => (
                        <div
                          key={group.cabinetNumber}
                          className="procedure-group"
                        >
                          <h4>
                            Кабинет {group.cabinetNumber}: {group.cabinetName}
                          </h4>
                          <ul className="procedures-list">
                            {group.procedures.map((procedure) => (
                              <li key={procedure.id} className="procedure-item">
                                <div className="procedure-info">
                                  <span className="procedure-name">
                                    {procedure.name}
                                    <span className="procedure-duration">
                                      ({procedure.duration} мин.)
                                    </span>
                                  </span>
                                  {editingNote.id === procedure.id ? (
                                    <div className="note-edit-container">
                                      <input
                                        type="text"
                                        value={editingNote.note}
                                        onChange={(e) =>
                                          setEditingNote({
                                            ...editingNote,
                                            note: e.target.value,
                                          })
                                        }
                                        className="note-edit-input"
                                        placeholder="Введите примечание"
                                      />
                                      <button
                                        className="action-btn save-btn"
                                        onClick={() =>
                                          handleSaveNote(procedure.id)
                                        }
                                        disabled={!editingNote.note.trim()}
                                      >
                                        <i className="fas fa-check"></i>
                                      </button>
                                      <button
                                        className="action-btn cancel-btn"
                                        onClick={handleCancelEdit}
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="procedure-note">
                                      {procedure.note || (
                                        <span className="no-note">
                                          (нет примечания)
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>
                                <div className="procedure-actions">
                                  {editingNote.id !== procedure.id && (
                                    <>
                                      <button
                                        className="action-btn edit-btn"
                                        onClick={() =>
                                          handleEditNote(procedure)
                                        }
                                        title="Редактировать примечание"
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      <button
                                        className="action-btn delete-btn"
                                        onClick={() =>
                                          handleDeleteProcedure(procedure.id)
                                        }
                                        title="Удалить процедуру"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-user-selected">
                      <p>Нет назначенных процедур для выбранной смены</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-user-selected">
                  <p>Выберите пациента из списка для просмотра процедур</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
