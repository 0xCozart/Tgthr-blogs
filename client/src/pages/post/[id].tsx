import React from "react";
import { withUrqlClient } from "next-urql";

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
