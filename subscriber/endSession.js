const {
  Client,
  PrivateKey,
  AccountId,
  ContractExecuteTransaction,
  ContractCallQuery,
  AccountCreateTransaction,
  ContractFunctionParameters,
  TokenAssociateTransaction,
  Hbar,
} = require("@hashgraph/sdk");

const sessions = require("./sessions.json");
const config = require("../config.json");

const endSession = async (req, res) => {

  const { energy, sessionId } = req.body;
//   const sessionId = sessions.sessions[sessions.sessions.length - 1];

  const adapterAccountId = AccountId.fromString(config.AdapterID);
  const operatorKey = PrivateKey.fromStringECDSA(config.AdapterPrivateKey);
  const contractId = config.CHAdapterContract;

  const client = Client.forTestnet();
  client.setOperator(adapterAccountId, operatorKey);

   console.log(sessionId)

  const endSessionTx = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(500000)
    .setFunction(
      "endSession",
      new ContractFunctionParameters()
        .addString(sessionId)
        .addInt64(energy)
        .addInt64(1)
    )
    .execute(client);

  const endSessionReceipt = await endSessionTx.getReceipt(client);
  console.log("Session End Status:", endSessionReceipt.status.toString());

  const distributeRewardsTx = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(500000)
    .setFunction(
      "distributeRewards",
      new ContractFunctionParameters().addString(sessionId)
    )
    .execute(client);

  const distributeRewardsReceipt = await distributeRewardsTx.getReceipt(client);
  console.log(
    "Rewards Distribution Status:",
    distributeRewardsReceipt.status.toString()
  );

  res.json({ message: "Session Ended and Distributed Rewards" });
};

module.exports = { endSession };
