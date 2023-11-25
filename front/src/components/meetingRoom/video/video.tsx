import React, { useEffect, useRef, useState } from 'react';
import Styled from 'styled-components';

const Container = Styled.div`
    margin: 0;
    width: 12em;
    height: 10em;
`;

const VideoContainer = Styled.video`
    margin: 0;
    width: 12em;
    height: 10em;
    background-color: black;
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
