export const passwordLengthVerify = (password: string) => {
  if (password.length <= 2) {
    return [
      {
        field: "newPassword",
        message: "length must be greater than 2",
      },
    ];
  }
  return true;
};
