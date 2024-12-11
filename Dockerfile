# Imagem base
FROM node:18

# Diretório de trabalho dentro do container
WORKDIR /app

# Copiar arquivos do projeto
COPY package*.json ./
COPY . .

# Instalar dependências
RUN npm install
RUN npm install mysql2

# Expôr a porta do servidor
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "server.js"]
