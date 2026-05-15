# Grand'Oro Landing Page ( CODEPIT)
- **frontend/**: landing page em React + Vite
- **backend/**: API em Node.js + Express
- **SQLite**: banco de dados local para salvar os contatos do formulário

## Como rodar

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev


cd "C:\Users\wak\Desktop\grandoro\backend"
npm run dev 

```

A API ficará em:

```txt
http://localhost:4000
```

Teste:

```bash
curl http://localhost:4000/api/health
```

### 2. Frontend

Abra outro terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev


cd "C:\Users\wak\Desktop\grandoro\frontend"
npm run dev
```

O site ficará em:

```txt
http://localhost:5173
http://localhost:5173/admin --- paienl
```

## Formulário de contato

O formulário envia dados para:

```txt
POST http://localhost:4000/api/contacts
```

Campos salvos no banco:

- nome
- e-mail
- telefone
- data de criação

## Listar contatos cadastrados

No arquivo `backend/.env`, troque:

```txt
ADMIN_TOKEN=wak
```

Depois rode:

```bash
curl -H "x-admin-token:wak" http://localhost:4000/api/contacts
```

