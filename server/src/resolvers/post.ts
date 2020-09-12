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
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "src/types/MyContext";
import { getConnection } from "typeorm";
import { isAuth } from "src/middleware/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}
@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  async post(
    // "id" argument used in SDL like so {post(id:arg){...}}
    @Arg("id", () => Int) id: number // <-- the id here is what we use in source
  ): Promise<Post | undefined> {
    return await Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
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
