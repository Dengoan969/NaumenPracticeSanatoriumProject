import axios from "axios";

const API_URL = "http://localhost:8080/api";

const getAssignedCabinets = async (userId, token) => {
  const response = await axios.get(
    `${API_URL}/staff-cabinets/by-user/${userId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

const getActiveShifts = async (token) => {
  const response = await axios.get(`${API_URL}/shifts/active`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getPatientsForCabinetAndShift = async (cabinetId, shiftId, token) => {
  const response = await axios.get(
    `${API_URL}/appointments/shift/${shiftId}/cabinet/${cabinetId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  // Группируем по пациентам
  const patientsMap = new Map();
  response.data.forEach((appointment) => {
    if (!patientsMap.has(appointment.studentId)) {
      patientsMap.set(appointment.studentId, {
        id: appointment.studentId,
        fullName: appointment.studentName,
        phone: appointment.studentPhone || "не указан",
        email: appointment.studentEmail || "не указан",
        procedures: [],
      });
    }
    patientsMap.get(appointment.studentId).procedures.push(appointment);
  });

  return Array.from(patientsMap.values());
};

const getProcedureCompletions = async (appointmentId, token) => {
  const response = await axios.get(
    `${API_URL}/procedure-completions/by-appointment/${appointmentId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

const markProcedureAsCompleted = async (
  appointmentId,
  userId,
  notes,
  token,
) => {
  const response = await axios.post(
    `${API_URL}/procedure-completions`,
    {
      appointmentId,
      userId,
      notes,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

const NurseDashboardService = {
  getAssignedCabinets,
  getActiveShifts,
  getPatientsForCabinetAndShift,
  getProcedureCompletions,
  markProcedureAsCompleted,
};

export default NurseDashboardService;
