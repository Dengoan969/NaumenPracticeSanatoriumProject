import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import UsersModule from './Modules/UsersModule';
import RoomsModule from './Modules/RoomsModule';
import NewsModule from './Modules/NewsModule';
import ShiftsModule from './Modules/ShiftsModule';
import CabinetsModule from './Modules/CabinetsModule';
import ProceduresModule from './Modules/ProceduresModule';
import FeedbackModule from './Modules/FeedbackModule';
import '../../../styles/Dashboard.css';

const AdminDashboard = () => {
    const { user: currentUser } = useAuth();
    const [activeMenu, setActiveMenu] = useState('users');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                if (currentUser?.token) {
                    const response = await fetch('/api/feedback/unread-count', {
                        headers: {
                            'Authorization': `Bearer ${currentUser.token}`
                        }
                    });
                    const data = await response.json();
                    setUnreadCount(data);
                }
            } catch (error) {
                console.error('Error fetching unread messages count:', error);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000); // Обновлять каждую минуту

        return () => clearInterval(interval);
    }, [currentUser]);

    const renderModule = () => {
        switch (activeMenu) {
            case 'users':
                return <UsersModule />;
            case 'rooms':
                return <RoomsModule />;
            case 'news':
                return <NewsModule />;
            case 'shifts':
                return <ShiftsModule />;
            case 'cabinets':
                return <CabinetsModule />;
            case 'procedures':
                return <ProceduresModule />;
            case 'feedback':
                return <FeedbackModule />;
            default:
                return <UsersModule />;
        }
    };

    return (
        <div className="content-wrapper">
            <div className="main-container">
                <div className="main-content">
                    <div className="admin-header">
                        <div className="admin-header-top">
                            <h1 className="admin-title">Панель администратора</h1>
                            <div className="admin-welcome">
                                <span>Здравствуйте! {currentUser?.login}</span>
                                <div className="admin-role-icon">
                                    <i className="fas fa-user-shield"></i>
                                </div>
                            </div>
                        </div>
                        <div className="admin-menu-tabs">
                            <button
                                className={`menu-item ${activeMenu === 'users' ? 'active' : ''}`}
                                onClick={() => setActiveMenu('users')}
                            >
                                <i className="fas fa-users"></i>
                                <span>Пользователи</span>
                            </button>
                            <button
                                className={`menu-item ${activeMenu === 'rooms' ? 'active' : ''}`}
                                onClick={() => setActiveMenu('rooms')}
                            >
                                <i className="fas fa-door-open"></i>
                                <span>Комнаты</span>
                            </button>
                            <button
                                className={`menu-item ${activeMenu === 'cabinets' ? 'active' : ''}`}
                                onClick={() => setActiveMenu('cabinets')}
                            >
                                <i className="fas fa-procedures"></i>
                                <span>Кабинеты</span>
                            </button>
                            <button
                                className={`menu-item ${activeMenu === 'procedures' ? 'active' : ''}`}
                                onClick={() => setActiveMenu('procedures')}
                            >
                                <i className="fas fa-syringe"></i>
                                <span>Процедуры</span>
                            </button>
                            <button
                                className={`menu-item ${activeMenu === 'news' ? 'active' : ''}`}
                                onClick={() => setActiveMenu('news')}
                            >
                                <i className="fas fa-newspaper"></i>
                                <span>Новости</span>
                            </button>
                            <button
                                className={`menu-item ${activeMenu === 'shifts' ? 'active' : ''}`}
                                onClick={() => setActiveMenu('shifts')}
                            >
                                <i className="fas fa-calendar-alt"></i>
                                <span>Смены</span>
                            </button>
                            <button
                                className={`menu-item ${activeMenu === 'feedback' ? 'active' : ''}`}
                                onClick={() => setActiveMenu('feedback')}
                            >
                                <i className="fas fa-comment-alt"></i>
                                <span>ЖиП</span>
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="admin-content">
                        <div className="admin-main-content">
                            {renderModule()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
