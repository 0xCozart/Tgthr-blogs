import React from "react";
import { useRouter } from "next/router";
import { Formik, Form, FormikErrors } from "formik";
import { Box, Button } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";

import urqlClient from "../middleware/urqlClient";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";

import { toErrorMap } from "../utils/toErrorMap";

interface RegisterMutationInformation {
  credentials: { username: string; email: string; password: string };
}

const Register: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [register] = useRegisterMutation();

  const onFormSubmit = async (
    { credentials: { username, email, password } }: RegisterMutationInformation,
    setErrors: (
      errors: FormikErrors<{
        username: string;
        email: string;
        password: string;
      }>
    ) => void
  ) => {
    const response = await register({
      variables: {
        credentials: {
          username,
          email,
          password,
        },
      },
    });

    if (response.data?.register.errors) {
      setErrors(toErrorMap(response.data.register.errors));
    } else if (response.data?.register.user) {
      router.push("/");
    }
  };

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", email: "", password: "" }}
        onSubmit={async ({ username, email, password }, { setErrors }) =>
          onFormSubmit(
            { credentials: { username, email, password } },
            setErrors
          )
        }
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
                name="email"
                placeholder="email"
                label="Email"
                type="email"
              />
            </Box>
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

export default withUrqlClient(urqlClient)(Register);
