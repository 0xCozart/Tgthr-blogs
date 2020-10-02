import {
  Resolver,
  Mutation,
  Field,
  Arg,
  Ctx,
  ObjectType,
  Query,
  FieldResolver,
  Root,
} from "type-graphql";
import argon2 from "argon2";
import { v4 } from "uuid";

import { MyContext } from "../types/MyContext";
import { User } from "../entities/User";
import {
  COOKIE_NAME,
  FORGET_PASSWORD_PREFIX,
  THREE_DAYS,
  FORGOT_PASSWORD_URL,
} from "../constants";
import { UsernamePasswordInput } from "../types/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { getConnection } from "typeorm";

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

@Resolver(User)
export class UserResolver {
  // Me: returns currently signed in user or null
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    return User.findOne(req.session.userId);
  }

  // register: takes in credentials returns user...
  // + creates cookie with user.id...
  @Mutation(() => UserResponse)
  async register(
    @Arg("credentials")
    { username, password, email }: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister({ username, password, email });
    if (errors) return { errors };

    const hashedPassword = await argon2.hash(password);
    let user;

    try {
      /*
      * TypeORM Active Record pattern for inserting item into database
      * does not return the item since it only executes one query,
      * the ideal source would be something like this:
      
      const user = await User.create({
        username: username,
        email: email,
        password: hashedPassword,
      }).save();

      * adding a <.returning("*")> method would be an ideal method
      * as suggested here: https://github.com/typeorm/typeorm/issues/3490
      */
      const insertUserResult = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: username,
          email: email,
          password: hashedPassword,
        })
        .returning("*")
        .execute();

      user = insertUserResult.raw[0];
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
    req.session.userId = user?.id;
    return { user };
  }

  // login: takes in sign-in credentials => returns valid user + sets user in cookies
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail")
    usernameOrEmail: string,
    @Arg("password")
    password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    });

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
    @Ctx() { redis }: MyContext
  ) {
    // Specify {where:} when searching for an item that is not the primary key
    const user = await User.findOne({ where: { email } });
    // Will return true even if no user is found for security reasons
    if (!user) return true;

    const token = v4();
    const htmlLink = `<div><a href="${
      FORGOT_PASSWORD_URL + token
    }">reset password</a></div>`;

    // redis token expires in three days
    redis.set(FORGET_PASSWORD_PREFIX + token, user.id, "ex", THREE_DAYS);

    await sendEmail(email, htmlLink);

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
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

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
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

    // grabs user + screens if exists
    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);
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

    // updates password + pushes changes to postgresql
    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );
    // deletes token from redis
    await redis.del(key);
    // logs user in
    req.session.userId = user.id;
    // returns user object in grapql
    return { user };
  }

  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userId === user.id) return user.email;

    return "";
  }
}
