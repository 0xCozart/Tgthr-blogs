import React from "react";
import { Box, Flex, Link, Button } from "@chakra-ui/core";
import NextLink from "next/link";

import { useMeQuery } from "../generated/graphql";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
  let body = null;

  // data is loading
  if (fetching) {
    body = (
      <NextLink href="/register">
        <Link mr={2}>register</Link>
      </NextLink>
    );
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link mr={2}>register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex>
        <Box mr={3}>{data.me.username}</Box>
        <Button variant="link">logout</Button>
      </Flex>
    );
  }
  // console.log(body);

  return (
    <Flex bg="tomato" p={4} ml={"auto"}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};

export default NavBar;
