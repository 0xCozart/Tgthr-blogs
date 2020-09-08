import {
  Resolver,
  InputType,
  Mutation,
  Field,
  Arg,
  Ctx,
  ObjectType,
  Query,
} from "type-graphql";
import argon2 from "argon2";

import { MyContext } from "../types";
import { User } from "../entities/User";

@InputType()
class UsernamePasswordInput {
  @Field(() => String)
  username: string;

  @Field(() => String)
  password: string;
}

@ObjectType()
class FieldError {
  @Field(() => String)
  field: string;

  @Field(() => String)
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  // Me: returns currently signed in user or null
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });

    return user;
  }

  // register: takes in credentials returns user...
  // + creates cookie with user.id...
  // +

  @Mutation(() => UserResponse)
  async register(
    @Arg("credentials")
    { username, password }: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "username must be longer than two characters.",
          },
        ],
      };
    }

    if (password.length <= 8) {
      return {
        errors: [
          {
            field: "password",
            message: "password must be longer than eight characters.",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(password);
    const user = em.create(User, {
      username: username,
      password: hashedPassword,
    });

    try {
      await em.persistAndFlush(user);
    } catch (error) {
      // duplicate user name error handling
      console.log(error);
      if (error.code == "23505") {
        return {
          errors: [{ field: "username", message: "username already taken" }],
        };
      }
    }

    // store user id session
    // sets user cookie
    // keeps user logged in
    req.session.userId = user.id;

    return { user };
  }

  // login: takes in sign-in credentials returns valid user + sets user in cookies
  @Mutation(() => UserResponse)
  async login(
    @Arg("credentials")
    { username, password }: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: username });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: `"${username}" does not exist`,
          },
        ],
      };
    }

    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }
}
