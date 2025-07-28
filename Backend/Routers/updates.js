const express = require("express");
const router = express.Router();

const updatesController = require("../Controllers/updatesController");

// Rota para obter dispositivos que necessitam updates (nova função otimizada)
router.get("/data-optimized", updatesController.getDispositivosUpdates);


module.exports = router;