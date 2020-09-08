import React from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import NavBar from "../components/NavBar";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <NavBar />
      <div>Hello World!</div>
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((post) => (
          <div key={post.id}>{post.title + post.id}</div>
        ))
      )}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
