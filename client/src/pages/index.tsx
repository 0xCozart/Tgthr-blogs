import React from "react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { Link } from "@chakra-ui/core";

import urqlClient from "../middleware/urqlClient";
import { usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>create post</Link>
      </NextLink>
      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((post) => (
          <div key={post.id}>
            <ul>
              <li>
                {post.title} {post.id} {post.creatorId}
              </li>
            </ul>
          </div>
        ))
      )}
    </Layout>
  );
};

export default withUrqlClient(urqlClient, { ssr: true })(Index);
