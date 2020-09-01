import { Resolver, Query, Ctx } from "type-graphql";
import { Post } from "src/entities/Posts";
import { MyContext } from "src/types";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  post(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }
}
