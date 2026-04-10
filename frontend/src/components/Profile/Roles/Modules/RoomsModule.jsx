import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../../context/AuthContext";
import AdminDashboardService from "../../../../services/AdminDashboard.service";
import "../../../../styles/Dashboard.css";

const RoomsModule = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [roomFormData, setRoomFormData] = useState({
    number: "",
    capacity: "",
    description: "",
  });
  const [roomErrors, setRoomErrors] = useState({});
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [currentRoomsPage, setCurrentRoomsPage] = useState(1);
  const roomsPerPage = 10;
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });

  const roomFormRef = useRef(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await AdminDashboardService.getAllRooms(token);
        const sortedRooms = sortRooms(roomsData);
        setRooms(sortedRooms);
        setFilteredRooms(sortedRooms);
      } catch (error) {
        showNotification("Ошибка загрузки комнат", "error");
        console.error("Ошибка загрузки комнат:", error);
      }
    };

    if (token) {
      loadRooms();
    }
  }, [token]);

  useEffect(() => {
    if (roomSearchTerm) {
      const filtered = rooms.filter(
        (room) =>
          room.number.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
          (room.description &&
            room.description
              .toLowerCase()
              .includes(roomSearchTerm.toLowerCase())),
      );
      setFilteredRooms(filtered);
      setCurrentRoomsPage(1);
    } else {
      setFilteredRooms(rooms);
    }
  }, [roomSearchTerm, rooms]);

  const sortRooms = (rooms) => {
    return [...rooms].sort((a, b) => {
      const numA = parseInt(a.number.match(/\d+/)?.[0] || 0);
      const numB = parseInt(b.number.match(/\d+/)?.[0] || 0);
      if (numA !== numB) return numA - numB;
      return a.number.localeCompare(b.number);
    });
  };

  const indexOfLastRoom = currentRoomsPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalRoomPages = Math.ceil(filteredRooms.length / roomsPerPage);

  const paginateRooms = (pageNumber) => setCurrentRoomsPage(pageNumber);

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

  const validateRoomField = (name, value) => {
    let error = "";
    switch (name) {
      case "number":
        if (!value) error = "Обязательное поле";
        else if (value.length > 10) error = "Максимум 10 символов";
        break;
      case "capacity":
        if (!value) error = "Обязательное поле";
        else if (isNaN(value) || value < 1)
          error = "Должно быть положительным числом";
        break;
      case "description":
        if (value && value.length > 50) error = "Максимум 50 символов";
        break;
      default:
        break;
    }
    setRoomErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleRoomFormChange = (e) => {
    const { id, value } = e.target;
    setRoomFormData((prev) => ({ ...prev, [id]: value }));
    validateRoomField(id, value);
  };

  const handleRoomBlur = (e) => {
    const { id, value } = e.target;
    validateRoomField(id, value);
  };

  const validateRoomForm = () => {
    let isValid = true;
    ["number", "capacity"].forEach((field) => {
      isValid = validateRoomField(field, roomFormData[field]) && isValid;
    });
    return isValid;
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    if (!validateRoomForm()) {
      showNotification("Пожалуйста, исправьте ошибки в форме", "error");
      return;
    }
    try {
      if (isEditingRoom) {
        await AdminDashboardService.updateRoom(
          selectedRoom.id,
          roomFormData,
          token,
        );
        showNotification("Комната успешно обновлена", "success");
      } else {
        await AdminDashboardService.createRoom(roomFormData, token);
        showNotification("Комната успешно создана", "success");
      }
      const updatedRooms = await AdminDashboardService.getAllRooms(token);
      setRooms(sortRooms(updatedRooms));
      resetRoomForm();
    } catch (error) {
      const message =
        error.response?.data?.message || "Ошибка сохранения комнаты";
      showNotification(message, "error");
      console.error("Ошибка при сохранении комнаты:", error);
    }
  };

  const resetRoomForm = () => {
    setIsRoomFormOpen(false);
    setIsEditingRoom(false);
    setSelectedRoom(null);
    setRoomFormData({
      number: "",
      capacity: "",
      description: "",
    });
    setRoomErrors({});
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setIsEditingRoom(true);
    setIsRoomFormOpen(true);
    setRoomFormData({
      number: room.number,
      capacity: room.capacity,
      description: room.description || "",
    });
    setTimeout(
      () => roomFormRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Вы уверены, что хотите удалить эту комнату?")) {
      try {
        await AdminDashboardService.deleteRoom(roomId, token);
        showNotification("Комната успешно удалена", "success");
        const updatedRooms = await AdminDashboardService.getAllRooms(token);
        setRooms(sortRooms(updatedRooms));
      } catch (error) {
        showNotification("Ошибка при удалении комнаты", "error");
        console.error("Ошибка при удалении комнаты:", error);
      }
    }
  };

  return (
    <>
      <div className="users-management-header">
        <div className="users-header-left">
          <h2>Управление комнатами</h2>
          <div className="admin-search-user">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Поиск комнат..."
              value={roomSearchTerm}
              onChange={(e) => setRoomSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button
          className="add-user-btn"
          onClick={() => {
            setIsRoomFormOpen(!isRoomFormOpen);
            setIsEditingRoom(false);
            setSelectedRoom(null);
            if (!isRoomFormOpen) {
              setRoomFormData({
                number: "",
                capacity: "",
                description: "",
              });
            }
            if (isRoomFormOpen) {
              setTimeout(() => {
                roomFormRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }
          }}
        >
          <i className="fas fa-plus"></i>
          {isRoomFormOpen ? "Скрыть форму" : "Добавить комнату"}
        </button>
      </div>

      {isRoomFormOpen && (
        <div className="user-form active" ref={roomFormRef}>
          <form onSubmit={handleRoomSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="number">Номер комнаты</label>
                <input
                  type="text"
                  id="number"
                  placeholder="Введите номер комнаты"
                  value={roomFormData.number}
                  onChange={handleRoomFormChange}
                  onBlur={handleRoomBlur}
                  className={roomErrors.number ? "error" : ""}
                  maxLength="10"
                  required
                />
                {roomErrors.number && (
                  <div className="error-message">{roomErrors.number}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="capacity">Вместимость</label>
                <input
                  type="number"
                  id="capacity"
                  placeholder="Введите вместимость"
                  value={roomFormData.capacity}
                  onChange={handleRoomFormChange}
                  onBlur={handleRoomBlur}
                  className={roomErrors.capacity ? "error" : ""}
                  min="1"
                  required
                />
                {roomErrors.capacity && (
                  <div className="error-message">{roomErrors.capacity}</div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description">Описание</label>
                <input
                  type="text"
                  id="description"
                  placeholder="Введите описание (необязательно)"
                  value={roomFormData.description}
                  onChange={handleRoomFormChange}
                  onBlur={handleRoomBlur}
                  className={roomErrors.description ? "error" : ""}
                  maxLength="50"
                />
                {roomErrors.description && (
                  <div className="error-message">{roomErrors.description}</div>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={resetRoomForm}
              >
                Отмена
              </button>
              <button type="submit" className="save-btn">
                {isEditingRoom ? "Обновить" : "Сохранить"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Номер</th>
              <th>Вместимость</th>
              <th>Описание</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {currentRooms.length > 0 ? (
              currentRooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.number}</td>
                  <td>{room.capacity}</td>
                  <td>{room.description || "-"}</td>
                  <td className="actions-cell">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditRoom(room)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteRoom(room.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-users">
                  Комнаты не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredRooms.length > roomsPerPage && (
          <div className="pagination">
            <button
              onClick={() => paginateRooms(currentRoomsPage - 1)}
              disabled={currentRoomsPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            {Array.from({ length: totalRoomPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginateRooms(number)}
                  className={currentRoomsPage === number ? "active" : ""}
                >
                  {number}
                </button>
              ),
            )}

            <button
              onClick={() => paginateRooms(currentRoomsPage + 1)}
              disabled={currentRoomsPage === totalRoomPages}
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

export default RoomsModule;
