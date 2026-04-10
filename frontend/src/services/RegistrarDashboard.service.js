import axios from 'axios';

const API_URL = 'http://localhost:8080/api/users';

const getRegularUsers = async (token) => {
    const response = await axios.get(`${API_URL}/regular`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

const getUserById = async (id, token) => {
    const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

const createUser = async (userData, token) => {
    const response = await axios.post(API_URL, userData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

const updateUser = async (id, userData, token) => {
    const response = await axios.put(`${API_URL}/${id}`, userData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

const userService = {
    getRegularUsers,
    getUserById,
    createUser,
    updateUser
};

export default userService;
