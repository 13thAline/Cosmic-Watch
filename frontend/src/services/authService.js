import api from "@/utils/api";

export const registerUser = async (data) => {
  const res = await api.post("/api/auth/register", data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post("/api/auth/login", data);
  return res.data;
};
