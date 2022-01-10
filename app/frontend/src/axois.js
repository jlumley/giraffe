import axios from "axios";

const PREFIX = "/api";

const instance = axios.create({
    baseURL: `${PREFIX}`,
})


export default instance;
