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
import { getConnection, getConnectionOptions } from "typeorm";

import { Post } from "../entities/Post";
import { MyContext } from "../types/MyContext";
import { isAuth } from "../middleware/isAuth";
import { Vote } from "../entities/Vote";
import { User } from "../entities/User";

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

  @FieldResolver(() => User)
  creator(@Root() post: Post) {
    return User.findOne(post.creatorId);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    // console.log({ posts: req.session });

    const { userId } = req.session;
    const realLimit = Math.min(50, limit);
    const reaLimitPlusOne = realLimit + 1;
    const cursorDate = cursor ? new Date(parseInt(cursor)) : null;

    const posts = await getConnection().query(
      `
        select p.*,
        ${
          req.session.userId
            ? `(select value from vote where "userId" = ${userId} and "postId" = p.id) "voteStatus"`
            : `null as "voteStatus"`
        }
        from post p
        ${cursor ? `where p."createdAt" < ${cursorDate}` : ""}
        order by p."createdAt" DESC
        limit ${reaLimitPlusOne}
      `
    );

    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder("p")
    //   .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
    //   .orderBy('p."createdAt"', "DESC");

    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    // const posts = await qb.take(reaLimitPlusOne).getMany();
    // console.log("posts: ", posts);

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === reaLimitPlusOne,
    };
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
    console.log({ test: req.session.userId });
    return Post.create({
      ...content,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String) title: string,
    @Arg("text", () => String) text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    // const post = await Post.findOne({ id, creatorId: req.session.userId });

    // if (!post) return null;

    // await Post.update({ id }, { title, text });
    // return post;

    // This method allows us to return the updated post
    const results = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id=:id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();
    console.log(results.raw[0]);

    return results.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await Post.findOne(id);
    if (!post) return false;
    if (post.creatorId !== req.session.userId) return false;

    // await Vote.delete();
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    try {
      const { userId } = req.session;
      const checkVote = await Vote.findOne({ where: { postId, userId } });

      // user has voted on post before && user is changing their vote
      if (checkVote && checkVote.value !== value) {
        await getConnection().transaction(async (trxManager) => {
          await trxManager.query(
            `
              update vote
              set value = ${value}
              where "userId" = ${userId} and "postId" = ${postId}  
            `
          );
          // For the second query call to update the post points
          // need to actually -2/+2 to reach desired upvote/downvote status
          // -1/+1 would just nullify user vote by making it a zero
          // since its the opposite value of their original vote
          await trxManager.query(
            `
              update post 
              set points = points + ${2 * value}
              where id = ${postId};
            `
          );
        });
      } else if (!checkVote) {
        // first time voting
        await getConnection().transaction(async (trxManager) => {
          await trxManager.query(
            `
              insert into vote ("userId", "postId", value)
              values (${userId}, ${postId}, ${value});
            `
          );
          await trxManager.query(
            `
              update post 
              set points = points + ${value}
              where id = ${postId};
            `
          );
        });
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}
