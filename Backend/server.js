// Import dos módulos necessários
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./config/.env" }); // Carregar variáveis de ambiente do arquivo .env

// Importa as rotas
const dispositivosRoutes = require("./Routers/dispositivos");
const updatesRoutes = require("./Routers/updates");
const outrosRoutes = require("./Routers/outros");
const dashboardRoutes = require("./Routers/dashboard");
const relatorioRoutes = require("./Routers/relatorio");

//Midleware basico
const app = express();
app.use(cors());
app.use(express.json());

// Rotas das APIs
app.use("/api/v1/dispositivos", dispositivosRoutes);
app.use("/api/v1/updates", updatesRoutes);
app.use("/api/v1/outros", outrosRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/relatorio", relatorioRoutes);

app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "🚀 Servidor Node.js está rodando!",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

const PORT = process.env.PORT || 3000; // Definindo a porta do servidor, com fallback para 3000
app.listen(PORT, "127.0.0.1", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
