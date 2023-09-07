import React from 'react';

import { useSelector } from 'react-redux';

/*
    useEffect 이용해서 페이지 이동할 때 세션 관리 (별도 파일로 관리하면 좋을듯)
*/

function MyPage() {
  const loginUsername = useSelector((state) => state.loginUsername.username);
  return <div>안녕하세요 {loginUsername}님</div>;
}

export default MyPage;
