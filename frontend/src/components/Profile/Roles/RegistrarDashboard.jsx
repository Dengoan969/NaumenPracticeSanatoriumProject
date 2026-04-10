import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import userService from '../../../services/RegistrarDashboard.service';
import shiftService from '../../../services/ShiftService';
import '../../../styles/Dashboard.css';

const RegistrarDashboard = () => {
    const { user: currentUser, token } = useAuth();

    // Состояния для работы с пользователями
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        birthDate: '',
        login: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        phone: '',
        birthDate: '',
        login: '',
        password: '',
        confirmPassword: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [notification, setNotification] = useState({
        message: '',
        type: '',
        visible: false
    });

    // Состояния для работы со сменами
    const [activeShifts, setActiveShifts] = useState([]);
    const [selectedShift, setSelectedShift] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [userRegistrations, setUserRegistrations] = useState([]);

    // Получаем текущую регистрацию на выбранную смену
    const currentRegistration = selectedShift
        ? userRegistrations.find(r => r.shiftId === selectedShift.id)
        : null;

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [usersData, shiftsData] = await Promise.all([
                    userService.getRegularUsers(token),
                    shiftService.getActiveShifts(token)
                ]);
                setUsers(usersData);
                setActiveShifts(shiftsData);
            } catch (error) {
                showNotification('Ошибка загрузки данных', 'error');
                console.error('Ошибка загрузки:', error);
            }
        };

        if (token) {
            loadInitialData();
        }
    }, [token]);

    // Загрузка регистраций пользователя при изменении выбранного пользователя
    useEffect(() => {
        const loadUserRegistrations = async () => {
            if (selectedUser && token) {
                try {
                    const registrations = await shiftService.getUserRegistrations(selectedUser.id, token);
                    setUserRegistrations(registrations);
                } catch (error) {
                    console.error('Ошибка загрузки регистраций:', error);
                }
            }
        };

        loadUserRegistrations();
    }, [selectedUser, token]);

    // Показать уведомление
    const showNotification = (message, type) => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
            setTimeout(() => setNotification({ message: '', type: '', visible: false }), 300);
        }, 5000);
    };

    // Валидация поля формы
    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'fullName':
                if (!value) error = 'Обязательное поле';
                else if (!/^[\p{L} \-']+$/u.test(value))
                    error = 'Можно только буквы, пробелы, дефисы и апострофы';
                break;
            case 'email':
                if (!value) error = 'Обязательное поле';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                    error = 'Некорректный email';
                break;
            case 'phone':
                if (value && !/^\+?[0-9\s-]+$/.test(value))
                    error = 'Некорректный формат телефона';
                break;
            case 'birthDate':
                if (value && new Date(value) > new Date())
                    error = 'Дата не может быть в будущем';
                break;
            case 'login':
                if (!value) error = 'Обязательное поле';
                else if (value.length < 3 || value.length > 20)
                    error = 'Должно быть от 3 до 20 символов';
                break;
            case 'password':
                if (!isEditing && (!value || value.length < 6 || value.length > 120))
                    error = 'Должно быть от 6 до 120 символов';
                break;
            case 'confirmPassword':
                if (!isEditing && value !== formData.password)
                    error = 'Пароли не совпадают';
                break;
            default:
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    // Выбор пользователя
    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setIsEditing(false);
        setSelectedShift(null);
        setAvailableRooms([]);
        setIsFormOpen(false);
    };

    // Выбор смены
    const handleShiftSelect = async (shift) => {
        setAvailableRooms([]);
        setSelectedShift(shift);
    };

    // Регистрация пользователя на смену (с комнатой или без)
    const handleRegisterUser = async (roomId) => {
        if (!selectedUser || !selectedShift) return;

        try {
            await shiftService.registerUserForShift(
                selectedUser.id,
                selectedShift.id,
                roomId,
                token
            );

            let notificationMessage = '';
            if (currentRegistration) {
                notificationMessage = roomId
                    ? 'Комната успешно изменена'
                    : 'Пользователь удален из комнаты';
            } else {
                notificationMessage = roomId
                    ? 'Пользователь успешно зарегистрирован на смену с комнатой'
                    : 'Пользователь успешно зарегистрирован на смену без комнаты';
            }

            showNotification(notificationMessage, 'success');

            const updatedRegistrations = await shiftService.getUserRegistrations(selectedUser.id, token);
            setUserRegistrations(updatedRegistrations);
            setAvailableRooms([]);
        } catch (error) {
            showNotification(
                error.response?.data?.message || 'Ошибка при регистрации на смену',
                'error'
            );
            console.error('Ошибка при регистрации:', error);
        }
    };

    // Снятие пользователя со смены
    const handleUnregisterFromShift = async () => {
        if (!selectedUser || !selectedShift) return;

        try {
            await shiftService.unregisterUserFromShift(
                selectedUser.id,
                selectedShift.id,
                token
            );

            showNotification('Пользователь успешно снят со смены', 'success');

            const updatedRegistrations = await shiftService.getUserRegistrations(selectedUser.id, token);
            setUserRegistrations(updatedRegistrations);
            setAvailableRooms([]);
        } catch (error) {
            showNotification('Ошибка при снятии со смены', 'error');
            console.error('Ошибка при снятии со смены:', error);
        }
    };

    // Показать доступные комнаты
    const handleShowAvailableRooms = async () => {
        try {
            const rooms = await shiftService.getAvailableRooms(selectedShift.id, token);
            setAvailableRooms(rooms);
        } catch (error) {
            showNotification('Ошибка загрузки комнат', 'error');
            console.error('Ошибка при загрузке комнат:', error);
        }
    };

    // Обработчик изменения полей формы
    const handleFormChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        validateField(id, value);
    };

    // Обработчик потери фокуса полем формы
    const handleBlur = (e) => {
        const { id, value } = e.target;
        validateField(id, value);
    };

    // Валидация всей формы
    const validateForm = () => {
        let isValid = true;
        const fieldsToValidate = isEditing
            ? ['fullName', 'phone', 'birthDate']
            : ['fullName', 'email', 'login', 'password', 'confirmPassword'];

        fieldsToValidate.forEach(field => {
            isValid = validateField(field, formData[field]) && isValid;
        });

        return isValid;
    };

    // Отправка формы
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }

        try {
            if (isEditing) {
                // Обновляем данные выбранного пользователя
                setSelectedUser({
                    ...selectedUser,
                    fullName: formData.fullName,
                    phone: formData.phone,
                    birthDate: formData.birthDate
                });

                // Обновляем список пользователей
                const updatedUsers = users.map(user =>
                    user.id === selectedUser.id ? {
                        ...user,
                        fullName: formData.fullName,
                        phone: formData.phone,
                        birthDate: formData.birthDate
                    } : user
                );

                setUsers(updatedUsers);
                showNotification('Пользователь успешно обновлен', 'success');
            } else {
                await userService.createUser({
                    ...formData,
                    roles: ['ROLE_USER']
                }, token);
                showNotification('Пользователь успешно создан', 'success');

                const updatedUsers = await userService.getRegularUsers(token);
                setUsers(updatedUsers);
            }

            resetForm();
        } catch (error) {
            const message = error.response?.data?.message || 'Ошибка сохранения пользователя';
            showNotification(message, 'error');
            console.error('Ошибка при сохранении пользователя:', error);
        }
    };

    // Сброс формы
    const resetForm = () => {
        setIsFormOpen(false);
        setIsEditing(false);
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            birthDate: '',
            login: '',
            password: '',
            confirmPassword: ''
        });
        setErrors({
            fullName: '',
            email: '',
            phone: '',
            birthDate: '',
            login: '',
            password: '',
            confirmPassword: ''
        });
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    // Генерация пароля
    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        setFormData(prev => ({
            ...prev,
            password: password,
            confirmPassword: password
        }));

        setErrors(prev => ({
            ...prev,
            password: '',
            confirmPassword: ''
        }));
    };

    // Редактирование пользователя
    const handleEdit = () => {
        if (!selectedUser) return;

        setIsEditing(true);
        setIsFormOpen(false);
        setFormData({
            fullName: selectedUser.fullName,
            email: selectedUser.email,
            phone: selectedUser.phone || '',
            birthDate: selectedUser.birthDate || '',
            login: selectedUser.login,
            password: '',
            confirmPassword: ''
        });
    };

    // Сортируем пользователей по алфавиту
    const sortedUsers = [...users].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, 'ru', { sensitivity: 'base' })
    );

    // Фильтрация пользователей по поисковому запросу
    const filteredUsers = sortedUsers.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.fullName.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            (user.phone && user.phone.toLowerCase().includes(searchLower))
        );
    });

    // Получение инициалов для аватара
    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    // Проверка, зарегистрирован ли пользователь на выбранную смену
    const isRegisteredForSelectedShift = selectedShift &&
        userRegistrations.some(r => r.shiftId === selectedShift.id);

    return (
        <div className="content-wrapper">
            <div className="main-container">
                <div className="main-content">
                    <div className="registrar-header">
                        <h1 className="registrar-title">Кабинет регистратора</h1>
                        <div className="registrar-welcome">
                            <span>Здравствуйте! {currentUser?.login}</span>
                            <div className="registrar-role-icon">
                                <i className="fas fa-clipboard-check"></i>
                            </div>
                        </div>
                    </div>

                    {/* Уведомления */}
                    <div className={`notification-container ${notification.visible ? 'visible' : ''}`}>
                        {notification.message && (
                            <div className={`notification ${notification.type}`}>
                                <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                                {notification.message}
                            </div>
                        )}
                    </div>

                    <div className="registrar-content">
                        {/* Левая панель - список пользователей */}
                        <div className="users-section">
                            <div className="users-controls">
                                <div className="users-list-header">
                                    <h2 className="users-list-title">Пользователи</h2>
                                    <div className="search-user">
                                        <i className="fas fa-search"></i>
                                        <input
                                            type="text"
                                            placeholder="Поиск пользователя"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                className="add-user-btn"
                                onClick={() => {
                                    setIsFormOpen(!isFormOpen);
                                    setIsEditing(false);
                                    setSelectedUser(null);
                                    if (isFormOpen) {
                                        resetForm();
                                    } else {
                                        setFormData({
                                            fullName: '',
                                            email: '',
                                            phone: '',
                                            birthDate: '',
                                            login: '',
                                            password: '',
                                            confirmPassword: ''
                                        });
                                        setErrors({
                                            fullName: '',
                                            email: '',
                                            phone: '',
                                            birthDate: '',
                                            login: '',
                                            password: '',
                                            confirmPassword: ''
                                        });
                                    }
                                }}
                            >
                                <i className="fas fa-plus"></i>
                                {isFormOpen ? 'Скрыть форму' : 'Добавить пользователя'}
                            </button>

                            {/* Форма добавления пользователя */}
                            {isFormOpen && !isEditing && (
                                <div className="user-form active">
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
                                                    className={errors.fullName ? 'error' : ''}
                                                    required
                                                />
                                                {errors.fullName && <div className="error-message">{errors.fullName}</div>}
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
                                                    className={errors.email ? 'error' : ''}
                                                    required
                                                />
                                                {errors.email && <div className="error-message">{errors.email}</div>}
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
                                                    className={errors.phone ? 'error' : ''}
                                                />
                                                {errors.phone && <div className="error-message">{errors.phone}</div>}
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="birthDate">Дата рождения</label>
                                                <input
                                                    type="date"
                                                    id="birthDate"
                                                    value={formData.birthDate}
                                                    onChange={handleFormChange}
                                                    onBlur={handleBlur}
                                                    className={errors.birthDate ? 'error' : ''}
                                                />
                                                {errors.birthDate && <div className="error-message">{errors.birthDate}</div>}
                                            </div>
                                        </div>
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
                                                    className={errors.login ? 'error' : ''}
                                                    required
                                                />
                                                {errors.login && <div className="error-message">{errors.login}</div>}
                                            </div>
                                            <div className="form-group password-field">
                                                <label htmlFor="password">Пароль</label>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    id="password"
                                                    placeholder="Введите пароль"
                                                    value={formData.password}
                                                    onChange={handleFormChange}
                                                    onBlur={handleBlur}
                                                    className={errors.password ? 'error' : ''}
                                                    required
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
                                                {errors.password && <div className="error-message">{errors.password}</div>}
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group password-field">
                                                <label htmlFor="confirmPassword">Подтвердите пароль</label>
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    id="confirmPassword"
                                                    placeholder="Подтвердите пароль"
                                                    value={formData.confirmPassword}
                                                    onChange={handleFormChange}
                                                    onBlur={handleBlur}
                                                    className={errors.confirmPassword ? 'error' : ''}
                                                    required
                                                />
                                                <i
                                                    className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} password-toggle`}
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                ></i>
                                                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                                            </div>
                                        </div>
                                        <div className="form-actions">
                                            <button
                                                type="button"
                                                className="cancel-btn"
                                                onClick={resetForm}
                                            >
                                                Отмена
                                            </button>
                                            <button type="submit" className="save-btn">
                                                Сохранить
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Список пользователей */}
                            <div className="users-list-container">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className={`user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                                            onClick={() => handleUserSelect(user)}
                                        >
                                            <div className="user-avatar">
                                                {getInitials(user.fullName)}
                                            </div>
                                            <div className="user-info">
                                                <h3 className="user-name">{user.fullName}</h3>
                                                <p className="user-details">
                                                    Тел.: {user.phone || 'не указан'} | Email: {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>Пользователи не найдены</p>
                                )}
                            </div>
                        </div>

                        {/* Правая панель - детали пользователя и оформление на смену */}
                        <div className="user-details-section">
                            <div className="user-details-header">
                                <h2 className={`user-details-title ${isEditing ? 'editing' : ''}`}>
                                    {isEditing ? 'Редактирование пользователя' : selectedUser ? 'Информация о пользователе' : 'Выберите пользователя'}
                                </h2>
                                {selectedUser && !isEditing && (
                                    <button className="edit-user-btn" onClick={handleEdit}>
                                        <i className="fas fa-edit"></i>
                                        Редактировать
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="user-form active">
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
                                                    className={errors.fullName ? 'error' : ''}
                                                    required
                                                />
                                                {errors.fullName && <div className="error-message">{errors.fullName}</div>}
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
                                                    className={errors.email ? 'error' : ''}
                                                    required
                                                    disabled
                                                />
                                                {errors.email && <div className="error-message">{errors.email}</div>}
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
                                                    className={errors.phone ? 'error' : ''}
                                                />
                                                {errors.phone && <div className="error-message">{errors.phone}</div>}
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="birthDate">Дата рождения</label>
                                                <input
                                                    type="date"
                                                    id="birthDate"
                                                    value={formData.birthDate}
                                                    onChange={handleFormChange}
                                                    onBlur={handleBlur}
                                                    className={errors.birthDate ? 'error' : ''}
                                                />
                                                {errors.birthDate && <div className="error-message">{errors.birthDate}</div>}
                                            </div>
                                        </div>
                                        <div className="form-actions">
                                            <button
                                                type="button"
                                                className="cancel-btn"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setSelectedUser(users.find(u => u.id === selectedUser.id));
                                                }}
                                            >
                                                Отмена
                                            </button>
                                            <button type="submit" className="save-btn">
                                                Обновить
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : selectedUser ? (
                                <>
                                    <div className="user-info-grid">
                                        <div className="info-item">
                                            <div className="info-label">Полное имя</div>
                                            <div className="info-value">{selectedUser.fullName}</div>
                                        </div>
                                        <div className="info-item">
                                            <div className="info-label">Email</div>
                                            <div className="info-value">{selectedUser.email}</div>
                                        </div>
                                        <div className="info-item">
                                            <div className="info-label">Телефон</div>
                                            <div className="info-value">{selectedUser.phone || 'не указан'}</div>
                                        </div>
                                        <div className="info-item">
                                            <div className="info-label">Дата рождения</div>
                                            <div className="info-value">
                                                {selectedUser.birthDate || 'не указана'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Секция оформления на смену */}
                                    <div className="shift-registration-section">
                                        <h3>Оформление на смену</h3>

                                        {/* Список активных смен */}
                                        <div className="shifts-list">
                                            <h4>Активные смены:</h4>
                                            {activeShifts.length > 0 ? (
                                                <div className="shifts-container">
                                                    {activeShifts.map(shift => (
                                                        <div
                                                            key={shift.id}
                                                            className={`shift-item ${selectedShift?.id === shift.id ? 'selected' : ''}`}
                                                            onClick={() => handleShiftSelect(shift)}
                                                        >
                                                            <div className="shift-name">{shift.name}</div>
                                                            <div className="shift-dates">
                                                                {new Date(shift.startDate).toLocaleDateString()} - {new Date(shift.endDate).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p>Нет активных смен</p>
                                            )}
                                        </div>

                                        {/* Информация о выбранной смене */}
                                        {selectedShift && (
                                            <div className="shift-details">
                                                <h4>Информация по смене: {selectedShift.name}</h4>

                                                {isRegisteredForSelectedShift ? (
                                                    <div className="registration-info">
                                                        <p>Статус: <strong>Зарегистрирован</strong></p>
                                                        {currentRegistration?.roomNumber ? (
                                                            <>
                                                                <p>Комната: {currentRegistration.roomNumber}</p>
                                                                <div className="registration-actions">
                                                                    <button
                                                                        className="action-btn remove-room"
                                                                        onClick={() => handleRegisterUser(null)}
                                                                    >
                                                                        Убрать из комнаты
                                                                    </button>
                                                                    <button
                                                                        className="action-btn change-room"
                                                                        onClick={handleShowAvailableRooms}
                                                                    >
                                                                        Изменить комнату
                                                                    </button>
                                                                    <button
                                                                        className="action-btn unregister"
                                                                        onClick={handleUnregisterFromShift}
                                                                    >
                                                                        Снять со смены
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p>Комната: не назначена</p>
                                                                <div className="registration-actions">
                                                                    <button
                                                                        className="action-btn add-room"
                                                                        onClick={handleShowAvailableRooms}
                                                                    >
                                                                        Назначить комнату
                                                                    </button>
                                                                    <button
                                                                        className="action-btn unregister"
                                                                        onClick={handleUnregisterFromShift}
                                                                    >
                                                                        Снять со смены
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="registration-info">
                                                        <p>Статус: <strong>Не зарегистрирован</strong></p>
                                                        <div className="registration-actions">
                                                            <button
                                                                className="action-btn register-without-room"
                                                                onClick={() => handleRegisterUser(null)}
                                                            >
                                                                Оформить без комнаты
                                                            </button>
                                                            <button
                                                                className="action-btn show-rooms"
                                                                onClick={handleShowAvailableRooms}
                                                            >
                                                                Выбрать комнату
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Список доступных комнат */}
                                                {availableRooms.length > 0 && (
                                                    <div className="available-rooms">
                                                        <h5>Доступные комнаты:</h5>
                                                        <div className="rooms-list">
                                                            {availableRooms.map(room => (
                                                                <div key={room.id} className="room-item">
                                                                    <div className="room-info-column">
                                                                        <div className="room-number">Комната {room.number}</div>
                                                                        <div className="room-capacity">
                                                                            Занято: {room.currentOccupancy}/{room.capacity}
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        className="register-btn"
                                                                        onClick={() => handleRegisterUser(room.id)}
                                                                    >
                                                                        {isRegisteredForSelectedShift ? 'Выбрать' : 'Оформить'}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="no-user-selected">
                                    <p>Выберите пользователя из списка для просмотра деталей</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrarDashboard;
