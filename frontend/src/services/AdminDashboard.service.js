import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const API_URL = `${API_BASE_URL}/users`;
const ROOMS_URL = `${API_BASE_URL}/rooms`;
const NEWS_URL = `${API_BASE_URL}/news`;
const SHIFTS_URL = `${API_BASE_URL}/shifts`;
const CABINETS_URL = `${API_BASE_URL}/cabinets`;
const STAFF_CABINETS_URL = `${API_BASE_URL}/staff-cabinets`;
const PROCEDURES_URL = `${API_BASE_URL}/procedures`;

// Методы для работы с пользователями
const getAllUsers = async (token) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const createUser = async (userData, token) => {
  const response = await axios.post(API_URL, userData, {
    params: { withRoles: true },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateUser = async (id, userData, token) => {
  const response = await axios.put(`${API_URL}/${id}`, userData, {
    params: { updateRoles: true },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteUser = async (id, token) => {
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const getAllRoles = async (token) => {
  const response = await axios.get(`${API_URL}/roles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.map((role) => ({ name: role }));
};

// Методы для работы с комнатами
const getAllRooms = async (token) => {
  const response = await axios.get(ROOMS_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const createRoom = async (roomData, token) => {
  const response = await axios.post(ROOMS_URL, roomData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateRoom = async (roomId, roomData, token) => {
  const response = await axios.put(`${ROOMS_URL}/${roomId}`, roomData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteRoom = async (roomId, token) => {
  await axios.delete(`${ROOMS_URL}/${roomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Методы для работы с новостями
const getAllNews = async (token) => {
  const response = await axios.get(NEWS_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const createNews = async (title, content, imageFile, token) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  formData.append("imageFile", imageFile);

  const response = await axios.post(NEWS_URL, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const updateNews = async (newsId, title, content, imageFile, token) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  if (imageFile) {
    formData.append("imageFile", imageFile);
  }

  const response = await axios.put(`${NEWS_URL}/${newsId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const deleteNews = async (newsId, token) => {
  await axios.delete(`${NEWS_URL}/${newsId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Методы для работы со сменами
const getAllShifts = async (token) => {
  const response = await axios.get(SHIFTS_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.map((shift) => ({
    ...shift,
    isActive: shift.active,
  }));
};

const createShift = async (shiftData, token) => {
  const dataToSend = {
    ...shiftData,
    active: shiftData.isActive,
  };
  const response = await axios.post(SHIFTS_URL, dataToSend, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    ...response.data,
    isActive: response.data.active,
  };
};

const updateShift = async (id, shiftData, token) => {
  const response = await axios.put(`${SHIFTS_URL}/${id}`, shiftData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteShift = async (id, token) => {
  await axios.delete(`${SHIFTS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const updateShiftStatus = async (id, isActive, token) => {
  const response = await axios.patch(`${SHIFTS_URL}/${id}/status`, null, {
    params: { isActive },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Методы для работы с кабинетами
const getAllCabinets = async (token) => {
  const response = await axios.get(CABINETS_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getCabinetById = async (id, token) => {
  const response = await axios.get(`${CABINETS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const createCabinet = async (cabinetData, token) => {
  const response = await axios.post(CABINETS_URL, cabinetData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateCabinet = async (id, cabinetData, token) => {
  const response = await axios.put(`${CABINETS_URL}/${id}`, cabinetData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteCabinet = async (id, token) => {
  await axios.delete(`${CABINETS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const cabinetExists = async (number, token) => {
  const response = await axios.get(`${CABINETS_URL}/exists`, {
    params: { number },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Методы для работы с закреплением кабинетов за медработниками
const assignCabinetToStaff = async (userId, cabinetId, token) => {
  const response = await axios.post(STAFF_CABINETS_URL, null, {
    params: { userId, cabinetId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const removeCabinetFromStaff = async (userId, cabinetId, token) => {
  await axios.delete(STAFF_CABINETS_URL, {
    params: { userId, cabinetId },
    headers: { Authorization: `Bearer ${token}` },
  });
};

const getCabinetsByStaff = async (userId, token) => {
  const response = await axios.get(`${STAFF_CABINETS_URL}/by-user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getStaffByCabinet = async (cabinetId, token) => {
  const response = await axios.get(
    `${STAFF_CABINETS_URL}/by-cabinet/${cabinetId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

const getAllAssignments = async (token) => {
  const response = await axios.get(`${STAFF_CABINETS_URL}/assignments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Методы для работы с процедурами
const getAllProcedures = async (token) => {
  const response = await axios.get(PROCEDURES_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getProcedureById = async (id, token) => {
  const response = await axios.get(`${PROCEDURES_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getProceduresByCabinet = async (cabinetId, token) => {
  const response = await axios.get(
    `${PROCEDURES_URL}/by-cabinet/${cabinetId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

const createProcedure = async (procedureData, token) => {
  const response = await axios.post(PROCEDURES_URL, procedureData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateProcedure = async (id, procedureData, token) => {
  const response = await axios.put(`${PROCEDURES_URL}/${id}`, procedureData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteProcedure = async (id, token) => {
  await axios.delete(`${PROCEDURES_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const getAllFeedback = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/feedback`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getUnreadFeedback = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/feedback/unread`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const markFeedbackAsRead = async (id, token) => {
  const response = await axios.put(
    `${API_BASE_URL}/feedback/${id}/read`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

const deleteFeedback = async (id, token) => {
  await axios.delete(`${API_BASE_URL}/feedback/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const AdminDashboardService = {
  // Пользователи
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllRoles,

  // Комнаты
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,

  // Новости
  getAllNews,
  createNews,
  updateNews,
  deleteNews,

  // Смены
  getAllShifts,
  createShift,
  updateShift,
  deleteShift,
  updateShiftStatus,

  // Кабинеты
  getAllCabinets,
  getCabinetById,
  createCabinet,
  updateCabinet,
  deleteCabinet,
  cabinetExists,

  // Закрепление кабинетов
  assignCabinetToStaff,
  removeCabinetFromStaff,
  getCabinetsByStaff,
  getStaffByCabinet,
  getAllAssignments,

  // Процедуры
  getAllProcedures,
  getProcedureById,
  getProceduresByCabinet,
  createProcedure,
  updateProcedure,
  deleteProcedure,

  // Обратная связь
  getAllFeedback,
  getUnreadFeedback,
  markFeedbackAsRead,
  deleteFeedback,
};

export default AdminDashboardService;
