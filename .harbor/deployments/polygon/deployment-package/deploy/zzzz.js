const { gql, GraphQLClient } = require("graphql-request");
const dotenv = require("dotenv");
dotenv.config();

const instertContractAddress = gql`
    mutation MyMutation($data:[testnet_chain_smart_contract_insert_input!]!) {
        insert_testnet_chain_smart_contract(objects: $data) {
        affected_rows
        returning {
            id
        }
    }
  }
`;

const deleteContractAddress = gql`
    mutation MyMutation($id: uuid, $chain: chains_enum) {
        delete_testnet_chain_smart_contract(where: {testnet_id: {_eq: $id}, _and: {chain: {_eq: $chain}}}) {
        affected_rows
       }
    }
`;

const func = async function (hre) {
    const { deployments } = hre;
    const data = await deployments.all();

    const arr = Object.keys(data);


    if (!arr.length) {
        console.log('No contartcs are there to deploy..!');
        return;
    }

    console.log('Contracts deployed..!');

    const graphQLClient = new GraphQLClient(process.env.HASURA_API_URL, {
        headers: {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET,
        },
    });

    try {
        const res = await graphQLClient.request(deleteContractAddress, {
            id: process.env.HARBOR_TESTNET_ID,
            chain: process.env.HARBOR_CONFIG_CHAIN_NAME
        });

        const insertData = arr.map((element, index) => {            
            return {
                contract_name: arr[index],
                contract_address: data[arr[index]]["address"],
                abi: data[arr[index]]["abi"],
                testnet_id:process.env.HARBOR_TESTNET_ID,
                chain: process.env.HARBOR_CONFIG_CHAIN_NAME
            };
        });

        const responseData = await graphQLClient.request(instertContractAddress, {
            data: insertData,
        });
    } catch (e) {
        console.log(e);
    }
}

module.exports = func;
func.tags = ['local']