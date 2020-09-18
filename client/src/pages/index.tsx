import React, { useState } from "react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { Link, Stack, Heading, Flex, Button } from "@chakra-ui/core";

import urqlClient from "../middleware/urqlClient";
import { usePostsSnippetsQuery } from "../generated/graphql";
import Layout from "../components/Layout";
import CardBox from "../components/CardBox";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsSnippetsQuery({
    variables,
  });
  console.log({ data, fetching });

  if (!fetching && !data) {
    return <div>getting posts failed for some reason...</div>;
  }
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
        <Stack>
          {data!.posts.posts.map((post) => (
            <CardBox
              key={post.id}
              title={post.title}
              desc={`${post.textSnippet},  ${post.creator?.username}`}
            />
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() =>
              setVariables({
                limit: variables.limit,
                // gets the timestamp from the last post loaded to pass as cursor
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
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
