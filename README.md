# **API da Bíblia**

Esta API permite buscar informações sobre livros, capítulos, versículos e versões da Bíblia. Foi desenvolvida com **Node.js** e conecta-se a um banco de dados **MariaDB/MySQL**.

## **Endpoints**

### **1. Rota Inicial**
- **Descrição**: Verifica o funcionamento da API.
- **URL**: `/`
- **Método**: `GET`
- **Exemplo de Resposta**:
  ```json
  "API da Bíblia está funcionando!"
  ```

---

### **2. Listar Livros**
- **Descrição**: Retorna uma lista de todos os livros da Bíblia.
- **URL**: `/livros`
- **Método**: `GET`
- **Exemplo de Resposta**:
  ```json
  [
    {
      "liv_id": 1,
      "liv_tes_id": 1,
      "liv_posicao": 1,
      "liv_nome": "Gênesis",
      "liv_abreviado": "gn"
    },
    {
      "liv_id": 2,
      "liv_tes_id": 1,
      "liv_posicao": 2,
      "liv_nome": "Êxodo",
      "liv_abreviado": "ex"
    }
  ]
  ```

---

### **3. Buscar Livro por ID**
- **Descrição**: Retorna informações sobre um livro específico.
- **URL**: `/livros/:id`
- **Método**: `GET`
- **Parâmetros**:
  - `id` (path): ID do livro.
- **Exemplo de Resposta**:
  ```json
  {
    "liv_id": 1,
    "liv_tes_id": 1,
    "liv_posicao": 1,
    "liv_nome": "Gênesis",
    "liv_abreviado": "gn"
  }
  ```

- **Resposta de Erro**:
  ```json
  {
    "error": "Livro não encontrado"
  }
  ```

---

### **4. Listar Testamentos**
- **Descrição**: Retorna todos os testamentos da Bíblia.
- **URL**: `/testamentos`
- **Método**: `GET`
- **Exemplo de Resposta**:
  ```json
  [
    {
      "tes_id": 1,
      "tes_nome": "Antigo Testamento"
    },
    {
      "tes_id": 2,
      "tes_nome": "Novo Testamento"
    }
  ]
  ```

---

### **5. Buscar Versículos**
- **Descrição**: Retorna versículos filtrados por critérios.
- **URL**: `/versiculos`
- **Método**: `GET`
- **Parâmetros** (query string):
  - `liv_id` (opcional): ID do livro.
  - `capitulo` (opcional): Número do capítulo.
  - `versiculo` (opcional): Número do versículo.
  - `abreviacao` (opcional): Abreviação da versão da Bíblia.
- **Exemplo de Requisição**:
  ```
  GET /versiculos?liv_id=1&capitulo=1&versiculo=1&abreviacao=ARA
  ```
- **Exemplo de Resposta**:
  ```json
  [
    {
      "ver_id": 1,
      "ver_vrs_id": 1,
      "ver_liv_id": 1,
      "ver_capitulo": 1,
      "ver_versiculo": 1,
      "ver_texto": "No princípio criou Deus os céus e a terra."
    }
  ]
  ```

---

### **6. Pesquisar Versículos por Texto**
- **Descrição**: Retorna versículos que contêm o texto pesquisado.
- **URL**: `/pesquisar`
- **Método**: `GET`
- **Parâmetros**:
  - `q` (obrigatório): Texto a ser pesquisado.
- **Exemplo de Requisição**:
  ```
  GET /pesquisar?q=Deus
  ```
- **Exemplo de Resposta**:
  ```json
  [
    {
      "ver_id": 1,
      "ver_vrs_id": 1,
      "ver_liv_id": 1,
      "ver_capitulo": 1,
      "ver_versiculo": 1,
      "ver_texto": "No princípio criou Deus os céus e a terra."
    }
  ]
  ```

---

### **7. Listar Versões**
- **Descrição**: Retorna todas as versões disponíveis da Bíblia.
- **URL**: `/versoes`
- **Método**: `GET`
- **Exemplo de Resposta**:
  ```json
  [
    {
      "vrs_id": 1,
      "vrs_abreviacao": "ARA"
    },
    {
      "vrs_id": 2,
      "vrs_abreviacao": "NVI"
    }
  ]
  ```

---

### **8. Buscar Versículo Aleatório**
- **Descrição**: Retorna um versículo aleatório de uma versão específica.
- **URL**: `/:abreviacao/random`
- **Método**: `GET`
- **Parâmetros**:
  - `abreviacao` (path): Abreviação da versão da Bíblia (ex.: ARA, NVI).
- **Exemplo de Requisição**:
  ```
  GET /ARA/random
  ```
- **Exemplo de Resposta**:
  ```json
  {
    "livro": 1,
    "capitulo": 1,
    "versiculo": 1,
    "texto": "No princípio criou Deus os céus e a terra."
  }
  ```

---

## **Erros Comuns**
- **400 - Requisição Inválida**:
  ```json
  {
    "error": "O parâmetro de busca 'q' é obrigatório"
  }
  ```

- **404 - Não Encontrado**:
  ```json
  {
    "error": "Nenhum versículo encontrado para esta abreviação"
  }
  ```

- **500 - Erro no Servidor**:
  ```json
  {
    "error": "Erro interno do servidor"
  }
  ```

---

## **Instalação**
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=sua-senha
   DB_DATABASE=biblia
   DB_PORT=3306
   ```
4. Inicie o servidor:
   ```bash
   node server.js
   ```

---

## **Swagger - Documentação Interativa**
- Após iniciar o servidor, acesse:
  ```
  http://localhost:3000/api-docs
  ```

- A documentação interativa permitirá testar todos os endpoints.

---

