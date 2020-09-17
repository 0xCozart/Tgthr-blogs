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
  ObjectType,
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

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
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
   * Create a regex util to properly parse and cut at a word,
   * then followed by elispses.
   *
   * slice will do for now
   */
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, {
      nullable: true,
    })
    cursor: string | null
  ): Promise<PaginatedPosts> {
    // Not optimal for further feature extension,
    // currently using it to solve pagination problem
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) replacements.push(new Date(parseInt(cursor)));

    // const posts = await getConnection().query(
    //   `
    //   select p.*,
    //   json_build_object('id', creator.id, 'username', creator.username, 'email', creator.email) creator
    //   from post post
    //   inner join public.user on user.id = post."creatorId"
    //   ${cursor ? `where post."createdAt" < $2` : ""}
    //   order by post."createdAt" DESC
    //   limit $1
    //   `,
    //   replacements
    // );

    const queryBuilder = getConnection()
      .getRepository(Post)
      .createQueryBuilder("post")
      // Creates a
      .innerJoinAndSelect("post.creator", "user", 'user.id = post."creatorId"')
      // need to wrap in double quotes to keep string exact
      .orderBy("post.createdAt", "DESC")
      .take(realLimitPlusOne);

    if (cursor)
      queryBuilder.where("post.'createdAt' < :cursor", {
        cursor: new Date(parseInt(cursor)),
      });

    const posts = await queryBuilder.getMany();

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
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

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: 1 | -1,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;
    // try {
    // await getConnection().transaction(async (tm) => {
    //   tm.query(
    //     `
    // from post
    // update post
    // set post.points = post.points + $1
    // where p.id = $2`,
    //     [value, postId]
    //   );
    // });
    try {
      await getConnection().createQueryBuilder().
      return true;
    } catch(error) {
      console.log('vote error:', error);
      return false
    }

    // } catch (error) {
    //   console.log("vote error:", error);
    //   return false;
    // }
  }
}
