import Harbor from '@harbor-xyz/harbor';
import { expect } from "chai";
import { getLastCommit } from 'git-last-commit';

const harbor = new Harbor({
  userKey: "9S7NYNRjgy6Xaw5eSdaGqg",
  projectKey: "sJHqS5q4B2jb6TwDP6pHm5"
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
    console.log(testnetName);
    await harbor.authenticate();
    console.log("\n\n==========testnet==========");
    const testnet = await harbor.testnet("testnet-6102");
    console.log(testnet);
  });
});

