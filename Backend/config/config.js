// Define um objeto de configuração
const config = {
    // Define as configurações do banco de dados
    db: {
        // O endereço do host do banco de dados
        host: process.env.MYSQL_HOST,
        // O nome de usuário para se conectar ao banco de dados
        user: process.env.MYSQL_USER,
        // A senha para se conectar ao banco de dados
        password: process.env.MYSQL_PASSWORD,
        // O nome do banco de dados
        database: process.env.MYSQL_DATABASE,
        // A porta na qual o banco de dados está rodando
        port: process.env.MYSQL_PORT,
        // O tempo máximo, em milissegundos, que o cliente irá esperar por uma conexão antes de desistir
        connectTimeout: 10000,
    },
    // O número de itens a serem exibidos por página
    listPerPage: 10,
};

// Exporta o objeto de configuração para que ele possa ser importado e usado em outros arquivos
module.exports = config;