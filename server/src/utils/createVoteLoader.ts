import DataLoader from "dataloader";
import { Vote } from "../entities/Vote";

// dataloader will take in vote object [{postId: number, userId: number}]
// returns {postId, userId, value}
const createVoteLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Vote | null>(
    async (keys) => {
      const votes = await Vote.findByIds(keys as any);
      const voteIdsToVote: Record<string, Vote> = {};

      votes.forEach((vote) => {
        voteIdsToVote[`${vote.userId}|${vote.postId}`] = vote;
      });

      return keys.map((key) => voteIdsToVote[`${key.userId}|${key.postId}`]);
    }
  );

export default createVoteLoader;
