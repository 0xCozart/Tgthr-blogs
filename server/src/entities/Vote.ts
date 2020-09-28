import { Entity, Column, BaseEntity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
export class Vote extends BaseEntity {
  @Column({ type: "int", default: 0 })
  value: number;

  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => User, (user) => user.votes)
  user: User;

  @ManyToOne(() => Post, (post) => post.votes, { onDelete: "CASCADE" })
  post: Post;
}
