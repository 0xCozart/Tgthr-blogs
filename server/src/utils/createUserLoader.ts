import DataLoader from "dataloader";
import { User } from "../entities/User";

// Pass in array of keys/userId's
// returns array of queries from those keys
const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};
    users.forEach((user) => {
      userIdToUser[user.id] = user;
    });
    return userIds.map((userId) => userIdToUser[userId]);
  });

export default createUserLoader;
