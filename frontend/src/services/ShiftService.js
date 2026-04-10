import axios from "axios";

const API_URL = "http://localhost:8080/api";

const getActiveShifts = async (token) => {
  const response = await axios.get(`${API_URL}/shifts/active`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const registerUserForShift = async (userId, shiftId, roomId, token) => {
  const response = await axios.post(
    `${API_URL}/registrations`,
    { userId, shiftId, roomId },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

const getUserRegistrations = async (userId, token) => {
  const response = await axios.get(`${API_URL}/registrations/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getAvailableRooms = async (shiftId, token) => {
  const response = await axios.get(
    `${API_URL}/rooms/available?shiftId=${shiftId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

const unregisterUserFromShift = async (userId, shiftId, token) => {
  await axios.delete(
    `${API_URL}/registrations/user/${userId}/shift/${shiftId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
};

const shiftService = {
  getActiveShifts,
  registerUserForShift,
  getUserRegistrations,
  getAvailableRooms,
  unregisterUserFromShift,
};

export default shiftService;
