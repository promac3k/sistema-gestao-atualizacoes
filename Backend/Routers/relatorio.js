const express = require("express");
const router = express.Router();

const relatorioController = require("../Controllers/relatorioController");

// Rota para o relatório
router.get("/dispositivos", relatorioController.listarDispositivosParaRelatorio); // Lista dispositivos disponíveis para seleção no relatório
router.post("/generate/individual", relatorioController.gerarRelatorioIndividual); // Gera dados do relatório individual de um dispositivo
router.post("/generate/geral", relatorioController.gerarRelatorioGeral); // Gera dados do relatório geral (múltiplos dispositivos)
router.post("/generate/criticos", relatorioController.gerarRelatorioCriticos); // Gera dados do relatório de dispositivos críticos
router.post("/pdf/individual", relatorioController.gerarPDFIndividual); // Gera e retorna PDF do relatório individual
router.post("/pdf/geral", relatorioController.gerarPDFGeral); // Gera e retorna PDF do relatório geral
router.post("/pdf/criticos", relatorioController.gerarPDFCriticos); // Gera e retorna PDF do relatório críticos
router.post("/preview", relatorioController.previewRelatorio); // Preview dos dados do relatório (sem gerar PDF)


module.exports = router;
