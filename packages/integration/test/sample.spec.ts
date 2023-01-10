import Harbor from '@harbor-xyz/harbor';
import { expect } from "chai";
import { getLastCommit } from 'git-last-commit';

const harbor = new Harbor({
  userKey: "66t1DdSLuFnoAuVccZEkoN",
  projectKey: "xkfSjdSLuFnoAuVccX7j22"
});

export default function getTestnetName() {
  return new Promise((resolve, reject) => {
    getLastCommit((err, commit) => {
      if (err) {
        reject(err);
      } else {
        const testnetName = "sha-" + commit.hash.slice(0, 7);
        resolve(testnetName);
      }
    });
  });
}

describe('Harbor Test E2E', function () {

  it('Testnet Info', async function () {
    let testnetName = await getTestnetName();
    await harbor.authenticate();
    console.log("\n\n==========testnet==========");
    if (typeof testnetName === 'string') {
      const testnet = await harbor.testnet(testnetName);
      console.log(testnet);

      expect(testnet.status).to.equal("RUNNING");

      const chains = await testnet.chains();
      console.log(`\n\n==========chains(${chains.length})==========`);

      chains.forEach((chain) => {
        // console.log(chain)
        expect(chain.status).to.equal("RUNNING");
        console.log(`${chain.chain} - ${chain.id} - ${chain.status} - ${chain.endpoint}`);
        chain.accounts().then((accounts) => {
          console.log(`\n\n==========accounts==========`);
          accounts.forEach((account, idx) => {
            // console.log(account)
            console.log(`=========${chain.chain}-account-#${idx + 1}/${accounts.length}==========`);
            console.log(`${account.address}  - ${account.type} - ${JSON.stringify(account.balances)} - ${JSON.stringify(account.abi)}`);
          });
        }).catch((err) => {
          console.error(err);
        });
      })

      const offChainActors = await testnet.offChainActors();
      console.log(`\n\n==========offChainActors(${offChainActors.length})==========`);
      console.log(offChainActors)
      offChainActors.forEach(async (actor) => {
        expect(actor.status).to.equal("RUNNING");
        console.log(`${actor.name} - ${actor.status} - ${actor.ports()} - ${actor.endpoint}`);
        const logs = await actor.logs();
        console.log(`\n\n==========logs for actor ${actor.name}==========`);
        console.log(logs);
      });
    }
  });
});

