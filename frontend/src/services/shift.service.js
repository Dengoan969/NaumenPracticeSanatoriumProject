import axios from 'axios';

const API_URL = 'http://localhost:8080/api/shifts';

const getAllShifts = () => {
    return axios.get(API_URL);
};

const getActiveShifts = () => {
    return axios.get(`${API_URL}/active`);
};

const shiftService = {
    getAllShifts,
    getActiveShifts
};

export default shiftService;
