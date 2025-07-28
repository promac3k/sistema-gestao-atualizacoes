import Table from './Table';

export default {
  title: 'Components/Table',
  component: Table,
};

const columns = ['Nome', 'Email', 'Função'];
const data = [
  { Nome: 'João', Email: 'joao@mail.com', Função: 'Admin' },
  { Nome: 'Maria', Email: 'maria@mail.com', Função: 'Usuária' },
];

export const Default = () => <Table columns={columns} data={data} />;