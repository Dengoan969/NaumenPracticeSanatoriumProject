import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

const login = (login, password) => {
  return axios.post(
    API_URL + "/signin",
    {
      login,
      password,
    },
    {
      validateStatus: function (status) {
        return status < 500; // Разрешаем только статусы < 500
      },
    },
  );
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const authService = {
  login,
  logout,
  getCurrentUser,
};

export default authService;
