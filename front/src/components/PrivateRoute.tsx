import {useNavigate} from 'react-router-dom';

import {useSelector, useDispatch} from 'react-redux';

import {logout} from '../store/modules/isLoginSlice';
import {RootState} from "../store/types/redux.type";

interface IProps {
  component: JSX.Element;
}

function PrivateRoute({component: Component}: IProps) {
  const isLogined = useSelector((state: RootState) => state.isLogin.value);

  const dispatch = useDispatch();
  const sessionId = localStorage.getItem('sessionId');

  const navigate = useNavigate();

  if (sessionId) {
    // 세션 유지
  } else {
    dispatch(logout());
  }

  return isLogined
      ? Component
      : // <Navigate to='/' {...alert('로그인이 필요합니다.')}></Navigate>
      navigate('/');
}

export default PrivateRoute;
