import React, { useState } from "react";
import { Stack, Flex, Button } from "@chakra-ui/core";

import {
  usePostsSnippetsQuery,
  useMeQuery,
  PostsQuery,
} from "../generated/graphql";
import Layout from "../components/Layout";
import PostSnippet from "../components/PostSnippet";
import withApollo from "../middleware/withApollo";

const Index = () => {
  const {
    data: postData,
    error,
    loading: postLoading,
    fetchMore,
    variables,
  } = usePostsSnippetsQuery({
    variables: {
      limit: 5,
      cursor: null as null | string,
    },
    notifyOnNetworkStatusChange: true,
  });

  const { data: userData } = useMeQuery();

  if (!postLoading && !postData) {
    return (
      <>
        <div>getting posts failed for some reason...</div>
        <div>{error?.message}</div>
      </>
    );
  }
  return (
    <Layout>
      {!postData && !userData && postLoading ? (
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
            onClick={() => {
              // console.log({ postData });
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  // gets the timestamp from the last post loaded to pass as cursor
                  cursor:
                    postData.posts.posts[postData.posts.posts.length - 1]
                      .createdAt,
                },
                updateQuery: (
                  previousValue,
                  { fetchMoreResult }
                ): PostsQuery => {
                  if (!fetchMoreResult) return previousValue as PostsQuery;

                  // typegen for apollo did not generate the types for updateQuery
                  // need to hard cast types :(
                  return {
                    __typename: "Query",
                    posts: {
                      __typename: "PaginatedPosts",
                      hasMore: (fetchMoreResult as PostsQuery).posts.hasMore,
                      posts: [
                        ...(previousValue as PostsQuery).posts.posts,
                        ...(fetchMoreResult as PostsQuery).posts.posts,
                      ],
                    },
                  };
                },
              });
            }}
            isLoading={postLoading}
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

export default withApollo()(Index);
