import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import RoleSelector from "../components/Profile/RoleSelector";
import RegistrarDashboard from "../components/Profile/Roles/RegistrarDashboard";
import DoctorDashboard from "../components/Profile/Roles/DoctorDashboard";
import NurseDashboard from "../components/Profile/Roles/NurseDashboard";
import UserDashboard from "../components/Profile/Roles/UserDashboard";
import AdminDashboard from "../components/Profile/Roles/AdminDashboard";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (user?.roles?.length === 1) {
      setSelectedRole(user.roles[0]);
    }
  }, [user]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const renderDashboard = () => {
    switch (selectedRole) {
      case "ROLE_REGISTRAR":
        return <RegistrarDashboard />;
      case "ROLE_ADMIN":
        return <AdminDashboard />;
      case "ROLE_DOCTOR":
        return <DoctorDashboard />;
      case "ROLE_NURSE":
        return <NurseDashboard />;
      case "ROLE_USER":
        return <UserDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="profile-page-container">
      {user?.roles?.length > 1 && (
        <RoleSelector
          roles={user.roles}
          onSelect={handleRoleSelect}
          selectedRole={selectedRole}
        />
      )}
      {renderDashboard()}
    </div>
  );
};

export default ProfilePage;
