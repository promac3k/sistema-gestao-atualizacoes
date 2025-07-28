import axios from "axios";

export const login = async (username, password) => {
    try {
        // console.log("Tentando fazer login com:", { username, password }); // Removido por segurança
        const response = await axios.post(
            "http://localhost:3000/api/v1/outros/login-ad",
            {
                username,
                password,
            }
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            return { success: false, message: error.response.data.message };
        } else {
            return {
                success: false,
                message: "Erro ao comunicar com o servidor.",
            };
        }
    }
};
