import React, { useState } from "react";
import { Box, Heading, Text, Flex, IconButton } from "@chakra-ui/core";
import {
  PostInfoWithTextSnippetsFragment,
  useVoteMutation,
} from "../generated/graphql";
interface CardBoxProps {
  post: PostInfoWithTextSnippetsFragment;
}

const PostSnippet: React.FC<CardBoxProps> = ({
  post: { id, title, textSnippet, points, voteStatus },
}) => {
  const [{}, vote] = useVoteMutation();
  const [voteLoading, setVoteLoading] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >();
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
      <Box>
        <Heading fontSize="xl">{title}</Heading>
        <Text mt={4}>{textSnippet}</Text>
      </Box>
    </Flex>
  );
};

export default PostSnippet;
