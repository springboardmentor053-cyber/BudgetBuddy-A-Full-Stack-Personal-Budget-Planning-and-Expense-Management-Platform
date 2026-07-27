import api from "./api";

export const getIncome = () => {
    return api.get("income/");
};

export const addIncome = (data: any) => {
    return api.post("income/", data);
};

export const deleteIncome = (id: number) => {
    return api.delete(`income/${id}/`);
};

export const updateIncome = (id: number, data: any) => {
    return api.put(`income/${id}/`, data);
};