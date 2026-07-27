import api from "./api";

export const loginUser = (data: {
  username: string;
  password: string;
}) => {
  return api.post("login/", data);
};

export const registerUser = (data: {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
}) => {
  return api.post("register/", data);
};