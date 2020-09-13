import { Box, Button, Flex, Link } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";

import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import urqlClient from "../middleware/urqlClient";

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [{ data }] = useMeQuery();
  const [, createPost] = useCreatePostMutation();

  return (
    <Layout variant="small">
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
    </Layout>
  );
};

export default withUrqlClient(urqlClient)(CreatePost);
