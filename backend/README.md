# Backend — Express + SQLite
- `GET /api/products`
- `GET /api/cart` → `{ items, subtotal, discount, total }`
- `POST /api/cart` `{ productId, qty }`
- `DELETE /api/cart/:id`
- `POST /api/checkout` → receipt


#COMMANDS

cd backend
npm install
cp .env.example .env
npm run dev