import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../../../context/AuthContext";
import AdminDashboardService from "../../../../services/AdminDashboard.service";
import "../../../../styles/Dashboard.css";

const UsersModule = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    login: "",
    password: "",
    confirmPassword: "",
    roles: ["ROLE_USER"],
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });
  const [allRoles, setAllRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const formRef = useRef(null);

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
      setTimeout(
        () => setNotification({ message: "", type: "", visible: false }),
        300,
      );
    }, 5000);
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [rolesData, usersData] = await Promise.all([
          AdminDashboardService.getAllRoles(token),
          AdminDashboardService.getAllUsers(token),
        ]);
        setAllRoles(rolesData);
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        showNotification("Ошибка загрузки данных", "error");
        console.error("Ошибка загрузки:", error);
      }
    };

    if (token) {
      loadInitialData();
    }
  }, [token, showNotification]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredUsers(filtered);
      setCurrentPage(1);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginateUsers = (pageNumber) => setCurrentPage(pageNumber);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "fullName":
        if (!value) error = "Обязательное поле";
        else if (!/^[\p{L} \-']+$/u.test(value))
          error = "Можно только буквы, пробелы, дефисы и апострофы";
        break;
      case "email":
        if (!value) error = "Обязательное поле";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Некорректный email";
        break;
      case "phone":
        if (value && !/^\+?[0-9\s-]+$/.test(value))
          error = "Некорректный формат телефона";
        break;
      case "birthDate":
        if (value && new Date(value) > new Date())
          error = "Дата не может быть в будущем";
        break;
      case "login":
        if (!value) error = "Обязательное поле";
        else if (value.length < 3 || value.length > 20)
          error = "Должно быть от 3 до 20 символов";
        break;
      case "password":
        if (!isEditing && (!value || value.length < 6 || value.length > 120)) {
          error = "Должно быть от 6 до 120 символов";
        } else if (
          isEditing &&
          value &&
          (value.length < 6 || value.length > 120)
        ) {
          error = "Должно быть от 6 до 120 символов";
        }
        break;
      case "confirmPassword":
        if (!isEditing && value !== formData.password) {
          error = "Пароли не совпадают";
        } else if (
          isEditing &&
          formData.password &&
          value !== formData.password
        ) {
          error = "Пароли не совпадают";
        }
        break;
      case "roles":
        if (!isEditing && (!value || value.length === 0))
          error = "Выберите хотя бы одну роль";
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

  const handleRoleChange = (role) => {
    setFormData((prev) => {
      const newRoles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      validateField("roles", newRoles);
      return { ...prev, roles: newRoles };
    });
  };

  const validateForm = () => {
    let isValid = true;
    const fieldsToValidate = isEditing
      ? ["fullName", "phone", "birthDate", "roles"]
      : ["fullName", "email", "login", "password", "confirmPassword", "roles"];
    fieldsToValidate.forEach((field) => {
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
        const updateData = {
          fullName: formData.fullName,
          phone: formData.phone,
          birthDate: formData.birthDate,
          roles: formData.roles,
        };
        if (formData.password) updateData.password = formData.password;
        await AdminDashboardService.updateUser(
          selectedUser.id,
          updateData,
          token,
        );
        showNotification("Пользователь успешно обновлен", "success");
      } else {
        await AdminDashboardService.createUser(
          {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            birthDate: formData.birthDate,
            login: formData.login,
            password: formData.password,
            roles: formData.roles,
          },
          token,
        );
        showNotification("Пользователь успешно создан", "success");
      }
      const updatedUsers = await AdminDashboardService.getAllUsers(token);
      setUsers(updatedUsers);
      resetForm();
    } catch (error) {
      const message =
        error.response?.data?.message || "Ошибка сохранения пользователя";
      showNotification(message, "error");
      console.error("Ошибка при сохранении пользователя:", error);
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setIsEditing(false);
    setSelectedUser(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      birthDate: "",
      login: "",
      password: "",
      confirmPassword: "",
      roles: ["ROLE_USER"],
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({
      ...prev,
      password: password,
      confirmPassword: password,
    }));
    setErrors((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
    }));
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
    setIsFormOpen(true);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      birthDate: user.birthDate || "",
      login: user.login,
      password: "",
      confirmPassword: "",
      roles: user.roles.map((role) => role.name),
    });
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      try {
        await AdminDashboardService.deleteUser(userId, token);
        showNotification("Пользователь успешно удален", "success");
        const updatedUsers = await AdminDashboardService.getAllUsers(token);
        setUsers(updatedUsers);
      } catch (error) {
        showNotification("Ошибка при удалении пользователя", "error");
        console.error("Ошибка при удалении пользователя:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "не указана";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  const getRolesString = (roles) => {
    if (!roles || roles.length === 0) return "Пользователь";
    return roles
      .map((role) => {
        if (typeof role === "object" && role.name) {
          switch (role.name) {
            case "ROLE_ADMIN":
              return "Админ";
            case "ROLE_DOCTOR":
              return "Доктор";
            case "ROLE_REGISTRAR":
              return "Регистратор";
            case "ROLE_NURSE":
              return "Медработник";
            case "ROLE_USER":
              return "Пользователь";
            default:
              return role.name;
          }
        } else if (typeof role === "string") {
          switch (role) {
            case "ROLE_ADMIN":
              return "Админ";
            case "ROLE_DOCTOR":
              return "Доктор";
            case "ROLE_REGISTRAR":
              return "Регистратор";
            case "ROLE_NURSE":
              return "Медработник";
            case "ROLE_USER":
              return "Пользователь";
            default:
              return role;
          }
        }
        return "Неизвестная роль";
      })
      .join(", ");
  };

  return (
    <>
      <div className="users-management-header">
        <div className="users-header-left">
          <h2>Управление пользователями</h2>
          <div className="admin-search-user">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Поиск пользователей..."
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
            setSelectedUser(null);
            if (!isFormOpen) {
              setFormData({
                fullName: "",
                email: "",
                phone: "",
                birthDate: "",
                login: "",
                password: "",
                confirmPassword: "",
                roles: ["ROLE_USER"],
              });
            }
            if (isFormOpen) {
              setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }
          }}
        >
          <i className="fas fa-plus"></i>
          {isFormOpen ? "Скрыть форму" : "Добавить пользователя"}
        </button>
      </div>

      {isFormOpen && (
        <div className="user-form active" ref={formRef}>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">ФИО</label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Введите полное имя"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  className={errors.fullName ? "error" : ""}
                  required
                />
                {errors.fullName && (
                  <div className="error-message">{errors.fullName}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Введите email"
                  value={formData.email}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  className={errors.email ? "error" : ""}
                  required
                  disabled={isEditing}
                />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Телефон</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="Введите телефон"
                  value={formData.phone}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  className={errors.phone ? "error" : ""}
                />
                {errors.phone && (
                  <div className="error-message">{errors.phone}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="birthDate">Дата рождения</label>
                <input
                  type="date"
                  id="birthDate"
                  value={formData.birthDate}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  className={errors.birthDate ? "error" : ""}
                />
                {errors.birthDate && (
                  <div className="error-message">{errors.birthDate}</div>
                )}
              </div>
            </div>
            {!isEditing && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="login">Логин</label>
                  <input
                    type="text"
                    id="login"
                    placeholder="Введите логин"
                    value={formData.login}
                    onChange={handleFormChange}
                    onBlur={handleBlur}
                    className={errors.login ? "error" : ""}
                    required
                  />
                  {errors.login && (
                    <div className="error-message">{errors.login}</div>
                  )}
                </div>
              </div>
            )}
            <div className="form-row">
              <div className="form-group password-field">
                <label htmlFor="password">
                  {isEditing ? "Новый пароль" : "Пароль"}
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder={
                    isEditing
                      ? "Оставьте пустым, чтобы не изменять"
                      : "Введите пароль"
                  }
                  value={formData.password}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  className={errors.password ? "error" : ""}
                  required={!isEditing}
                />
                <i
                  className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} password-toggle`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
                <button
                  type="button"
                  className="password-generate-btn"
                  onClick={generatePassword}
                >
                  <i className="fas fa-key"></i> Сгенерировать пароль
                </button>
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group password-field">
                <label htmlFor="confirmPassword">
                  {isEditing
                    ? "Подтвердите новый пароль"
                    : "Подтвердите пароль"}
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder={
                    isEditing
                      ? "Подтвердите новый пароль"
                      : "Подтвердите пароль"
                  }
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  onBlur={handleBlur}
                  className={errors.confirmPassword ? "error" : ""}
                  required={!isEditing}
                />
                <i
                  className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} password-toggle`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                ></i>
                {errors.confirmPassword && (
                  <div className="error-message">{errors.confirmPassword}</div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Роли</label>
                <div className="roles-checkboxes">
                  {allRoles.map((role) => (
                    <div key={role.name} className="role-checkbox">
                      <input
                        type="checkbox"
                        id={`role-${role.name}`}
                        checked={formData.roles.includes(role.name)}
                        onChange={() => handleRoleChange(role.name)}
                      />
                      <label htmlFor={`role-${role.name}`}>
                        {role.name === "ROLE_ADMIN" && "Администратор"}
                        {role.name === "ROLE_REGISTRAR" && "Регистратор"}
                        {role.name === "ROLE_USER" && "Пользователь"}
                        {role.name === "ROLE_DOCTOR" && "Доктор"}
                        {role.name === "ROLE_NURSE" && "Медработник"}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.roles && (
                  <div className="error-message">{errors.roles}</div>
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
              <th>ФИО</th>
              <th>Логин</th>
              <th>Email</th>
              <th>Дата рождения</th>
              <th>Роли</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.login}</td>
                  <td>{user.email}</td>
                  <td>{formatDate(user.birthDate)}</td>
                  <td>{getRolesString(user.roles)}</td>
                  <td className="actions-cell">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(user)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-users">
                  Пользователи не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredUsers.length > usersPerPage && (
          <div className="pagination">
            <button
              onClick={() => paginateUsers(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            {Array.from({ length: totalUserPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginateUsers(number)}
                  className={currentPage === number ? "active" : ""}
                >
                  {number}
                </button>
              ),
            )}

            <button
              onClick={() => paginateUsers(currentPage + 1)}
              disabled={currentPage === totalUserPages}
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

export default UsersModule;
