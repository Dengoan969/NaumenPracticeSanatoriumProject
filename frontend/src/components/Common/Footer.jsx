import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/footer.css';

const Footer = () => {
    const { user, token, logout } = useAuth();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [notification, setNotification] = useState(null);

    const handleVkClick = () => {
        window.open('https://vk.com/profkom_vsu', '_blank');
    };

    const handleSendFeedback = async () => {
        if (!user) {
            showNotification('Для отправки сообщения необходимо авторизоваться', 'error');
            return;
        }

        if (!message.trim()) {
            showNotification('Сообщение не может быть пустым', 'error');
            return;
        }

        if (message.length > 1000) {
            showNotification('Сообщение слишком длинное (максимум 1000 символов)', 'error');
            return;
        }

        setIsSending(true);

        try {
            await axios.post('http://localhost:8080/api/feedback', {
                message: message,
                userId: user.id,
                userFullName: user.login
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            showNotification('Сообщение успешно отправлено!', 'success');
            setMessage('');
        } catch (err) {
            if (err.response?.status === 401) {
                showNotification('Сессия истекла. Пожалуйста, войдите снова', 'error');
                logout();
                setTimeout(() => window.location.href = '/auth', 1500);
            } else {
                showNotification(
                    err.response?.data?.message || 'Ошибка при отправке сообщения. Попробуйте позже.',
                    'error'
                );
            }
            console.error('Ошибка отправки сообщения:', err);
        } finally {
            setIsSending(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    return (
        <footer>
            <div className="footer-content">
                <div className="footer-center">
                    <i className="fas fa-hospital-alt"></i>
                </div>

                <div className="footer-right">
                    <div className="feedback-text">
                        {user ? 'Есть жалобы или предложения?' : 'Авторизуйтесь, чтобы оставить сообщение'}
                    </div>
                    <div className="feedback-container">
                        <textarea
                            placeholder={user ? "Ваше сообщение (максимум 1000 символов)" : "Авторизуйтесь для отправки сообщения"}
                            value={message}
                            onChange={(e) => {
                                if (user) {
                                    setMessage(e.target.value);
                                    if (notification) setNotification(null);
                                }
                            }}
                            disabled={!user || isSending}
                            className={notification?.type === 'error' ? 'error' : ''}
                            maxLength="1000"
                        />
                        <button
                            onClick={handleSendFeedback}
                            disabled={!user || isSending || !message.trim()}
                            className={isSending ? 'sending' : ''}
                            aria-label="Отправить сообщение"
                            title={!user ? "Требуется авторизация" : ""}
                        >
                            {isSending ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fas fa-paper-plane"></i>
                            )}
                        </button>
                    </div>
                    <div className="feedback-message-container">
                        {notification ? (
                            <div className={`feedback-notification ${notification.type}`}>
                                <i className={`fas ${
                                    notification.type === 'success'
                                        ? 'fa-check-circle'
                                        : 'fa-exclamation-circle'
                                }`}></i>
                                {notification.message}
                            </div>
                        ) : (
                            user && <div className="char-counter">{message.length}/1000 символов</div>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
