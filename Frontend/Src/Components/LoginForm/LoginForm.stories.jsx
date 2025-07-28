import LoginForm from './LoginForm';
import { BrowserRouter } from 'react-router-dom';

export default {
  title: 'Forms/LoginForm',
  component: LoginForm,
};

export const Default = () => (
  <BrowserRouter>
    <LoginForm />
  </BrowserRouter>
);