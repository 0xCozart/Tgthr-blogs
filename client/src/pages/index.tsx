import React, { useState } from "react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { Link, Stack, Box, Heading, Text, Flex, Button } from "@chakra-ui/core";

import urqlClient from "../middleware/urqlClient";
import { usePostsSnippetsQuery } from "../generated/graphql";
import Layout from "../components/Layout";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string | undefined,
  });
  const [{ data, fetching }] = usePostsSnippetsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>getting posts failed for some reason...</div>;
  }

  const handleSubmit = () => {
    setVariables({
      limit: 10,
      cursor: data?.posts[data.posts.length - 1].createdAt,
    });
  };

  return (
    <Layout>
      <Flex align={"center"}>
        <Heading>Tgthr</Heading>
        <NextLink href="/create-post">
          <Link ml={"auto"}>create post</Link>
        </NextLink>
      </Flex>
      <br />
      {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.map((post) => (
            <Box p={post.id} shadow="md" borderWidth="1px">
              <Heading fontSize="l">{post.title}</Heading>
              <Text mt={4}>{post.textSnippet}...</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data ? (
        <Flex>
          <Button
            onClick={() => handleSubmit()}
            isLoading={fetching}
            m="auto"
            my={8}
          >
            load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(urqlClient, { ssr: true })(Index);
