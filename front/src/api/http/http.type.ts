export type SignInData = {
  userId: string;
  userPassword: string;
}

export type SignUpData = {
  userId: string;
  userPassword: string;
  userName: string;
  userType: "PROFESSOR" | "STUDENT";
}