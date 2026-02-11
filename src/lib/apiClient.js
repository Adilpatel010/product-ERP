// const isBrowser = typeof window !== "undefined";

// const baseURL = isBrowser
//     ? `${window.location.protocol}//${window.location.hostname}:3000/api`
//     : process.env.NEXT_PUBLIC_API_BASE_URL;

// import axios from "axios";

// const api = axios.create({
//     baseURL,
//     headers: {
//         "Content-Type": "application/json",
//     },
//     withCredentials: true,
// });

// export default api;


import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: Number(process.env.NEXT_PUBLIC_TIMEOUT) || 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,

});

export default api;
