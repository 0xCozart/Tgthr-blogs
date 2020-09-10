import React from "react";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import { Box, Button } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import { urqlClient } from "../utils/urqlClient";

import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";

import { toErrorMap } from "../utils/toErrorMap";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", email: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          // Can simply pass in register(values) since the keys in
          // the value objects match but practice.
          const response = await register({
            credentials: {
              username: values.username,
              email: values.email,
              password: values.password,
            },
          });

          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push("/");
          }
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
