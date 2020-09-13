import React, { useState } from "react";
import { Box, Flex, Button, Link } from "@chakra-ui/core";
import NextLink from "next/link";
import { Formik, Form, FormikErrors } from "formik";
import { useRouter, Router } from "next/router";

import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { toErrorMap } from "../utils/toErrorMap";
import { isServer } from "../utils/isServer";
import { withUrqlClient } from "next-urql";
import { urqlClient } from "../utils/urqlClient";

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [{ data }] = useMeQuery();
  const [, createPost] = useCreatePostMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async ({ title, text }, { setErrors }) => {
          await createPost({ content: { title, text } });
          router.push("/");
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="title" label="Title" />
            <Box mt={3}>
              <InputField
                textArea
                name="text"
                placeholder="text..."
                label="Body"
              />
            </Box>
            <Flex>
              <Button
                mt={5}
                type="submit"
                isLoading={isSubmitting}
                variantColor="teal"
                isDisabled={!data?.me?.id}
              >
                post
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
    </Wrapper>
  );
};

export default withUrqlClient(urqlClient)(CreatePost);
