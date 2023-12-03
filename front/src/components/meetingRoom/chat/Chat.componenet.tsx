import { useSelector } from 'react-redux';
import { getSocket, initSocket } from '../../../services/socket';
import styles from '../../../styles/chat.module.css';
import Button from '../../common/Button';
import React, { useState } from 'react';
import { RootState } from '../../../store/types/redux.type';

type ChatProps = {
  // socket: WebSocket | null | undefined;
  roomId: string | null;
  userId: string;
};

const Chat = ({ roomId, userId }: ChatProps) => {
  const [message, setMessage] = useState('');
  const socket = useSelector((state: RootState) => state.socket.socket);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log(message);
    console.log(socket);

    socket?.send(
      JSON.stringify({
        roomName: roomId,
        userId: userId,
        messageType: 'CHAT',
        message: message,
      })
    );
  };

  if (socket) {
    socket.onmessage = function (event) {
      let msg = JSON.parse(event.data);

      switch (msg.messageType) {
        case 'CHAT':
          console.log(msg);
        // setMessage(msg.message);
      }
    };
  }

  return (
    <>
      <div className={styles['chat-box']}>
        <div className={styles['chat']}>
          <div className={styles['writer']}>작성자</div>
          <div className={styles['reply']}>댓글 내용 </div>
        </div>
      </div>
      <form className={styles['chat-form']}>
        <input
          type='text'
          placeholder='Type a message...'
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setMessage(e.target.value);
          }}
        />
        <button type='submit' onClick={handleSubmit}>
          전송
        </button>
        {/* <Button onClick={handleSubmit} children={'Send'} /> */}
      </form>
    </>
  );
};

export default Chat;
