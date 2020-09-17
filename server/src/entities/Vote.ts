import { ObjectType, Field } from "type-graphql";
import { Entity, Column, BaseEntity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class Vote extends BaseEntity {
  @Field()
  @Column({ type: "int", default: 0 })
  value: number;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field()
  @PrimaryColumn()
  postId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.upvotes)
  user: User;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.id)
  post: Post;
}
