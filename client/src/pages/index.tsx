import React from "react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { Link, Stack, Box, Heading, Text } from "@chakra-ui/core";

import urqlClient from "../middleware/urqlClient";
import { usePostsSnippetsQuery } from "../generated/graphql";
import Layout from "../components/Layout";

const Index = () => {
  const [{ data }] = usePostsSnippetsQuery({ variables: { limit: 10 } });
  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>create post</Link>
      </NextLink>
      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data.posts.map((post) => (
            <Box p={post.id} shadow="md" borderWidth="1px">
              <Heading fontSize="l">{post.title}</Heading>
              <Text mt={4}>{post.textSnippet}...</Text>
            </Box>
          ))}
        </Stack>
      )}
    </Layout>
  );
};

export default withUrqlClient(urqlClient, { ssr: true })(Index);
