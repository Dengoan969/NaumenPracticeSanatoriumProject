import axios from "axios";

const API_URL = "http://localhost:8080/api";

class UserDashboardService {
  static async getProfile(userId, token) {
    const response = await axios.get(`${API_URL}/users/${userId}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  static async getShifts(userId, token) {
    const response = await axios.get(`${API_URL}/users/${userId}/shifts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  static async getActiveShifts() {
    const response = await axios.get(`${API_URL}/shifts/active`);
    return response.data;
  }
}

export default UserDashboardService;
