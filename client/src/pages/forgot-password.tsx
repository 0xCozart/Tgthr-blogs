import React, { useState } from "react";
import { withUrqlClient } from "next-urql";
import { Formik, Form } from "formik";
import { Box, Flex, Button } from "@chakra-ui/core";

import urqlClient from "../middleware/urqlClient";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { useForgotPasswordMutation } from "../generated/graphql";

const ForgotPassword: React.FC<{}> = () => {
  const [complete, setComplete] = useState(false);
  const [forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async ({ email }) => {
          await forgotPassword({ variables: { email } });
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>Link to change password sent!</Box>
          ) : (
            <Form>
              <InputField
                name="email"
                placeholder="email"
                label="Email"
                type="email"
              />
              <Flex>
                <Button
                  mt={5}
                  type="submit"
                  isLoading={isSubmitting}
                  variantColor="teal"
                >
                  forgot password
                </Button>
              </Flex>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default ForgotPassword;
