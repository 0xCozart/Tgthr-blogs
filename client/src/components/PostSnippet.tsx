import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  IconButton,
  Link,
  Stack,
} from "@chakra-ui/core";
import NextLink from "next/link";
import gql from "graphql-tag";
import {
  PostInfoFragment,
  useVoteMutation,
  useDeletePostMutation,
} from "../generated/graphql";
import updateAfterVote from "../utils/updateAfterVote";

interface CardBoxProps {
  userAuth: boolean;
  post: PostInfoFragment;
  userId: number | undefined;
}

const PostSnippet: React.FC<CardBoxProps> = ({
  post: { id, title, text, points, voteStatus, creator, creatorId },
  userId,
  userAuth,
}) => {
  const [vote] = useVoteMutation();
  const [voteLoading, setVoteLoading] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >();
  const [deletePost] = useDeletePostMutation();

  const handleVote = async (value: number) => {
    if (value === 1) setVoteLoading("upvote-loading");
    else setVoteLoading("downvote-loading");

    await vote({
      variables: { value, postId: id },
      update: (cache) => {
        updateAfterVote(value, id, cache);
      },
    });

    setVoteLoading("not-loading");
  };

  const handleDelete = async () => {
    await deletePost({
      variables: { id },
      update: (cache) => {
        // Post:77
        // console.log({ cache });
        cache.evict({ id: "Post:" + id });
      },
    });
  };

  return (
    <Flex
      p={5}
      width={800}
      shadow="md"
      borderWidth="2px"
      flex="1"
      rounded="md"
      marginLeft="auto"
      // align="center"
    >
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        mr={4}
      >
        <IconButton
          aria-label="upvote"
          icon={"chevron-up"}
          size="md"
          onClick={() => handleVote(1)}
          isLoading={voteLoading === "upvote-loading"}
          isDisabled={userAuth}
          variantColor={voteStatus === 1 ? "green" : undefined}
        />
        {points}
        <IconButton
          aria-label="downvote"
          icon={"chevron-down"}
          size="md"
          onClick={() => handleVote(-1)}
          isLoading={voteLoading === "downvote-loading"}
          isDisabled={userAuth}
          variantColor={voteStatus === -1 ? "red" : undefined}
        />
      </Flex>
      <Flex w="100%">
        <Box flex={1}>
          <NextLink href={`/post/[id]`} as={`/post/${id}`}>
            <Link>
              <Heading fontSize="xl">{title}</Heading>
            </Link>
          </NextLink>
          <Text>posted by {creator.username}</Text>
          <Text mt={4}>{text}</Text>
        </Box>
        {userId === creatorId ? (
          <Stack spacing={2} shouldWrapChildren>
            <IconButton
              aria-label="Delete Post"
              icon="delete"
              mr={1}
              onClick={() => handleDelete()}
            />
            <NextLink href={`/post/edit/[id]`} as={`/post/edit/${id}`}>
              <IconButton as={Link} aria-label="Edit Post" icon="edit" mr={1} />
            </NextLink>
          </Stack>
        ) : null}
      </Flex>
    </Flex>
  );
};

export default PostSnippet;
