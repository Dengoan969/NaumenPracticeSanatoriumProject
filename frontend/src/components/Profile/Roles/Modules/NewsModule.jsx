import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../../context/AuthContext";
import AdminDashboardService from "../../../../services/AdminDashboard.service";
import "../../../../styles/Dashboard.css";

const NewsModule = () => {
  const { token } = useAuth();
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isNewsFormOpen, setIsNewsFormOpen] = useState(false);
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [newsFormData, setNewsFormData] = useState({
    title: "",
    content: "",
    imageFile: null,
    previewImage: null,
  });
  const [newsErrors, setNewsErrors] = useState({});
  const [newsSearchTerm, setNewsSearchTerm] = useState("");
  const [currentNewsPage, setCurrentNewsPage] = useState(1);
  const newsPerPage = 10;
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });

  const newsFormRef = useRef(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await AdminDashboardService.getAllNews(token);
        setNews(newsData);
        setFilteredNews(newsData);
      } catch (error) {
        showNotification("Ошибка загрузки новостей", "error");
        console.error("Ошибка загрузки новостей:", error);
      }
    };

    if (token) {
      loadNews();
    }
  }, [token]);

  useEffect(() => {
    if (newsSearchTerm) {
      const filtered = news.filter(
        (item) =>
          item.title.toLowerCase().includes(newsSearchTerm.toLowerCase()) ||
          item.content.toLowerCase().includes(newsSearchTerm.toLowerCase()),
      );
      setFilteredNews(filtered);
      setCurrentNewsPage(1);
    } else {
      setFilteredNews(news);
    }
  }, [newsSearchTerm, news]);

  const indexOfLastNews = currentNewsPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNewsItems = filteredNews.slice(
    indexOfFirstNews,
    indexOfLastNews,
  );
  const totalNewsPages = Math.ceil(filteredNews.length / newsPerPage);

  const paginateNews = (pageNumber) => setCurrentNewsPage(pageNumber);

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

  const validateNewsField = (name, value) => {
    let error = "";
    switch (name) {
      case "title":
        if (!value) error = "Обязательное поле";
        else if (value.length > 100) error = "Максимум 100 символов";
        break;
      case "content":
        if (!value) error = "Обязательное поле";
        else if (value.length > 2000) error = "Максимум 2000 символов";
        break;
      case "imageFile":
        if (!isEditingNews && !value) {
          error = "Изображение обязательно";
        } else if (value) {
          const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
          if (!allowedTypes.includes(value.type)) {
            error = "Только JPG, PNG или GIF";
          } else if (value.size > 5 * 1024 * 1024) {
            error = "Максимальный размер 5MB";
          }
        }
        break;
      default:
        break;
    }
    setNewsErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleNewsFormChange = (e) => {
    const { id, value, files } = e.target;

    if (id === "imageFile" && files && files[0]) {
      const file = files[0];
      setNewsFormData((prev) => ({
        ...prev,
        imageFile: file,
        previewImage: URL.createObjectURL(file),
      }));
      validateNewsField(id, file);
    } else {
      setNewsFormData((prev) => ({ ...prev, [id]: value }));
      validateNewsField(id, value);
    }
  };

  const handleNewsBlur = (e) => {
    const { id, value } = e.target;
    validateNewsField(id, value);
  };

  const validateNewsForm = () => {
    let isValid = true;
    ["title", "content"].forEach((field) => {
      isValid = validateNewsField(field, newsFormData[field]) && isValid;
    });

    if (!isEditingNews) {
      isValid =
        validateNewsField("imageFile", newsFormData.imageFile) && isValid;
    }

    return isValid;
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    if (!validateNewsForm()) {
      showNotification("Пожалуйста, исправьте ошибки в форме", "error");
      return;
    }
    try {
      if (isEditingNews) {
        await AdminDashboardService.updateNews(
          selectedNews.id,
          newsFormData.title,
          newsFormData.content,
          newsFormData.imageFile,
          token,
        );
        showNotification("Новость успешно обновлена", "success");
      } else {
        await AdminDashboardService.createNews(
          newsFormData.title,
          newsFormData.content,
          newsFormData.imageFile,
          token,
        );
        showNotification("Новость успешно создана", "success");
      }
      const updatedNews = await AdminDashboardService.getAllNews(token);
      setNews(updatedNews);
      resetNewsForm();
    } catch (error) {
      const message =
        error.response?.data?.message || "Ошибка сохранения новости";
      showNotification(message, "error");
      console.error("Ошибка при сохранении новости:", error);
    }
  };

  const resetNewsForm = () => {
    setIsNewsFormOpen(false);
    setIsEditingNews(false);
    setSelectedNews(null);
    setNewsFormData({
      title: "",
      content: "",
      imageFile: null,
      previewImage: null,
    });
    setNewsErrors({});
  };

  const handleEditNews = (newsItem) => {
    setSelectedNews(newsItem);
    setIsEditingNews(true);
    setIsNewsFormOpen(true);
    setNewsFormData({
      title: newsItem.title,
      content: newsItem.content,
      imageFile: null,
      previewImage: newsItem.imageUrl || null,
    });
    setTimeout(
      () => newsFormRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  const handleDeleteNews = async (newsId) => {
    if (window.confirm("Вы уверены, что хотите удалить эту новость?")) {
      try {
        await AdminDashboardService.deleteNews(newsId, token);
        showNotification("Новость успешно удалена", "success");
        const updatedNews = await AdminDashboardService.getAllNews(token);
        setNews(updatedNews);
      } catch (error) {
        showNotification("Ошибка при удалении новости", "error");
        console.error("Ошибка при удалении новости:", error);
      }
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "не указана";
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU");
  };

  return (
    <>
      <div className="users-management-header">
        <div className="users-header-left">
          <h2>Управление новостями</h2>
          <div className="admin-search-user">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Поиск новостей..."
              value={newsSearchTerm}
              onChange={(e) => setNewsSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button
          className="add-user-btn"
          onClick={() => {
            setIsNewsFormOpen(!isNewsFormOpen);
            setIsEditingNews(false);
            setSelectedNews(null);
            if (!isNewsFormOpen) {
              setNewsFormData({
                title: "",
                content: "",
                imageFile: null,
                previewImage: null,
              });
            }
            if (isNewsFormOpen) {
              setTimeout(() => {
                newsFormRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }
          }}
        >
          <i className="fas fa-plus"></i>
          {isNewsFormOpen ? "Скрыть форму" : "Добавить новость"}
        </button>
      </div>

      {isNewsFormOpen && (
        <div className="user-form active admin-news-form" ref={newsFormRef}>
          <form onSubmit={handleNewsSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Заголовок</label>
                <input
                  type="text"
                  id="title"
                  placeholder="Введите заголовок новости"
                  value={newsFormData.title}
                  onChange={handleNewsFormChange}
                  onBlur={handleNewsBlur}
                  className={newsErrors.title ? "error" : ""}
                  maxLength="100"
                  required
                />
                {newsErrors.title && (
                  <div className="error-message">{newsErrors.title}</div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="content">Содержание</label>
                <textarea
                  id="content"
                  placeholder="Введите содержание новости"
                  value={newsFormData.content}
                  onChange={handleNewsFormChange}
                  onBlur={handleNewsBlur}
                  className={newsErrors.content ? "error" : ""}
                  rows="6"
                  maxLength="2000"
                  required
                />
                {newsErrors.content && (
                  <div className="error-message">{newsErrors.content}</div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="imageFile">
                  Изображение{" "}
                  {isEditingNews ? "(оставьте пустым, чтобы не изменять)" : ""}
                </label>
                <input
                  type="file"
                  id="imageFile"
                  accept="image/jpeg, image/png, image/gif"
                  onChange={handleNewsFormChange}
                  className={newsErrors.imageFile ? "error" : ""}
                  required={!isEditingNews}
                />
                {newsErrors.imageFile && (
                  <div className="error-message">{newsErrors.imageFile}</div>
                )}
                {newsFormData.previewImage && (
                  <div className="image-preview">
                    <img src={newsFormData.previewImage} alt="Предпросмотр" />
                  </div>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={resetNewsForm}
              >
                Отмена
              </button>
              <button type="submit" className="save-btn">
                {isEditingNews ? "Обновить" : "Сохранить"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Заголовок</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {currentNewsItems.length > 0 ? (
              currentNewsItems.map((newsItem) => (
                <tr key={newsItem.id}>
                  <td>
                    <div className="admin-news-title">{newsItem.title}</div>
                    <div className="admin-news-preview">
                      {newsItem.content.length > 100
                        ? `${newsItem.content.substring(0, 100)}...`
                        : newsItem.content}
                    </div>
                  </td>
                  <td>{formatDateTime(newsItem.createdAt)}</td>
                  <td className="actions-cell">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditNews(newsItem)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteNews(newsItem.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-users">
                  Новости не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredNews.length > newsPerPage && (
          <div className="pagination">
            <button
              onClick={() => paginateNews(currentNewsPage - 1)}
              disabled={currentNewsPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            {Array.from({ length: totalNewsPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginateNews(number)}
                  className={currentNewsPage === number ? "active" : ""}
                >
                  {number}
                </button>
              ),
            )}

            <button
              onClick={() => paginateNews(currentNewsPage + 1)}
              disabled={currentNewsPage === totalNewsPages}
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

export default NewsModule;
