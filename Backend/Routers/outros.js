const express = require("express");
const router = express.Router();

const outrosController = require("../Controllers/outrosController");

// Rota para obter todos os dispositivos
router.get("/grupos-ad", outrosController.getGruposAD);
router.get("/ultimo-inventario", outrosController.getUltimoInventario);
router.post("/login-ad", outrosController.loginAD);


module.exports = router;