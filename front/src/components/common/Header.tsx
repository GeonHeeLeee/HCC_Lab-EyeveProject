import { useSelector } from 'react-redux';
import { RootState } from '../../store/types/redux.type';
import Button from './Button';

const Header = () => {
  const { networkInterface } = useSelector((state: RootState) => state.network);
  const { userName } = useSelector((state: RootState) => state.loginUser);

  const signOutHandler = () => {};

  return (
    <header>
      <div>Eyeve Project</div>
      <span>{userName}님, 안녕하세요!</span>
      <Button>로그아웃</Button>
    </header>
  );
};

export default Header;
