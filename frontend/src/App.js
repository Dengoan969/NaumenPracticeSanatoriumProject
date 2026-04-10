import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Common/Layout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import NewsPage from './pages/NewsPage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import ShiftsPage from "./pages/ShiftsPage";
import AboutPage from './pages/AboutPage';
import ContactsPage from "./pages/ContactsPage";
import ServicesPage from "./pages/ServicesPage";

function App() {
    const { token, user } = useAuth();

    useEffect(() => {
        // Если есть токен, но нет данных пользователя - они подгрузятся в AuthContext
    }, [token, user]);

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="shifts" element={<ShiftsPage />} />
                <Route path="contacts" element={<ContactsPage />} />
                <Route path="auth" element={<AuthPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="profile" element={<ProfilePage />} />
            </Route>
        </Routes>
    );
}

export default App;
