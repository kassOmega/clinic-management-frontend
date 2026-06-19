import axios from "axios";

export const api = axios.create({
  baseURL: "https://api.yourclinicdomain.com/v1", // Replace with your actual backend URL
  headers: {
    "Content-Type": "application/json",
  },
});
