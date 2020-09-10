import React from "react";
import { withUrqlClient } from "next-urql";
import { urqlClient } from "../utils/urqlClient";

interface Props {}

const ForgotPassword: React.FC<{}> = () => {
  return <div>Forgot password</div>;
};

export default withUrqlClient(urqlClient)(ForgotPassword);
