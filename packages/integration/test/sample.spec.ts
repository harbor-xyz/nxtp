import Harbor from '@harbor-xyz/harbor';
import { expect } from "chai";
import { getLastCommit } from 'git-last-commit';

const harbor = new Harbor({
  userKey: "66t1DdSLuFnoAuVccZEkoN",
  projectKey: "xkfSjdSLuFnoAuVccX7j22"
});

export default function getTestnetName(){
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

describe('sample', function() {
  it('add', async function() {
    let result = 7;
    expect(result).to.equal(7);
    let testnetName = await getTestnetName();
    await harbor.authenticate();
    console.log("\n\n==========testnet==========");
    if (typeof testnetName === 'string') {
      const testnet = await harbor.testnet(testnetName);
      console.log(testnet);
    }
  });
});

