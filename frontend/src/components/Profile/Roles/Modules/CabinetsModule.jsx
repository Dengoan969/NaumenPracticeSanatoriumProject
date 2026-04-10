import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import AdminDashboardService from '../../../../services/AdminDashboard.service';
import '../../../../styles/Dashboard.css';

const CabinetsModule = () => {
    const { token } = useAuth();
    const [cabinets, setCabinets] = useState([]);
    const [filteredCabinets, setFilteredCabinets] = useState([]);
    const [selectedCabinet, setSelectedCabinet] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        number: '',
        name: '',
        assignedUsers: []
    });
    const [errors, setErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [notification, setNotification] = useState({
        message: '',
        type: '',
        visible: false
    });
    const [users, setUsers] = useState([]);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [currentAssignments, setCurrentAssignments] = useState({});
    const itemsPerPage = 10;

    const formRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [cabinetsData, usersData] = await Promise.all([
                    AdminDashboardService.getAllCabinets(token),
                    AdminDashboardService.getAllUsers(token)
                ]);

                // Фильтруем только врачей и медсестер
                const medicalStaff = usersData.filter(user => {
                    if (!Array.isArray(user.roles)) return false;
                    return user.roles.some(role =>
                        role === 'ROLE_DOCTOR' ||
                        role === 'ROLE_NURSE'
                    );
                });

                setUsers(medicalStaff);
                setCabinets(cabinetsData);
                setFilteredCabinets(cabinetsData);

                // Загрузка назначений
                const assignmentsResponse = await AdminDashboardService.getAllAssignments(token);
                const assignmentsMap = {};
                assignmentsResponse.forEach(assignment => {
                    if (!assignmentsMap[assignment.cabinetId]) {
                        assignmentsMap[assignment.cabinetId] = [];
                    }
                    assignmentsMap[assignment.cabinetId].push({
                        id: assignment.userId,
                        fullName: assignment.userFullName,
                        login: assignment.userLogin
                    });
                });
                setCurrentAssignments(assignmentsMap);

            } catch (error) {
                console.error('Ошибка загрузки:', error);
                showNotification('Ошибка загрузки данных', 'error');
            }
        };

        if (token) {
            loadInitialData();
        }
    }, [token]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = cabinets.filter(cabinet =>
                cabinet.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cabinet.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCabinets(filtered);
            setCurrentPage(1);
        } else {
            setFilteredCabinets(cabinets);
        }
    }, [searchTerm, cabinets]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCabinets.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCabinets.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const showNotification = (message, type) => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
            setTimeout(() => setNotification({ message: '', type: '', visible: false }), 300);
        }, 5000);
    };

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'number':
                if (!value) error = 'Обязательное поле';
                else if (value.length > 10) error = 'Максимум 10 символов';
                break;
            case 'name':
                if (!value) error = 'Обязательное поле';
                else if (value.length > 50) error = 'Максимум 50 символов';
                break;
            default:
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const handleFormChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        validateField(id, value);
    };

    const handleBlur = (e) => {
        const { id, value } = e.target;
        validateField(id, value);
    };

    const validateForm = () => {
        let isValid = true;
        ['number', 'name'].forEach(field => {
            isValid = validateField(field, formData[field]) && isValid;
        });
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }
        try {
            let cabinetId;
            if (isEditing) {
                const updatedCabinet = await AdminDashboardService.updateCabinet(selectedCabinet.id, formData, token);
                cabinetId = updatedCabinet.id;
                showNotification('Кабинет успешно обновлен', 'success');
            } else {
                const newCabinet = await AdminDashboardService.createCabinet(formData, token);
                cabinetId = newCabinet.id;
                showNotification('Кабинет успешно создан', 'success');
            }

            // Назначение пользователей
            if (formData.assignedUsers.length > 0) {
                try {
                    await Promise.all(formData.assignedUsers.map(user =>
                        AdminDashboardService.assignCabinetToStaff(user.id, cabinetId, token)
                    ));
                    showNotification('Пользователи успешно назначены', 'success');
                } catch (error) {
                    console.error('Ошибка назначения пользователей:', error);
                }
            }

            // Обновляем список кабинетов
            const updatedCabinets = await AdminDashboardService.getAllCabinets(token);
            setCabinets(updatedCabinets);

            // Обновляем список назначений
            const assignmentsData = await AdminDashboardService.getAllAssignments(token);
            const newAssignments = {};
            assignmentsData.forEach(assignment => {
                if (!newAssignments[assignment.cabinetId]) {
                    newAssignments[assignment.cabinetId] = [];
                }
                newAssignments[assignment.cabinetId].push({
                    id: assignment.userId,
                    fullName: assignment.userFullName,
                    login: assignment.userLogin
                });
            });
            setCurrentAssignments(newAssignments);

            resetForm();
        } catch (error) {
            const message = error.response?.data?.message || 'Ошибка сохранения кабинета';
            showNotification(message, 'error');
            console.error('Ошибка при сохранении кабинета:', error);
        }
    };

    const resetForm = () => {
        setIsFormOpen(false);
        setIsEditing(false);
        setSelectedCabinet(null);
        setFormData({
            number: '',
            name: '',
            assignedUsers: []
        });
        setErrors({});
        setShowUserDropdown(false);
        setUserSearchTerm('');
    };

    const handleEdit = (cabinet) => {
        setSelectedCabinet(cabinet);
        setIsEditing(true);
        setIsFormOpen(true);
        setFormData({
            number: cabinet.number,
            name: cabinet.name,
            assignedUsers: currentAssignments[cabinet.id] || []
        });
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDelete = async (cabinetId) => {
        if (window.confirm('Вы уверены, что хотите удалить этот кабинет?')) {
            try {
                await AdminDashboardService.deleteCabinet(cabinetId, token);
                showNotification('Кабинет успешно удален', 'success');
                const updatedCabinets = await AdminDashboardService.getAllCabinets(token);
                setCabinets(updatedCabinets);
            } catch (error) {
                showNotification('Ошибка при удалении кабинета', 'error');
                console.error('Ошибка при удалении кабинета:', error);
            }
        }
    };

    const handleAssignUser = async (cabinetId, userId) => {
        try {
            await AdminDashboardService.assignCabinetToStaff(userId, cabinetId, token);
            showNotification('Пользователь успешно назначен', 'success');

            // Обновляем список назначений
            const assignmentsData = await AdminDashboardService.getAllAssignments(token);
            const newAssignments = {};
            assignmentsData.forEach(assignment => {
                if (!newAssignments[assignment.cabinetId]) {
                    newAssignments[assignment.cabinetId] = [];
                }
                newAssignments[assignment.cabinetId].push({
                    id: assignment.userId,
                    fullName: assignment.userFullName,
                    login: assignment.userLogin
                });
            });
            setCurrentAssignments(newAssignments);
        } catch (error) {
            showNotification('Ошибка назначения пользователя', 'error');
            console.error('Ошибка назначения пользователя:', error);
        }
    };

    const handleRemoveAssignment = async (cabinetId, userId) => {
        try {
            await AdminDashboardService.removeCabinetFromStaff(userId, cabinetId, token);
            showNotification('Назначение успешно удалено', 'success');

            // Обновляем список назначений
            const updatedAssignments = { ...currentAssignments };
            if (updatedAssignments[cabinetId]) {
                updatedAssignments[cabinetId] = updatedAssignments[cabinetId].filter(u => u.id !== userId);
                if (updatedAssignments[cabinetId].length === 0) {
                    delete updatedAssignments[cabinetId];
                }
            }
            setCurrentAssignments(updatedAssignments);
        } catch (error) {
            showNotification('Ошибка удаления назначения', 'error');
            console.error('Ошибка удаления назначения:', error);
        }
    };

    const handleUserSelect = (user) => {
        if (!formData.assignedUsers.some(u => u.id === user.id)) {
            setFormData(prev => ({
                ...prev,
                assignedUsers: [...prev.assignedUsers, user]
            }));
        }
        setUserSearchTerm('');
    };

    const handleRemoveUser = (userId) => {
        setFormData(prev => ({
            ...prev,
            assignedUsers: prev.assignedUsers.filter(u => u.id !== userId)
        }));
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.login.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    return (
        <>
            <div className="users-management-header">
                <div className="users-header-left">
                    <h2>Управление кабинетами</h2>
                    <div className="admin-search-user">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Поиск кабинетов..."
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
                        setSelectedCabinet(null);
                        if (!isFormOpen) {
                            setFormData({
                                number: '',
                                name: '',
                                assignedUsers: []
                            });
                        }
                        if (isFormOpen) {
                            setTimeout(() => {
                                formRef.current?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                        }
                    }}
                >
                    <i className="fas fa-plus"></i>
                    {isFormOpen ? 'Скрыть форму' : 'Добавить кабинет'}
                </button>
            </div>

            {isFormOpen && (
                <div className="user-form active" ref={formRef}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="number">Номер кабинета</label>
                                <input
                                    type="text"
                                    id="number"
                                    placeholder="Введите номер кабинета"
                                    value={formData.number}
                                    onChange={handleFormChange}
                                    onBlur={handleBlur}
                                    className={errors.number ? 'error' : ''}
                                    maxLength="10"
                                    required
                                />
                                {errors.number && <div className="error-message">{errors.number}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="name">Название</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Введите название кабинета"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    onBlur={handleBlur}
                                    className={errors.name ? 'error' : ''}
                                    maxLength="50"
                                    required
                                />
                                {errors.name && <div className="error-message">{errors.name}</div>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Назначить медработников</label>
                                <div className="user-assignment-container" ref={dropdownRef}>
                                    <div
                                        className="user-assignment-input"
                                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    >
                                        {formData.assignedUsers.length > 0 ? (
                                            <div className="selected-users-tags">
                                                {formData.assignedUsers.map(user => (
                                                    <span key={user.id} className="user-tag">
                                                        {user.fullName} ({user.login})
                                                        <button
                                                            type="button"
                                                            className="remove-tag-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveUser(user.id);
                                                            }}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : 'Выберите медработников'}
                                        <i className={`fas fa-chevron-${showUserDropdown ? 'up' : 'down'}`}></i>
                                    </div>
                                    {showUserDropdown && (
                                        <div className="user-dropdown">
                                            <div className="user-search-container">
                                                <i className="fas fa-search"></i>
                                                <input
                                                    type="text"
                                                    placeholder="Поиск медработников..."
                                                    value={userSearchTerm}
                                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <div className="user-dropdown-list">
                                                {filteredUsers.length > 0 ? (
                                                    filteredUsers.map(user => (
                                                        <div
                                                            key={user.id}
                                                            className={`user-dropdown-item ${formData.assignedUsers.some(u => u.id === user.id) ? 'selected' : ''}`}
                                                            onClick={() => handleUserSelect(user)}
                                                        >
                                                            {user.fullName} ({user.login})
                                                            {formData.assignedUsers.some(u => u.id === user.id) && (
                                                                <i className="fas fa-check"></i>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="no-users-found">Медработники не найдены</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
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
                                {isEditing ? 'Обновить' : 'Сохранить'}
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
                        <th>Название</th>
                        <th>Назначенные сотрудники</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map(cabinet => (
                            <tr key={cabinet.id}>
                                <td>{cabinet.number}</td>
                                <td>{cabinet.name}</td>
                                <td>
                                    <div className="assignment-cell">
                                        {currentAssignments[cabinet.id] ? (
                                            <div className="assigned-users-list">
                                                {currentAssignments[cabinet.id].map(user => (
                                                    <div key={user.id} className="assigned-user-item">
                                                        <span>{user.fullName}</span>
                                                        <button
                                                            className="remove-assignment-btn"
                                                            onClick={() => handleRemoveAssignment(cabinet.id, user.id)}
                                                        >
                                                            <i className="fas fa-user-minus"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="user-assignment-dropdown">
                                                <select
                                                    value=""
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            handleAssignUser(cabinet.id, e.target.value);
                                                        }
                                                    }}
                                                >
                                                    <option value="">Назначить...</option>
                                                    {users.map(user => (
                                                        <option key={user.id} value={user.id}>
                                                            {user.fullName} ({user.login})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="actions-cell">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEdit(cabinet)}
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(cabinet.id)}
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="no-users">Кабинеты не найдены</td>
                        </tr>
                    )}
                    </tbody>
                </table>

                {filteredCabinets.length > itemsPerPage && (
                    <div className="pagination">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={currentPage === number ? 'active' : ''}
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                )}
            </div>

            <div className={`notification-container ${notification.visible ? 'visible' : ''}`}>
                {notification.message && (
                    <div className={`notification ${notification.type}`}>
                        <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                        {notification.message}
                    </div>
                )}
            </div>
        </>
    );
};

export default CabinetsModule;
