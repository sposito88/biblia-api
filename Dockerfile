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
RUN npm install express
RUN npm install notenv
RUN npm install cors
RUN npm install swagger-ui-express swagger-jsdoc

RUN chmod -R 777 /app/node_modules
# Expôr a porta do servidor
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "server.js"]
