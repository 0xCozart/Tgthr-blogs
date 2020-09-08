import gql from "graphql-tag";
import * as Urql from "urql";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: "Query";
  hello: Scalars["String"];
  posts: Array<Post>;
  post?: Maybe<Post>;
  me?: Maybe<User>;
};

export type QueryPostArgs = {
  id: Scalars["Int"];
};

export type Post = {
  __typename?: "Post";
  id: Scalars["Int"];
  createdAt: Scalars["String"];
  updatedAt: Scalars["String"];
  title: Scalars["String"];
};

export type User = {
  __typename?: "User";
  id: Scalars["Int"];
  createdAt: Scalars["String"];
  updatedAt: Scalars["String"];
  username: Scalars["String"];
};

export type Mutation = {
  __typename?: "Mutation";
  createPost: Post;
  updateTitlePost?: Maybe<Post>;
  deletePost: Scalars["Boolean"];
  register: UserResponse;
  login: UserResponse;
};

export type MutationCreatePostArgs = {
  title: Scalars["String"];
};

export type MutationUpdateTitlePostArgs = {
  title?: Maybe<Scalars["String"]>;
  id: Scalars["Int"];
};

export type MutationDeletePostArgs = {
  id: Scalars["Int"];
};

export type MutationRegisterArgs = {
  credentials: UsernamePasswordInput;
};

export type MutationLoginArgs = {
  credentials: UsernamePasswordInput;
};

export type UserResponse = {
  __typename?: "UserResponse";
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type FieldError = {
  __typename?: "FieldError";
  field: Scalars["String"];
  message: Scalars["String"];
};

export type UsernamePasswordInput = {
  username: Scalars["String"];
  password: Scalars["String"];
};

export type LoginMutationVariables = Exact<{
  credentials: UsernamePasswordInput;
}>;

export type LoginMutation = { __typename?: "Mutation" } & {
  login: { __typename?: "UserResponse" } & {
    errors?: Maybe<
      Array<
        { __typename?: "FieldError" } & Pick<FieldError, "field" | "message">
      >
    >;
    user?: Maybe<
      { __typename?: "User" } & Pick<
        User,
        "id" | "username" | "createdAt" | "updatedAt"
      >
    >;
  };
};

export type RegisterMutationVariables = Exact<{
  username: Scalars["String"];
  password: Scalars["String"];
}>;

export type RegisterMutation = { __typename?: "Mutation" } & {
  register: { __typename?: "UserResponse" } & {
    errors?: Maybe<
      Array<
        { __typename?: "FieldError" } & Pick<FieldError, "field" | "message">
      >
    >;
    user?: Maybe<
      { __typename?: "User" } & Pick<
        User,
        "id" | "username" | "createdAt" | "updatedAt"
      >
    >;
  };
};

export const LoginDocument = gql`
  mutation Login($credentials: UsernamePasswordInput!) {
    login(credentials: $credentials) {
      errors {
        field
        message
      }
      user {
        id
        username
        createdAt
        updatedAt
      }
    }
  }
`;

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
}
export const RegisterDocument = gql`
  mutation Register($username: String!, $password: String!) {
    register(credentials: { username: $username, password: $password }) {
      errors {
        field
        message
      }
      user {
        id
        username
        createdAt
        updatedAt
      }
    }
  }
`;

export function useRegisterMutation() {
  return Urql.useMutation<RegisterMutation, RegisterMutationVariables>(
    RegisterDocument
  );
}
