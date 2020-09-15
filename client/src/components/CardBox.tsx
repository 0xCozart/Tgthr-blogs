import React from "react";
import { Box, Heading, Text } from "@chakra-ui/core";

interface CardBoxProps {
  title: string;
  desc: string;
  rest?: any;
}

const CardBox: React.FC<CardBoxProps> = ({ title, desc, ...rest }) => {
  return (
    <Box p={5} shadow="md" borderWidth="1px" flex="1" rounded="md" {...rest}>
      <Heading fontSize="xl">{title}</Heading>
      <Text mt={4}>{desc}</Text>
    </Box>
  );
};

export default CardBox;
