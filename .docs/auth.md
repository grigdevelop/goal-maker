# Login and Register Implementation with BetterAuth

## Prisma Configuration with SQLite

### 1. Install Prisma Client
```bash
npm install @prisma/client
```

### 2. Initialize Prisma
```bash
npx prisma init --datasource-provider sqlite
```

### 3. Update `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4. Update `.env`
```
DATABASE_URL="file:./dev.db"
```

### 5. Create Prisma Client Singleton (`src/lib/prisma.ts`)
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 6. Run Migrations
```bash
npx prisma migrate dev --name init
```

### 7. Generate Prisma Client
```bash
npx prisma generate
```

### 8. Add to `package.json` scripts
```json
"prisma:generate": "prisma generate",
"prisma:migrate": "prisma migrate dev",
"prisma:studio": "prisma studio"
```
