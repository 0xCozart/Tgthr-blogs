import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  IconButton,
  Stack,
  Link,
} from "@chakra-ui/core";
import NextLink from "next/link";
import {
  PostInfoFragment,
  useVoteMutation,
  useDeletePostMutation,
} from "../generated/graphql";

interface CardBoxProps {
  post: PostInfoFragment;
  userId: number | undefined;
}

const PostFull: React.FC<CardBoxProps> = ({
  post: { id, title, text, points, voteStatus, creatorId, creator },
  userId,
}) => {
  const [{}, vote] = useVoteMutation();
  const [voteLoading, setVoteLoading] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >();
  const [, deletePost] = useDeletePostMutation();

  const handleVote = async (value: number) => {
    try {
      if (value === 1) {
        setVoteLoading("upvote-loading");
        await vote({ value, postId: id });
      } else {
        // if (voteStatus === -1) return;
        setVoteLoading("downvote-loading");
        await vote({ value: -1, postId: id });
      }
    } catch (error) {
      console.log(error);
    }
    setVoteLoading("not-loading");
  };

  const handleDelete = async () => {
    await deletePost({ id });
  };

  return (
    <Flex p={5} shadow="md" borderWidth="2px" flex="1" rounded="md" m={2}>
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
          // isDisabled={voteStatus === 1}
          variantColor={voteStatus === 1 ? "green" : undefined}
        />
        {points}
        <IconButton
          aria-label="downvote"
          icon={"chevron-down"}
          size="md"
          onClick={() => handleVote(-1)}
          isLoading={voteLoading === "downvote-loading"}
          // isDisabled={voteStatus === -1}
          variantColor={voteStatus === -1 ? "red" : undefined}
        />
      </Flex>
      <Flex w="100%">
        <Box flex={1}>
          <Heading fontSize="xl">{title}</Heading>
          <Text>{creator.username}</Text>
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

export default PostFull;
