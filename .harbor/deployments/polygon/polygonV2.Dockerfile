
FROM 988772184836.dkr.ecr.us-east-1.amazonaws.com/base-v2:latest

WORKDIR /app

COPY hardhat.config.* /app

COPY health-check.js health-check.js
COPY deployment-package/ /app/

ENV TS_NODE_TRANSPILE_ONLY=1
COPY imports imports
COPY afterDeploy/ afterDeploy/
COPY hardhat-harbor.js hardhat-harbor.js

EXPOSE 8545
EXPOSE 4004

CMD ["npx", "hardhat", "custom"]

