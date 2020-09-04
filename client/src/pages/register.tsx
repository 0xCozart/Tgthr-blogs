import React from "react";
import { useMutation } from "urql";
import { Formik, Form } from "formik";
import { Box, Button } from "@chakra-ui/core";

import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";

interface registerProps {}

const REGISTER_MUTATION = `
  mutation Register($username: String!, $password: String!) {
    register(credentials: { username: $username, password: $password }) {
      errors {
        field
        message
      }
      user {
        id
        username
        createdAt
        updatedAt
      }
    }
  }
`;

const Register: React.FC<registerProps> = ({}) => {
  const [status, register] = useMutation(REGISTER_MUTATION);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => {
          console.log(values);
          // Can simply pass in register(values) since the keys in
          // the value objects match but practice.
          register({
            username: values.username,
            password: values.password,
          });
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
