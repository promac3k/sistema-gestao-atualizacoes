# Configuração de Segurança

## Antes de usar em produção:

1. **Configurar variáveis de ambiente**:

    - Copie `.env.example` para `.env` em ambas as pastas (Backend/config/ e Frontend/)
    - Configure todas as variáveis com seus valores reais
    - **NUNCA** faça commit dos arquivos `.env`

2. **Configurações obrigatórias**:

    - `MYSQL_HOST`: Endereço do seu servidor MySQL
    - `MYSQL_USER`: Usuário do banco de dados
    - `MYSQL_PASSWORD`: Senha do banco de dados
    - `MYSQL_DATABASE`: Nome do banco de dados
    - `AD_URL`: URL do seu Active Directory
    - `BIND_DN`: Distinguished Name para autenticação
    - `BIND_PASSWORD`: Senha da conta de serviço

3. **Segurança**:

    - Altere todas as senhas padrão
    - Use conexões HTTPS em produção
    - Configure firewall adequadamente
    - Mantenha o sistema atualizado

4. **Logs**:
    - Em produção, configure `DEBUG=false`
    - Monitore logs regularmente
    - Implemente rotação de logs

## Aviso

Este sistema foi desenvolvido para ambientes corporativos e contém integração com Active Directory e SCCM. Configure adequadamente antes do uso.
