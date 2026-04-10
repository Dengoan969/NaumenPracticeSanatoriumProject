import axios from "axios";

const API_URL = "http://localhost:8080/api";

const getActiveShifts = async (token) => {
  const response = await axios.get(`${API_URL}/shifts/active`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getShiftRegistrations = async (shiftId, token) => {
  const response = await axios.get(
    `${API_URL}/registrations/shift/${shiftId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

const getAllProcedures = async (token) => {
  const response = await axios.get(`${API_URL}/procedures`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getPatientProcedures = async (patientId, shiftId, token) => {
  const response = await axios.get(
    `${API_URL}/appointments/student/${patientId}/shift/${shiftId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

const assignProcedureToPatient = async (
  patientId,
  procedureId,
  note,
  doctorId,
  shiftId,
  token,
) => {
  const response = await axios.post(
    `${API_URL}/appointments`,
    {
      procedureId,
      studentId: patientId,
      doctorId,
      shiftId,
      appointmentDate: new Date().toISOString().split("T")[0],
      notes: note,
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

const removeProcedureFromPatient = async (appointmentId, token) => {
  await axios.delete(`${API_URL}/appointments/${appointmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const updateProcedureNote = async (appointmentId, note, token) => {
  const response = await axios.patch(
    `${API_URL}/appointments/${appointmentId}/note`,
    { note },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

const DoctorDashboardService = {
  getActiveShifts,
  getShiftRegistrations,
  getAllProcedures,
  getPatientProcedures,
  assignProcedureToPatient,
  removeProcedureFromPatient,
  updateProcedureNote,
};

export default DoctorDashboardService;
