import { execSync } from "child_process";

console.log('📦 Instalando dependências de produção do backend...');
try {
  // Instalamos as dependências de produção e o prisma para gerar o client
  execSync('cd backend && npm install --omit=dev', { stdio: 'inherit' });
  execSync('cd backend && npm install prisma', { stdio: 'inherit' });
} catch (error) {
  console.error('Erro ao instalar dependências:', error);
  process.exit(1);
}

console.log('🔗 Gerando Prisma Client...');
try {
  execSync('cd backend && npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('Erro ao gerar Prisma:', error);
  process.exit(1);
}

console.log('🗃️ Rodando migrações do banco de dados...');
try {
  execSync('cd backend && npx prisma migrate deploy', { stdio: 'inherit' });
} catch (error) {
  console.error('Erro ao rodar migrações do Prisma:', error);
  process.exit(1);
}

console.log('🌱 Semeando dados iniciais no banco (Seed)...');
try {
  // Roda o seed construído e isolado diretamente pelo NodeJS para burlar o TSX exigido pelo prisma config
  execSync('cd backend && node dist/prisma/seed.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Erro ao semear o banco:', error);
  process.exit(1);
}

console.log('🚀 Iniciando o servidor backend...');
try {
  execSync('cd backend && npm start', { stdio: 'inherit' });
} catch (error) {
  console.error('Erro ao iniciar servidor:', error);
  process.exit(1);
}
