import Input from './Input';

export default {
  title: 'Components/Input',
  component: Input,
};

export const Default = () => <Input label="Email" placeholder="exemplo@email.com" />;
export const Password = () => <Input label="Senha" type="password" placeholder="••••••••" />;