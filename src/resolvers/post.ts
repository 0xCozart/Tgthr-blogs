import { Resolver, Query, Ctx, Arg, ID, Int, Mutation } from "type-graphql";
import { Post } from "../entities/Posts";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  /*
    Passing <() => Int> in <@Arg> is redundant here since 
    type-graphql infers the type from TS's type decleration. 
    (but keeping for practice) 
    
    *** The above is only true with Strings and Int ***
  */

  @Query(() => Post, { nullable: true })
  post(
    // "id" argument used in SDL like so {post(id:arg){...}}
    @Arg("id", () => Int) id: number, // <-- the id here is what we use in source
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title", () => String) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updateTitlePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx()
    { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });

    if (!post) return null;

    if (typeof title !== undefined) {
      post.title = title;
      await em.persistAndFlush(post);
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx()
    { em }: MyContext
  ): Promise<Boolean> {
    try {
      await em.nativeDelete(Post, { id });

      return true;
    } catch (error) {
      return false;
    }
  }
}
