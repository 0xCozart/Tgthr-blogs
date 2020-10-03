import React, { useState } from "react";
import { withUrqlClient } from "next-urql";
import { Stack, Flex, Button } from "@chakra-ui/core";

import urqlClient from "../middleware/urqlClient";
import { usePostsSnippetsQuery, useMeQuery } from "../generated/graphql";
import Layout from "../components/Layout";
import PostSnippet from "../components/PostSnippet";

interface vars {
  limit: number;
  cursor: null | string | undefined;
}

const Index = () => {
  const [variables, setVariables] = useState<vars>({
    limit: 5,
    cursor: null,
  });
  const [
    { data: postData, error, fetching: postFetching },
  ] = usePostsSnippetsQuery({
    variables,
  });

  const [{ data: userData }] = useMeQuery();

  if (!postFetching && !postData) {
    return (
      <>
        <div>getting posts failed for some reason...</div>
        <div>{error?.message}</div>
      </>
    );
  }
  return (
    <Layout>
      {!postData && !userData && postFetching ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={5} align="center" shouldWrapChildren>
          {postData?.posts.posts.map((post) => (
            <PostSnippet key={post.id} post={post} userId={userData?.me?.id} />
          ))}
        </Stack>
      )}
      {postData && postData.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() =>
              setVariables({
                limit: variables.limit,
                // gets the timestamp from the last post loaded to pass as cursor
                cursor:
                  postData.posts.posts[postData.posts.posts.length - 1]
                    .createdAt,
              })
            }
            isLoading={postFetching}
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
