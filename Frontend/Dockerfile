# Usa uma imagem base do Node.js
FROM node:23

# Cria um diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Executa o build do projeto
RUN npm run build

# Expõe a porta 3000
EXPOSE 3000

# Inicia o servidor com o comando serve
CMD ["npx", "serve", "-s", "build"]
