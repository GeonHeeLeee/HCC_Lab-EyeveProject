import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store/types/redux.type";
import {isJson} from "../api/checker/jsonChecker";
import {SocketMessage} from "../pages/myPage/types";
import {clearSocket, setSocket} from "../store/modules/socketSlice";
import {useNavigate} from "react-router-dom";

const useCreateMeeting = () => {
  const {userId} = useSelector((state: RootState) => state.loginUserInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleCreateMeeting = () => {
    const socket = new WebSocket('ws://localhost:8081/socket');
    socket.onopen = function () {
      socket.send(JSON.stringify({
        userId: userId,
        messageType: 'CREATE',
      }));
      console.log('socket is send');
    }

    socket.addEventListener('message', (event) => {
      const {data} = event;
      let socketMsg: string | SocketMessage<'CREATE'> = !isJson(data) ? data : JSON.parse(data);
      console.log(socketMsg);
      if (typeof socketMsg === 'string') {
        console.log(data);
      } else {
        const {roomName} = socketMsg;
        console.log(roomName)
        navigate(`/meeting?meetingId=${roomName}`);
      }
    })
    // let i = 0;
    socket.onerror = (error) => {
      console.log(error);
      // if (i == 2) {
        // socket.close();
        // dispatch(clearSocket({}));
      // }
      // i++;
    }

    socket.onclose = function () {
      // dispatch(clearSocket({}));
    }//
    dispatch(setSocket({socket}));
  }

  return [handleCreateMeeting] as const;
}

export default useCreateMeeting;