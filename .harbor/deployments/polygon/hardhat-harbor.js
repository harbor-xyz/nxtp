
require("hardhat/config");
require("hardhat/builtin-tasks/task-names");
module.exports = task("custom").setAction(async (args, hre, runSuper) => {
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  let { exec } = require("child_process");
  const server = await hre.run("node", {
    launch: true,
	hostname: "0.0.0.0",
    port: 4004,
	tags: "local",
  });
  console.log("OUTSIDE SERVER");
  console.log(server._anvil);

  server._server._anvil.on("spawn", async (data) => {
    await sleep(2000);
    exec("npx hardhat deploy --reset", async (data) => {

      console.log("RUNNING DEPLOY");
      console.log(data);
    });
  });
  await server.waitUntilClosed();
});

