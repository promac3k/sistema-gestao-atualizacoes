const express = require("express");
const router = express.Router();

const dashboardController = require("../Controllers/dashboardController");

// Rota otimizada para obter todos os dados do dashboard de uma vez
router.get("/data-optimized", dashboardController.getDashboardDataOptimized);

module.exports = router;
