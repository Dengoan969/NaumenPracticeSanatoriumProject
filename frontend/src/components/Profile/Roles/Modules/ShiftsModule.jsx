import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import AdminDashboardService from '../../../../services/AdminDashboard.service';
import '../../../../styles/Dashboard.css';

const ShiftsModule = () => {
    const { token } = useAuth();
    const [shifts, setShifts] = useState([]);
    const [filteredShifts, setFilteredShifts] = useState([]);
    const [selectedShift, setSelectedShift] = useState(null);
    const [isShiftFormOpen, setIsShiftFormOpen] = useState(false);
    const [isEditingShift, setIsEditingShift] = useState(false);
    const [shiftFormData, setShiftFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        isActive: false,
        description: ''
    });
    const [shiftErrors, setShiftErrors] = useState({});
    const [shiftSearchTerm, setShiftSearchTerm] = useState('');
    const [currentShiftsPage, setCurrentShiftsPage] = useState(1);
    const shiftsPerPage = 10;
    const [notification, setNotification] = useState({
        message: '',
        type: '',
        visible: false
    });

    const shiftFormRef = useRef(null);

    useEffect(() => {
        const loadShifts = async () => {
            try {
                const shiftsData = await AdminDashboardService.getAllShifts(token);
                setShifts(shiftsData);
                setFilteredShifts(shiftsData);
            } catch (error) {
                showNotification('Ошибка загрузки смен', 'error');
                console.error('Ошибка загрузки смен:', error);
            }
        };

        if (token) {
            loadShifts();
        }
    }, [token]);

    useEffect(() => {
        if (shiftSearchTerm) {
            const filtered = shifts.filter(shift =>
                shift.name.toLowerCase().includes(shiftSearchTerm.toLowerCase()) ||
                (shift.description && shift.description.toLowerCase().includes(shiftSearchTerm.toLowerCase()))
            );
            setFilteredShifts(filtered);
            setCurrentShiftsPage(1);
        } else {
            setFilteredShifts(shifts);
        }
    }, [shiftSearchTerm, shifts]);

    const indexOfLastShift = currentShiftsPage * shiftsPerPage;
    const indexOfFirstShift = indexOfLastShift - shiftsPerPage;
    const currentShifts = filteredShifts.slice(indexOfFirstShift, indexOfLastShift);
    const totalShiftPages = Math.ceil(filteredShifts.length / shiftsPerPage);

    const paginateShifts = (pageNumber) => setCurrentShiftsPage(pageNumber);

    const showNotification = (message, type) => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
            setTimeout(() => setNotification({ message: '', type: '', visible: false }), 300);
        }, 5000);
    };

    const validateShiftField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!value) error = 'Обязательное поле';
                else if (value.length > 50) error = 'Максимум 50 символов';
                break;
            case 'startDate':
                if (!value) error = 'Обязательное поле';
                else if (new Date(value) < new Date()) error = 'Дата начала не может быть в прошлом';
                break;
            case 'endDate':
                if (!value) error = 'Обязательное поле';
                else if (new Date(value) <= new Date(shiftFormData.startDate)) {
                    error = 'Дата окончания должна быть позже даты начала';
                }
                break;
            case 'description':
                if (value && value.length > 200) error = 'Максимум 200 символов';
                break;
            default:
                break;
        }
        setShiftErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const handleShiftFormChange = (e) => {
        const { id, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setShiftFormData(prev => ({ ...prev, [id]: val }));
        validateShiftField(id, val);
    };

    const handleShiftBlur = (e) => {
        const { id, value } = e.target;
        validateShiftField(id, value);
    };

    const validateShiftForm = () => {
        let isValid = true;
        ['name', 'startDate', 'endDate'].forEach(field => {
            isValid = validateShiftField(field, shiftFormData[field]) && isValid;
        });
        return isValid;
    };

    const handleShiftSubmit = async (e) => {
        e.preventDefault();
        if (!validateShiftForm()) {
            showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }
        try {
            if (isEditingShift) {
                await AdminDashboardService.updateShift(selectedShift.id, shiftFormData, token);
                showNotification('Смена успешно обновлена', 'success');
            } else {
                await AdminDashboardService.createShift(shiftFormData, token);
                showNotification('Смена успешно создана', 'success');
            }
            const updatedShifts = await AdminDashboardService.getAllShifts(token);
            setShifts(updatedShifts);
            resetShiftForm();
        } catch (error) {
            const message = error.response?.data?.message || 'Ошибка сохранения смены';
            showNotification(message, 'error');
            console.error('Ошибка при сохранении смены:', error);
        }
    };

    const resetShiftForm = () => {
        setIsShiftFormOpen(false);
        setIsEditingShift(false);
        setSelectedShift(null);
        setShiftFormData({
            name: '',
            startDate: '',
            endDate: '',
            isActive: false,
            description: ''
        });
        setShiftErrors({});
    };

    const handleEditShift = (shift) => {
        setSelectedShift(shift);
        setIsEditingShift(true);
        setIsShiftFormOpen(true);
        setShiftFormData({
            name: shift.name,
            startDate: shift.startDate,
            endDate: shift.endDate,
            isActive: shift.isActive,
            description: shift.description || ''
        });
        setTimeout(() => shiftFormRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDeleteShift = async (shiftId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту смену?')) {
            try {
                await AdminDashboardService.deleteShift(shiftId, token);
                showNotification('Смена успешно удалена', 'success');
                const updatedShifts = await AdminDashboardService.getAllShifts(token);
                setShifts(updatedShifts);
            } catch (error) {
                showNotification('Ошибка при удалении смены', 'error');
                console.error('Ошибка при удалении смены:', error);
            }
        }
    };

    const handleToggleShiftStatus = async (shiftId, isActive) => {
        try {
            await AdminDashboardService.updateShiftStatus(shiftId, !isActive, token);
            showNotification(`Смена ${!isActive ? 'активирована' : 'деактивирована'}`, 'success');
            const updatedShifts = await AdminDashboardService.getAllShifts(token);
            setShifts(updatedShifts);
        } catch (error) {
            showNotification('Ошибка при изменении статуса смены', 'error');
            console.error('Ошибка при изменении статуса смены:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'не указана';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };

    return (
        <>
            <div className="users-management-header">
                <div className="users-header-left">
                    <h2>Управление сменами</h2>
                    <div className="admin-search-user">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Поиск смен..."
                            value={shiftSearchTerm}
                            onChange={(e) => setShiftSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    className="add-user-btn"
                    onClick={() => {
                        setIsShiftFormOpen(!isShiftFormOpen);
                        setIsEditingShift(false);
                        setSelectedShift(null);
                        if (!isShiftFormOpen) {
                            setShiftFormData({
                                name: '',
                                startDate: '',
                                endDate: '',
                                isActive: false,
                                description: ''
                            });
                        }
                        if (isShiftFormOpen) {
                            setTimeout(() => {
                                shiftFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                        }
                    }}
                >
                    <i className="fas fa-plus"></i>
                    {isShiftFormOpen ? 'Скрыть форму' : 'Добавить смену'}
                </button>
            </div>

            {isShiftFormOpen && (
                <div className="admin-shift-form active" ref={shiftFormRef}>
                    <form onSubmit={handleShiftSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Название смены</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Введите название смены"
                                    value={shiftFormData.name}
                                    onChange={handleShiftFormChange}
                                    onBlur={handleShiftBlur}
                                    className={shiftErrors.name ? 'error' : ''}
                                    maxLength="50"
                                    required
                                />
                                {shiftErrors.name && <div className="error-message">{shiftErrors.name}</div>}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="startDate">Дата начала</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={shiftFormData.startDate}
                                    onChange={handleShiftFormChange}
                                    onBlur={handleShiftBlur}
                                    className={shiftErrors.startDate ? 'error' : ''}
                                    required
                                />
                                {shiftErrors.startDate && <div className="error-message">{shiftErrors.startDate}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="endDate">Дата окончания</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    value={shiftFormData.endDate}
                                    onChange={handleShiftFormChange}
                                    onBlur={handleShiftBlur}
                                    className={shiftErrors.endDate ? 'error' : ''}
                                    required
                                />
                                {shiftErrors.endDate && <div className="error-message">{shiftErrors.endDate}</div>}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="description">Описание</label>
                                <textarea
                                    id="description"
                                    placeholder="Введите описание (необязательно)"
                                    value={shiftFormData.description}
                                    onChange={handleShiftFormChange}
                                    onBlur={handleShiftBlur}
                                    className={shiftErrors.description ? 'error' : ''}
                                    rows="3"
                                    maxLength="200"
                                />
                                {shiftErrors.description && <div className="error-message">{shiftErrors.description}</div>}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={shiftFormData.isActive}
                                    onChange={handleShiftFormChange}
                                />
                                <label htmlFor="isActive">Активная смена</label>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={resetShiftForm}
                            >
                                Отмена
                            </button>
                            <button type="submit" className="save-btn">
                                {isEditingShift ? 'Обновить' : 'Сохранить'}
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
                        <th>Дата начала</th>
                        <th>Дата окончания</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentShifts.length > 0 ? (
                        currentShifts.map(shift => (
                            <tr key={shift.id}>
                                <td>
                                    <div className="admin-shift-name">{shift.name}</div>
                                    {shift.description && (
                                        <div className="admin-shift-description">
                                            {shift.description}
                                        </div>
                                    )}
                                </td>
                                <td>{formatDate(shift.startDate)}</td>
                                <td>{formatDate(shift.endDate)}</td>
                                <td>
                                    <div className={`admin-status-badge ${shift.isActive ? 'active' : 'inactive'}`}>
                                        {shift.isActive ? 'Активна' : 'Неактивна'}
                                        <button
                                            className="admin-toggle-status-btn"
                                            onClick={() => handleToggleShiftStatus(shift.id, shift.isActive)}
                                        >
                                            <i className={`fas ${shift.isActive ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                                        </button>
                                    </div>
                                </td>
                                <td className="actions-cell">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEditShift(shift)}
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteShift(shift.id)}
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="no-users">Смены не найдены</td>
                        </tr>
                    )}
                    </tbody>
                </table>

                {filteredShifts.length > shiftsPerPage && (
                    <div className="pagination">
                        <button
                            onClick={() => paginateShifts(currentShiftsPage - 1)}
                            disabled={currentShiftsPage === 1}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>

                        {Array.from({ length: totalShiftPages }, (_, i) => i + 1).map(number => (
                            <button
                                key={number}
                                onClick={() => paginateShifts(number)}
                                className={currentShiftsPage === number ? 'active' : ''}
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            onClick={() => paginateShifts(currentShiftsPage + 1)}
                            disabled={currentShiftsPage === totalShiftPages}
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

export default ShiftsModule;
