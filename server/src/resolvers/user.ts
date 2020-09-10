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
import { v4 } from "uuid";
import { EntityManager } from "@mikro-orm/postgresql";

import { MyContext } from "../types/MyContext";
import { User } from "../entities/User";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX, THREE_DAYS } from "../constants";
import { UsernamePasswordInput } from "../types/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { passwordLengthVerify } from "src/utils/passwordLengthVerify";

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
    let user;

    try {
      /* 
      Used KnexQueryBuilder since 2 or more succesive MikroROM error calls
      to PSQL server causes MikroORM lifecycle error.

      this method --> await em.persistAndFlush();

      might raise issue
      */
      const results = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username,
          email,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");

      user = results[0];
    } catch (error) {
      // duplicate username/email error handling
      if (error.code == "23505") {
        if (error.detail.includes("(email)")) {
          return {
            errors: [
              { field: "email", message: "email is already registered" },
            ],
          };
        }
        return {
          errors: [{ field: "username", message: "username already exists" }],
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
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: `"${usernameOrEmail}" does not exist`,
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
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email });
    // Will return true even if no user is found for security reasons
    if (!user) return true;

    const token = v4();
    const htmlLink = `<div><a href="http://localhost:3000/change-password/${token}">reset password</a></div>`;

    // redis token expires in three days
    redis.set(FORGET_PASSWORD_PREFIX + token, user.id, "ex", THREE_DAYS);

    sendEmail(email, htmlLink);

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, em, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2)
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2",
          },
        ],
      };

    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const user = await em.findOne(User, { id: parseInt(userId) });

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user does not exist",
          },
        ],
      };
    }

    user.password = await argon2.hash(newPassword);

    await em.persistAndFlush(user);

    req.session.userId = user.id;

    return { user };
  }
}
