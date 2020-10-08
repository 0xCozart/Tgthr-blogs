import { Box, Button, Flex, Link } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import {
  useChangePasswordMutation,
  MeQuery,
  MeDocument,
} from "../../generated/graphql";
import withApollo from "../../middleware/withApollo";
import { toErrorMap } from "../../utils/toErrorMap";

const ChangePassword: React.FC<{}> = () => {
  const router = useRouter();
  const [changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  const token =
    typeof router.query.token === "string" ? router.query.token : "";

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "", verifyPassword: "" }}
        onSubmit={async ({ newPassword, verifyPassword }, { setErrors }) => {
          if (newPassword === verifyPassword) {
            const response = await changePassword({
              variables: {
                newPassword,
                token,
              },
              update: (cache, { data }) => {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {
                    __typename: "Query",
                    me: data?.changePassword.user,
                  },
                });
              },
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

export default withApollo({ ssr: false })(ChangePassword);
