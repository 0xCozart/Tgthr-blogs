import {
  Resolver,
  Query,
  Arg,
  Int,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  FieldResolver,
  Root,
} from "type-graphql";
import { getConnection } from "typeorm";

import { Post } from "../entities/Post";
import { MyContext } from "../types/MyContext";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}
@Resolver(Post)
export class PostResolver {
  @Query(() => Post, { nullable: true })
  async post(
    // "id" argument used in SDL like so {post(id:arg){...}}
    @Arg("id", () => Int) id: number // <-- the id here is what we use in source
  ): Promise<Post | undefined> {
    return await Post.findOne(id);
  }

  /* ---------------------TODO---------------------------
   * Create a regex util to properly parse through and end
   * on a word, followed by elispses.
   *
   * slice method will do for now
   */
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Query(() => [Post])
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, {
      nullable: true,
    })
    cursor: string | null
  ): Promise<Post[]> {
    const realLimit = Math.min(50, limit);
    const queryBuilder = getConnection()
      .getRepository(Post)
      .createQueryBuilder("post")
      // need to wrap in double quotes to keep string exact
      .orderBy('"createdAt"', "DESC")
      .take(realLimit);

    if (cursor)
      queryBuilder.where('"createdAt" > :cursor', {
        cursor: new Date(parseInt(cursor)),
      });

    // executes SQL
    return queryBuilder.getMany();
  }

  @Mutation(() => Post)
  @UseMiddleware([isAuth])
  async createPost(
    @Arg("content") content: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    /*
     * <Post.create({}).save()> : error.code 42601 might be caused by
     * my TZ on linux.
     */
    const newPost = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values({
        ...content,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return newPost.raw[0];
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);

    if (!post) return null;

    if (typeof title !== undefined) {
      await Post.update({ id }, { title });
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id", () => Int) id: number): Promise<Boolean> {
    await Post.delete(id);
    return true;
  }
}
