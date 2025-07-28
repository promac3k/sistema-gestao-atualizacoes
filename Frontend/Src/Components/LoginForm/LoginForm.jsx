import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Input from "../Input/Input";
import Button from "../Button/Button";
import { login } from "../../Services/LoginAPI"; // Import your login service

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const result = await login(username, password);
      console.log("Resultado do login:", result); // Log the result for debugging
      if (result.success) {
        setSuccess(true);
        console.log("Login bem-sucedido:", result);
        localStorage.setItem("auth", "true"); // Save login state
        localStorage.setItem("authTime", Date.now().toString()); // Save login time
        if (onLogin) onLogin();
        navigate("/dashboard"); // Redirect to dashboard
      } else {
        setError(result.message || "Erro ao fazer login.");
      }
    } catch (err) {
      setError("Erro ao comunicar com o servidor.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-md space-y-4"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-800">
        Entrar
      </h2>
      <Input
        label="Utilizador"
        type="text"
        placeholder="nome.de.utilizador"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        label="Senha"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button>Entrar</Button>
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </form>
  );
}