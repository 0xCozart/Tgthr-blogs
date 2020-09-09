import {
  Resolver,
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
import { COOKIE_NAME } from "../constants";
import { UsernamePasswordInput } from "../types/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";

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
    { username, password, email }: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // TODO wrapper validaror
    const errors = validateRegister({ username, password, email });
    if (errors) return { errors };

    const hashedPassword = await argon2.hash(password);
    const user = em.create(User, {
      username,
      email,
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

    // store user id session + sets user cookie + keeps user logged in
    req.session.userId = user.id;

    return { user };
  }

  // login: takes in sign-in credentials returns valid user + sets user in cookies
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail")
    usernameOrEmail: string,
    @Arg("password")
    password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );

    if (!user) {
      if (usernameOrEmail.includes("@")) {
        return {
          errors: [
            {
              field: "email",
              message: `"${usernameOrEmail}" does not exist`,
            },
          ],
        };
      } else {
        return {
          errors: [
            {
              field: "username",
              message: `"${usernameOrEmail}" does not exist`,
            },
          ],
        };
      }
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

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) => {
      req.session.destroy((error) => {
        res.clearCookie(COOKIE_NAME);
        if (error) {
          console.log(error);
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, req }: MyContext
  ) {
    // const user = await em.findOne(User, { email });
    return true;
  }
}
