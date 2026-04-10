import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/login.css';

const Login = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotMessage, setShowForgotMessage] = useState(false); // Новое состояние
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!login.trim() || !password.trim()) {
            setError('Логин и пароль обязательны');
            return;
        }

        setLoading(true);
        try {
            const result = await authLogin(login, password);
            if (result.success) {
                navigate('/profile');
            } else {
                setError(result.message || 'Ошибка входа');
            }
        } catch (err) {
            setError('Произошла ошибка при подключении к серверу');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        setShowForgotMessage(true);
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <h1 className="auth-title">Авторизация</h1>

                {error && <div className="alert alert-danger">{error}</div>}
                {showForgotMessage && (
                    <div className="alert alert-info">
                        <span role="img" aria-label="грустный смайлик">😢</span> Какая жалость!<br />
                        Обратитесь к администрации санатория, чтобы создать новый пароль.
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Логин"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            className="input-field"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <i
                            className={`fas ${passwordVisible ? 'fa-eye' : 'fa-eye-slash'} toggle-password`}
                            onClick={() => !loading && setPasswordVisible(!passwordVisible)}
                            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                        ></i>
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>

                <div className="forgot-password">
                    <a href="#forgot" onClick={handleForgotPassword}>
                        Забыли пароль?
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;
