import React from 'react';

type CustomProps = {
  // type: ''
};

type Props = React.HTMLAttributes<HTMLButtonElement> & CustomProps;

// 도메인에 얽히면 재사용이 어려우므로, css 재사용을 높이기 위한 재사용 컴포넌트
function Button({ onClick, children, ...props }: Props) {
  return (
    <button style={{ borderRadius: '5px' }} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

export default Button;
