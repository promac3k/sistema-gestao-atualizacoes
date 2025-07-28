const express = require("express");
const router = express.Router();

const dispositivosController = require("../Controllers/dispositivosController");

// Rota otimizada para obter dados completos (stats + lista) - RECOMENDADA para página principal
router.get("/data-optimized", dispositivosController.getDispositivosDataOptimized);
// Rota para obter dados de um dispositivo específico
router.get("/:id", dispositivosController.getDispositivoById);

module.exports = router;
