import { Box, Button, Flex } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import {
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import urqlClient from "../../../middleware/urqlClient";
import useGetPostIdFromUrl from "../../../utils/useGetPostIdFromUrl";

interface Props {}

const EditPost: React.FC<{}> = ({}: Props) => {
  const router = useRouter();
  const postId = useGetPostIdFromUrl();
  const [{ data, error, fetching }] = usePostQuery({
    pause: postId === -1,
    variables: {
      id: postId,
    },
  });
  const [, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return (
      <Layout>
        <Box>Loading...</Box>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post...</Box>
      </Layout>
    );
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async ({ title, text }) => {
          router.back();
          try {
            await updatePost({ id: postId, title, text });
          } catch (error) {
            console.log(error.message);
          }
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

                // isDisabled={!!data?.me?.id}
              >
                update post
              </Button>
              {/* <Box ml={"auto"}>
                <NextLink href={"/forgot-password"}>
                  <Link opacity={0.5}>forgot password</Link>
                </NextLink>
              </Box> */}
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(urqlClient)(EditPost);
