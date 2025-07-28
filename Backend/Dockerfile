# Usar a imagem base do Node.js
FROM node:23

# Definir o diretório de trabalho no container
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json para instalar dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o código do backend para o diretório de trabalho
COPY . .

# Expor a porta que o servidor vai usar
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
