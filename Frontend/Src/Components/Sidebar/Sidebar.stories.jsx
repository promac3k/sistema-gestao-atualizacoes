import Sidebar from './Sidebar';
import Card from '../Card/Card';
import { BrowserRouter } from 'react-router-dom';


export default {
  title: 'Components/Sidebar',
  component: Sidebar,
};

export const DashboardPage = () => (
  <BrowserRouter>
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Bem-vindo</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Usuários" value="125" />
          <Card title="Acessos" value="87" />
          <Card title="Erros" value="4" />
        </div>
      </div>
    </div>
  </BrowserRouter>
);