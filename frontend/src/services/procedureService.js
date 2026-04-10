import axios from "axios";

const API_URL = "http://localhost:8080/api/procedures";

const getAllProcedures = () => {
  return axios.get(API_URL);
};

const procedureService = {
  getAllProcedures,
};

export default procedureService;
