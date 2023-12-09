import React, { useEffect, useRef, useState } from 'react';
import Styled from 'styled-components';

const Container = Styled.div`

    width: 100%;
    height: 15%;
    border-radius: 1em;
  margin-bottom: 1.67%;

`;

const VideoContainer = Styled.video`

    width: 100%;
    height: 100%;
    background-color: black;
    border-radius: 10px;
`;

interface Props {
  stream: MediaStream;
  videoKey: number;
  muted?: boolean;
}

const Video = ({ stream, videoKey, muted }: Props) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
    console.log('stream', ref.current?.srcObject);

    if (muted) setIsMuted(muted);
  }, [stream, muted]);

  return (
    <Container>
      <VideoContainer ref={ref} muted={isMuted} autoPlay />;
    </Container>
  );
};

export default Video;
