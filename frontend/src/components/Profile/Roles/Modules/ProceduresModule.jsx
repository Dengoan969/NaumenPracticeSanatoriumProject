import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../../context/AuthContext";
import AdminDashboardService from "../../../../services/AdminDashboard.service";
import "../../../../styles/Dashboard.css";

const ProceduresModule = () => {
  const { token } = useAuth();
  const [procedures, setProcedures] = useState([]);
  const [filteredProcedures, setFilteredProcedures] = useState([]);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cabinetId: "",
    defaultDuration: 30,
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });
  const [cabinets, setCabinets] = useState([]);
  const [showCabinetDropdown, setShowCabinetDropdown] = useState(false);
  const [cabinetSearchTerm, setCabinetSearchTerm] = useState("");
  const itemsPerPage = 10;

  const cabinetDropdownRef = useRef(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [proceduresData, cabinetsData] = await Promise.all([
          AdminDashboardService.getAllProcedures(token),
          AdminDashboardService.getAllCabinets(token),
        ]);
        setProcedures(proceduresData);
        setFilteredProcedures(proceduresData);
        setCabinets(cabinetsData);
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        showNotification("Ошибка загрузки данных", "error");
      }
    };

    if (token) {
      loadInitialData();
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cabinetDropdownRef.current &&
        !cabinetDropdownRef.current.contains(event.target)
      ) {
        setShowCabinetDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = procedures.filter(
        (procedure) =>
          procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (procedure.cabinetNumber &&
            procedure.cabinetNumber
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (procedure.cabinetName &&
            procedure.cabinetName
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
      setFilteredProcedures(filtered);
      setCurrentPage(1);
    } else {
      setFilteredProcedures(procedures);
    }
  }, [searchTerm, procedures]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProcedures.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProcedures.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value) error = "Обязательное поле";
        else if (value.length > 100) error = "Максимум 100 символов";
        break;
      case "cabinetId":
        if (!value) error = "Выберите кабинет";
        break;
      case "defaultDuration":
        if (!value || value <= 0)
          error = "Длительность должна быть положительной";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    validateField(id, value);
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    validateField(id, value);
  };

  const validateForm = () => {
    let isValid = true;
    ["name", "cabinetId", "defaultDuration"].forEach((field) => {
      isValid = validateField(field, formData[field]) && isValid;
    });
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showNotification("Пожалуйста, исправьте ошибки в форме", "error");
      return;
    }

    try {
      if (isEditing) {
        await AdminDashboardService.updateProcedure(
          selectedProcedure.id,
          formData,
          token,
        );
        showNotification("Процедура успешно обновлена", "success");
      } else {
        await AdminDashboardService.createProcedure(formData, token);
        showNotification("Процедура успешно создана", "success");
      }

      // Обновляем список процедур
      const updatedProcedures =
        await AdminDashboardService.getAllProcedures(token);
      setProcedures(updatedProcedures);
      resetForm();
    } catch (error) {
      const message =
        error.response?.data?.message || "Ошибка сохранения процедуры";
      showNotification(message, "error");
      console.error("Ошибка при сохранении процедуры:", error);
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setIsEditing(false);
    setSelectedProcedure(null);
    setFormData({
      name: "",
      cabinetId: "",
      defaultDuration: 30,
    });
    setErrors({});
    setShowCabinetDropdown(false);
    setCabinetSearchTerm("");
  };

  const handleEdit = (procedure) => {
    setSelectedProcedure(procedure);
    setIsEditing(true);
    setIsFormOpen(true);
    setFormData({
      name: procedure.name,
      cabinetId: procedure.cabinetId,
      defaultDuration: procedure.defaultDuration,
    });
  };

  const handleDelete = async (procedureId) => {
    if (window.confirm("Вы уверены, что хотите удалить эту процедуру?")) {
      try {
        await AdminDashboardService.deleteProcedure(procedureId, token);
        showNotification("Процедура успешно удалена", "success");
        const updatedProcedures =
          await AdminDashboardService.getAllProcedures(token);
        setProcedures(updatedProcedures);
      } catch (error) {
        showNotification("Ошибка при удалении процедуры", "error");
        console.error("Ошибка при удалении процедуры:", error);
      }
    }
  };

  const handleCabinetSelect = (cabinet) => {
    setFormData((prev) => ({
      ...prev,
      cabinetId: cabinet.id,
    }));
    setShowCabinetDropdown(false);
    setCabinetSearchTerm("");
  };

  const filteredCabinets = cabinets.filter(
    (cabinet) =>
      cabinet.number.toLowerCase().includes(cabinetSearchTerm.toLowerCase()) ||
      cabinet.name.toLowerCase().includes(cabinetSearchTerm.toLowerCase()),
  );

  return (
    <>
      <div className="users-management-header">
        <div className="users-header-left">
          <h2>Управление процедурами</h2>
          <div className="admin-search-user">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Поиск процедур, кабинетов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button
          className="add-user-btn"
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            setIsEditing(false);
            setSelectedProcedure(null);
            if (!isFormOpen) {
              setFormData({
                name: "",
                cabinetId: "",
                defaultDuration: 30,
              });
            }
          }}
        >
          <i className="fas fa-plus"></i>
          {isFormOpen ? "Скрыть форму" : "Добавить процедуру"}
        </button>
      </div>

      {isFormOpen && (
        <div className="user-form active">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Название процедуры</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Введите название процедуры"
                  value={formData.name}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  className={errors.name ? "error" : ""}
                  maxLength="100"
                  required
                />
                {errors.name && (
                  <div className="error-message">{errors.name}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="cabinetId">Кабинет</label>
                <div
                  className="user-assignment-container"
                  ref={cabinetDropdownRef}
                >
                  <div
                    className="user-assignment-input"
                    onClick={() => setShowCabinetDropdown(!showCabinetDropdown)}
                  >
                    {formData.cabinetId
                      ? cabinets.find((c) => c.id === formData.cabinetId)
                          ?.number +
                        " - " +
                        cabinets.find((c) => c.id === formData.cabinetId)?.name
                      : "Выберите кабинет"}
                    <i
                      className={`fas fa-chevron-${showCabinetDropdown ? "up" : "down"}`}
                    ></i>
                  </div>
                  {showCabinetDropdown && (
                    <div className="user-dropdown">
                      <div className="user-search-container">
                        <i className="fas fa-search"></i>
                        <input
                          type="text"
                          placeholder="Поиск кабинетов..."
                          value={cabinetSearchTerm}
                          onChange={(e) => setCabinetSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="user-dropdown-list">
                        {filteredCabinets.length > 0 ? (
                          filteredCabinets.map((cabinet) => (
                            <div
                              key={cabinet.id}
                              className={`user-dropdown-item ${formData.cabinetId === cabinet.id ? "selected" : ""}`}
                              onClick={() => handleCabinetSelect(cabinet)}
                            >
                              {cabinet.number} - {cabinet.name}
                              {formData.cabinetId === cabinet.id && (
                                <i className="fas fa-check"></i>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="no-users-found">
                            Кабинеты не найдены
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {errors.cabinetId && (
                  <div className="error-message">{errors.cabinetId}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="defaultDuration">Длительность (минуты)</label>
                <input
                  type="number"
                  id="defaultDuration"
                  min="1"
                  value={formData.defaultDuration}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  className={errors.defaultDuration ? "error" : ""}
                  required
                />
                {errors.defaultDuration && (
                  <div className="error-message">{errors.defaultDuration}</div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Отмена
              </button>
              <button type="submit" className="save-btn">
                {isEditing ? "Обновить" : "Сохранить"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Кабинет</th>
              <th>Длительность (мин)</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((procedure) => (
                <tr key={procedure.id}>
                  <td>{procedure.name}</td>
                  <td>
                    {procedure.cabinetNumber} - {procedure.cabinetName}
                  </td>
                  <td>{procedure.defaultDuration}</td>
                  <td className="actions-cell">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(procedure)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(procedure.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-users">
                  Процедуры не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredProcedures.length > itemsPerPage && (
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={currentPage === number ? "active" : ""}
                >
                  {number}
                </button>
              ),
            )}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
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
    </>
  );
};

export default ProceduresModule;
