import React from "react";
import { NextPage } from "next";
import { Formik, Form } from "formik";

import Wrapper from "../../components/Wrapper";
import InputField from "../../components/InputField";
import { toErrorMap } from "../../utils/toErrorMap";
import { Box, Button } from "@chakra-ui/core";

interface Props {
  token: string;
}

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async ({ newPassword }, { setErrors }) => {
          // const response = await login({
          //   usernameOrEmail,
          //   password,
          // });
          // if (response.data?.login.errors) {
          //   setErrors(toErrorMap(response.data.login.errors));
          // } else if (response.data?.login.user) {
          //   router.push("/");
          // }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="new password"
              label="New Password"
              type="password"
            />
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              submit
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  console.log(query);
  return {
    token: query.token as string,
  };
};

export default ChangePassword;
