import React, { useState } from "react";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { Formik, Form } from "formik";
import { Button, Box, Link, Flex } from "@chakra-ui/core";
import NextLink from "next/link";

import urqlClient from "../../middleware/urqlClient";
import { useChangePasswordMutation } from "../../generated/graphql";
import Wrapper from "../../components/Wrapper";
import { toErrorMap } from "../../utils/toErrorMap";
import InputField from "../../components/InputField";

const ChangePassword: React.FC<{}> = () => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  const token =
    typeof router.query.token === "string" ? router.query.token : "";

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "", verifyPassword: "" }}
        onSubmit={async ({ newPassword, verifyPassword }, { setErrors }) => {
          if (newPassword == verifyPassword) {
            console.log(newPassword);
            console.log(verifyPassword);
            const response = await changePassword({
              newPassword,
              token,
            });

            if (response.data?.changePassword.errors) {
              const errorMap = toErrorMap(response.data.changePassword.errors);
              if ("token" in errorMap) {
                setTokenError(errorMap.token);
              }
              setErrors(errorMap);
            } else if (response.data?.changePassword.user) {
              router.push("/");
            }
          } else {
            return setErrors({ verifyPassword: "passwords do not match" });
          }
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
            {tokenError ? (
              <Flex>
                <Box style={{ color: "red" }} mr={2}>
                  {tokenError}
                </Box>
                <NextLink href={"/forgot-password"}>
                  <Link>forgot password</Link>
                </NextLink>
              </Flex>
            ) : null}
            <Box mt={4}>
              <InputField
                name="verifyPassword"
                placeholder="verify password"
                label="Verify Password"
                type="password"
              />
            </Box>
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

export default withUrqlClient(urqlClient, { ssr: false })(ChangePassword);
