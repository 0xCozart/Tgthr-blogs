import { withUrqlClient } from "next-urql";
import React from "react";
import Layout from "../../components/Layout";
import PostFull from "../../components/PostFull";
import { usePostQuery, useMeQuery } from "../../generated/graphql";
import useGetPostIdFromUrl from "../../utils/useGetPostIdFromUrl";

const Post = ({}) => {
  const postId = useGetPostIdFromUrl();
  const { data, error, loading } = usePostQuery({
    skip: postId === -1,
    variables: {
      id: postId,
    },
  });
  const { data: meData } = useMeQuery();

  if (!data && loading) {
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
      <PostFull post={data.post} userId={meData?.me?.id} />
    </Layout>
  );
};

export default Post;
