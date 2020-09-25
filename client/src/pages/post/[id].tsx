import React from "react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import urqlClient from "../../middleware/urqlClient";
import { usePostQuery } from "../../generated/graphql";
import Layout from "../../components/Layout";
import PostFull from "../../components/PostFull";

const Post = ({}) => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
  console.log({ data });

  if (!data && fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <div>Cannot find post... :(</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PostFull post={data.post} />
    </Layout>
  );
};

export default withUrqlClient(urqlClient, { ssr: true })(Post);
