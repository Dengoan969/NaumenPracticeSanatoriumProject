import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logoImage from "../../images/logo.jpg";
import "../../styles/header.css";
import UserDashboardService from "../../services/UserDashboard.service";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileData, setProfileData] = useState(null);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user && token) {
        try {
          const data = await UserDashboardService.getProfile(user.id, token);
          setProfileData(data);
        } catch (error) {
          console.error("Ошибка при загрузке данных профиля:", error);
        }
      }
    };

    if (isUserMenuOpen && !profileData) {
      fetchProfileData();
    }
  }, [isUserMenuOpen, user, token, profileData]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsUserMenuOpen(false);
    setProfileData(null); // Очищаем данные профиля при выходе
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => {
        searchRef.current?.focus();
      }, 100);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchExpanded(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchExpanded(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed-top">
      <div className="header-block left-block">
        <Link to="/" className="logo-container">
          <img src={logoImage} alt="Логотип ВоГУ" />
        </Link>

        <i
          className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"} menu-toggle`}
          onClick={toggleMenu}
        ></i>

        {!isSearchExpanded && (
          <nav className={`nav-links ${isMenuOpen ? "active" : ""}`}>
            <Link to="/about" onClick={() => setIsMenuOpen(false)}>
              О санатории
            </Link>
            <Link to="/shifts" onClick={() => setIsMenuOpen(false)}>
              Смены
            </Link>
            <Link to="/services" onClick={() => setIsMenuOpen(false)}>
              Услуги
            </Link>
            <Link to="/contacts" onClick={() => setIsMenuOpen(false)}>
              Контакты
            </Link>
            {user?.roles.includes("ROLE_ADMIN") && (
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                Админ
              </Link>
            )}
          </nav>
        )}

        <div
          className={`search-container ${isSearchExpanded ? "expanded" : ""}`}
          onClick={!isSearchExpanded ? toggleSearch : undefined}
          ref={searchRef}
        >
          {isSearchExpanded ? (
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                autoFocus
              />
              <button type="submit" className="search-submit">
                <i className="fas fa-search"></i>
              </button>
            </form>
          ) : (
            <>
              <i className="fas fa-search"></i>
              <span>Поиск</span>
            </>
          )}
        </div>
      </div>

      <div className="header-block right-block">
        {user ? (
          <div className="user-menu-container" ref={userMenuRef}>
            <div className="user-icon" onClick={toggleUserMenu}>
              <i className="fas fa-user"></i>
            </div>
            {isUserMenuOpen && (
              <div className="user-dropdown">
                {profileData && (
                  <div className="profile-info">
                    <div className="profile-name">{profileData.fullName}</div>
                    <div className="profile-email">{profileData.email}</div>
                    {profileData.phone && (
                      <div className="profile-phone">{profileData.phone}</div>
                    )}
                    {profileData.birthDate && (
                      <div className="profile-birthdate">
                        Дата рождения:{" "}
                        {new Date(profileData.birthDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className="dropdown-item"
                  onClick={() => {
                    navigate("/profile");
                    setIsUserMenuOpen(false);
                  }}
                >
                  <i className="fas fa-user-circle"></i> Профиль
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Выйти
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth">
            <i className="fas fa-sign-in-alt"></i>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
