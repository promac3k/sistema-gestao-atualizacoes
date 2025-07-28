import { useState, useEffect } from "react";
import axios from 'axios';

const useServerStatus = () => {
    const [backendOnline, setBackendOnline] = useState(null);

    useEffect(() => {
        const verificarServidor = async () => {
           axios
            .get("http://localhost:3000/") // Ajusta a porta se for diferente
            .then(() => setBackendOnline(true))
            .catch(() => setBackendOnline(false));
        };

        verificarServidor(); // primeira tentativa logo ao carregar

        const intervalo = setInterval(() => {
            if (!backendOnline) {
                console.log("🔁 Tentando reconectar ao servidor...");
                verificarServidor();
            }
        }, 30000); // tenta reconectar a cada 30 segundos

        return () => clearInterval(intervalo); // limpa o intervalo quando desmontar
    }, [backendOnline]);

    return backendOnline;
};

export default useServerStatus;
