# Sistema de Gestão de Atualizações

Sistema de gestão e monitoramento de atualizações baseado em SCCM (System Center Configuration Manager), com uma interface web moderna, desenvolvido durante meu estágio na **T-Systems ITC Ibéria**, no Departamento de TI da **Autoeuropa**.

## 🧠 Sobre o Projeto

Este projeto foi desenvolvido com o objetivo de **substituir parcialmente o SCCM interno da empresa**, oferecendo uma alternativa moderna e mais acessível para monitoramento de dispositivos, gestão de atualizações e geração de relatórios técnicos através de uma interface web intuitiva.

> ⚠️ **Nota:** A funcionalidade de autenticação via Active Directory (AD) ainda não foi finalizada, devido a alterações estruturais que estavam sendo realizadas no ambiente AD da empresa durante o período do desenvolvimento.

---

## 📋 Descrição

Este sistema permite monitorar e gerenciar atualizações de software em dispositivos Windows, integrando-se com dados do SCCM e fornecendo dashboards interativos, relatórios em PDF e um sistema completo de visualização.

---

## 🚀 Funcionalidades

- **Dashboard**: Visão geral do estado dos dispositivos e atualizações
- **Gestão de Dispositivos**: Monitoramento detalhado por máquina
- **Atualizações**: Acompanhamento de status e pendências
- **Relatórios**: Geração de relatórios em PDF (individual, geral, críticos)
- **Autenticação AD**: Integração em desenvolvimento com Active Directory
- **Verificador de Versões**: Comparação automática com versões mais recentes

---

## 🛠️ Tecnologias Utilizadas

### 🔧 Backend

- Node.js
- Express.js
- MySQL
- Integração com Active Directory (em desenvolvimento)
- Geração de PDFs com PDFMake

### 🎨 Frontend

- React.js
- Tailwind CSS
- Webpack
- Axios

---

## 📦 Estrutura do Projeto

├── Backend/
│ ├── Controllers/ # Controladores da API
│ ├── Services/ # Serviços (DB, PDF, etc.)
│ ├── Routers/ # Rotas da API
│ ├── config/ # Configurações e .env.example
│ └── database/ # Scripts SQL e queries
├── Frontend/
│ ├── src/
│ │ ├── Components/ # Componentes reutilizáveis
│ │ ├── Pages/ # Páginas principais
│ │ ├── Services/ # Integração com API
│ │ └── hooks/ # Hooks customizados
│ └── public/ # Arquivos estáticos

---

## ⚙️ Instalação

### Pré-requisitos

- Node.js (v14+)
- MySQL
- Active Directory (opcional)

### Backend
cd Backend
npm install
cp config/.env.example config/.env
# edite o .env com suas credenciais
npm start
ℹ️ Configure seu banco de dados MySQL com os scripts disponíveis em database/.

### Frontend
cd Frontend
npm install
npm start
(Opcional) Defina REACT_APP_API_URL=http://localhost:3000/api/v1 no ambiente.

### 🐳 Docker
O projeto possui suporte a containerização com Docker.

Backend
docker build -t sccm-backend ./Backend
docker run -p 3000:3000 sccm-backend

Frontend
docker build -t sccm-frontend ./Frontend
docker run -p 8080:8080 sccm-frontend

---

📊 Banco de Dados
Utiliza MySQL com estrutura baseada no banco SCCM. Scripts disponíveis:

BD_SCCM com as dependencias.sql

dados_ficticios_completos.sql

SCCM_Queries_Completas.sql

---

🔧 Configuração Active Directory
A integração com AD é opcional e ainda está em fase de testes.

env

AD_URL=ldap://seu-servidor-ad.com
BASE_DN=DC=seu-dominio,DC=com
BIND_DN=CN=conta-servico,DC=seu-dominio,DC=com
BIND_PASSWORD=senha_conta_servico

---

🔌 API Endpoints
/api/v1/dashboard – Dados gerais

/api/v1/dispositivos – Lista de dispositivos

/api/v1/updates – Atualizações pendentes

/api/v1/relatorio – Geração de relatórios PDF

ℹ️ A API segue arquitetura RESTful, com modularização em controllers, services e routers.

---

📝 Uso
Acesse a aplicação: http://localhost:8080

(Opcional) Faça login com credenciais AD

Navegue pelas seções:

Dashboard

Dispositivos

Updates

Relatórios

---

📈 Roadmap
 Finalizar autenticação LDAP/AD

 Suporte a múltiplos servidores SCCM

 Notificações em tempo real

 API REST 100% documentada

 Testes automatizados (Jest / Postman)

 Deploy com CI/CD (GitHub Actions)

---

🤝 Contribuição
Faça um fork

Crie uma branch (git checkout -b feature/nova-feature)

Commit (git commit -m 'feat: nova feature')

Push (git push origin feature/nova-feature)

Abra um Pull Request

---

📄 Licença
Este projeto está sob a licença MIT. Consulte o arquivo LICENSE.

---

🆘 Suporte
Para dúvidas ou suporte, abra uma issue.
