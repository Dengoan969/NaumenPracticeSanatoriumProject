import React from "react";
import "../../styles/role-selector.css";

const roleData = {
  ROLE_USER: {
    name: "Пользователь",
    desc: "Студент/сотрудник",
    icon: "fa-user",
  },
  ROLE_ADMIN: {
    name: "Администратор",
    desc: "Полный доступ",
    icon: "fa-user-shield",
  },
  ROLE_REGISTRAR: {
    name: "Регистратор",
    desc: "Оформление пользователей",
    icon: "fa-clipboard-check",
  },
  ROLE_DOCTOR: {
    name: "Врач",
    desc: "Осмотры и лечение",
    icon: "fa-user-md",
  },
  ROLE_NURSE: {
    name: "Медработник",
    desc: "Процедуры и уход",
    icon: "fa-user-nurse",
  },
};

const RoleSelector = ({ roles, onSelect, selectedRole }) => {
  return (
    <div className="role-selector">
      <div className="content-wrapper">
        <div className="role-container">
          {roles.map((role) => (
            <div
              key={role}
              className={`role-card ${selectedRole === role ? "active" : ""}`}
              onClick={() => onSelect(role)}
            >
              <div className="role-icon">
                <i className={`fas ${roleData[role]?.icon || "fa-user"}`}></i>
              </div>
              <h3 className="role-name">{roleData[role]?.name || role}</h3>
              <p className="role-desc">
                {roleData[role]?.desc || "Описание роли"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
