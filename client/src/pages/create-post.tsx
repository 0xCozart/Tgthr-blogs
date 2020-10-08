import { Box, Button, Flex, Link } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import withApollo from "../middleware/withApollo";
import useIsAuth from "../utils/useIsAuth";
import updatePostCache from "../utils/updatePostCache";

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [createPost] = useCreatePostMutation();
  useIsAuth();

  const onFormSubmit = async (title: string, text: string) => {
    try {
      const { errors } = await createPost({
        variables: { content: { title, text } },
        update: (cache) => updatePostCache(cache),
      });
      if (!errors) router.push("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async ({ title, text }) => onFormSubmit(title, text)}
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

export default withApollo({ ssr: false })(CreatePost);
