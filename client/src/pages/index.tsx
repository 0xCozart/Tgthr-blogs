import React from "react";
import { withUrqlClient } from "next-urql";
import { urqlClient } from "../utils/urqlClient";
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

export default withUrqlClient(urqlClient, { ssr: true })(Index);
