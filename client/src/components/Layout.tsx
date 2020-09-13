import React from "react";
import Wrapper, { WrapperVariant } from "./Wrapper";
import NavBar from "./NavBar";

interface LayoutProps {
  variant?: WrapperVariant;
}

const Layout: React.FC<LayoutProps> = ({ variant }) => {
  return (
    <Wrapper variant={variant}>
      <NavBar />
    </Wrapper>
  );
};

export default Layout;
