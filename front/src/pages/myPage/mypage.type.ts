export interface propsType {
  handleEnterMeeting: (_: React.MouseEvent<HTMLButtonElement>) => void;
  handleCreateMeeting: (_: React.MouseEvent<HTMLButtonElement>) => void;
  meetingId?: string;
  onChange?: () => {};
}
