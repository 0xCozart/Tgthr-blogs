import React from "react";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import { Box, Button, Link, Flex } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";

import urqlClient from "../middleware/urqlClient";
import InputField from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import Layout from "../components/Layout";

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [login] = useLoginMutation();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async ({ usernameOrEmail, password }, { setErrors }) => {
          const response = await login({
            variables: {
              usernameOrEmail,
              password,
            },
          });

          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            router.push(
              typeof router.query.next === "string" ? router.query.next : "/"
            );
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="username or email"
              label="Username or Email"
            />
            <Box mt={3}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex>
              <Button
                mt={5}
                type="submit"
                isLoading={isSubmitting}
                variantColor="teal"
              >
                login
              </Button>
              <Box ml={"auto"}>
                <NextLink href={"/forgot-password"}>
                  <Link opacity={0.5}>forgot password</Link>
                </NextLink>
              </Box>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default Login;
