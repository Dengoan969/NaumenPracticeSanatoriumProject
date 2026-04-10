import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import AdminDashboardService from "../../../../services/AdminDashboard.service";
import "../../../../styles/Dashboard.css";

const FeedbackModule = () => {
  const { token } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackPerPage] = useState(10);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        let feedbackData;
        if (showUnreadOnly) {
          feedbackData = await AdminDashboardService.getUnreadFeedback(token);
        } else {
          feedbackData = await AdminDashboardService.getAllFeedback(token);
        }
        setFeedbackList(feedbackData);
        setFilteredFeedback(feedbackData);
      } catch (error) {
        showNotification("Ошибка загрузки обратной связи", "error");
        console.error("Ошибка загрузки обратной связи:", error);
      }
    };

    if (token) {
      loadFeedback();
    }
  }, [token, showUnreadOnly]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = feedbackList.filter(
        (feedback) =>
          feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feedback.userFullName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
      setFilteredFeedback(filtered);
      setCurrentPage(1);
    } else {
      setFilteredFeedback(feedbackList);
    }
  }, [searchTerm, feedbackList]);

  const indexOfLastFeedback = currentPage * feedbackPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - feedbackPerPage;
  const currentFeedback = filteredFeedback.slice(
    indexOfFirstFeedback,
    indexOfLastFeedback,
  );
  const totalPages = Math.ceil(filteredFeedback.length / feedbackPerPage);

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

  const handleMarkAsRead = async (id) => {
    try {
      await AdminDashboardService.markFeedbackAsRead(id, token);
      showNotification("Сообщение помечено как прочитанное", "success");

      const updatedFeedback = feedbackList.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      );

      setFeedbackList(updatedFeedback);
      setFilteredFeedback(updatedFeedback);
    } catch (error) {
      showNotification("Ошибка при обновлении статуса сообщения", "error");
      console.error("Ошибка при обновлении статуса сообщения:", error);
    }
  };

  const handleDeleteFeedback = async (feedback) => {
    const confirmMessage = `Вы действительно хотите удалить сообщение от ${feedback.userFullName || "анонимного пользователя"}?`;

    if (window.confirm(confirmMessage)) {
      try {
        await AdminDashboardService.deleteFeedback(feedback.id, token);
        showNotification("Сообщение успешно удалено", "success");

        const updatedFeedback = feedbackList.filter(
          (item) => item.id !== feedback.id,
        );
        setFeedbackList(updatedFeedback);
        setFilteredFeedback(updatedFeedback);
      } catch (error) {
        showNotification("Ошибка при удалении сообщения", "error");
        console.error("Ошибка при удалении сообщения:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU");
  };

  return (
    <>
      <div className="users-management-header">
        <div className="users-header-left">
          <h2>Обратная связь от пользователей</h2>
          <div className="admin-search-user">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Поиск по сообщениям или авторам..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="feedback-filter-controls">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={() => setShowUnreadOnly(!showUnreadOnly)}
            />
            Показать только непрочитанные
          </label>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Автор</th>
              <th>Сообщение</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {currentFeedback.length > 0 ? (
              currentFeedback.map((feedback) => (
                <tr
                  key={feedback.id}
                  className={!feedback.read ? "unread-feedback" : ""}
                >
                  <td>{formatDate(feedback.createdAt)}</td>
                  <td>{feedback.userFullName || "Аноним"}</td>
                  <td className="feedback-message-cell">
                    <div className="feedback-message-content">
                      {feedback.message}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${feedback.read ? "read" : "unread"}`}
                    >
                      {feedback.read ? "Прочитано" : "Новое"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="feedback-actions">
                      {!feedback.read && (
                        <button
                          className="action-btn mark-read-btn"
                          onClick={() => handleMarkAsRead(feedback.id)}
                          title="Пометить как прочитанное"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      )}
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteFeedback(feedback)}
                        title="Удалить сообщение"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-users">
                  {showUnreadOnly
                    ? "Нет непрочитанных сообщений"
                    : "Сообщения не найдены"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredFeedback.length > feedbackPerPage && (
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

export default FeedbackModule;
