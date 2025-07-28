import Button from './Button';

export default {
  title: 'Components/Button',
  component: Button,
};

export const Default = () => <Button>Entrar</Button>;
export const Disabled = () => <Button disabled className="opacity-50 cursor-not-allowed">Desativado</Button>;