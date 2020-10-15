# Tgthr

### [tgthr.world](https://tgthr.world)

### A social media platform centered around minting user created content into NFT. 


The overarching idea of Tgthr is to create a market for social media content to incentivise the creation of high quality content from low quality content.

---
## Ethereum Stack 
- ### ERC1155 Standard for minting content
  - Allows for batch transactions
  - Transmutation of fungible tokens to non-fungible.
  - Can be deployed in a single contract for infinite token types.
  - Contract ABI has ```onERC1155Receieved``` for on receieve triggers.
  - Possible defering of metadata to a URI which can stored on IPFS
  - Deeper data analytics in regard to mints, burns, transfers, approvals, and metadata changes. 
  - Actual conent will ben held on IPFS or 3box with the token being the pointer...
- ### The Graph
  - Looking for quality subgraphs for querying on-chain data
---
### Languages/Environment
- Typescript
- Node.js
- GraphQl
- Docker

### Frontend
- React
- Next.js
- Apollo-Client

### Backend
- Express
- Apollo
- PostgreSQL
- Redis
- TypeORM
