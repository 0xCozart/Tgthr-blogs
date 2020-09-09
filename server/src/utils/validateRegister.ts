import { UsernamePasswordInput } from "../types/UsernamePasswordInput";

export const validateRegister = ({
  username,
  email,
  password,
}: UsernamePasswordInput) => {
  if (!email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email address",
      },
    ];
  }

  if (username.length <= 2) {
    return [
      {
        field: "username",
        message: "username must be longer than two characters",
      },
    ];
  }

  if (username.includes("@")) {
    return [
      {
        field: "username",
        message: "username cannot include an '@'",
      },
    ];
  }

  if (password.length <= 8) {
    return [
      {
        field: "password",
        message: "password must be longer than eight characters",
      },
    ];
  }

  return null;
};
