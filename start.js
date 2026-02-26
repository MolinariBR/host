const { execSync } = require('child_process');

console.log('📦 Instalando dependências do backend...');
try {
    execSync('cd backend && npm install --omit=dev', { stdio: 'inherit' });
} catch (error) {
    console.error('Erro ao instalar dependências:', error);
    process.exit(1);
}

console.log('🚀 Iniciando o servidor backend...');
try {
    // Ajuste o comando se necessário. Por padrão o script "start" do backend: node dist/src/server.js
    execSync('cd backend && npm start', { stdio: 'inherit' });
} catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
}
