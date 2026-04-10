import axios from 'axios';

const API_URL = 'http://localhost:8080/api/news';

const getAllNews = () => {
    return axios.get(API_URL);
};

const createNews = (title, content, imageUrl) => {
    return axios.post(API_URL, {
        title,
        content,
        imageUrl
    });
};

export default {
    getAllNews,
    createNews
};
