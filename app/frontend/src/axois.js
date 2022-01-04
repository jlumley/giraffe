import axios from "axios";

const HOST = "localhost";
const PREFIX = "/api";
const PORT = 80;

const instance = axios.create({
    baseURL: `http://${HOST}:${PORT}${PREFIX}`,
})


export default instance;
