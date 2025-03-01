const {
  Client,
  PrivateKey,
  AccountId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
} = require("@hashgraph/sdk");

const config = require("../config.json");
const fs = require("fs");
const path = require("path");

const startSession = async (req, res) => {
  const adapterAccountId = AccountId.fromString(config.AdapterID);
  const userAccountId = AccountId.fromString(config.UserWallet);
  const operatorKey = PrivateKey.fromStringECDSA(config.AdapterPrivateKey);
  const contractId = config.CHAdapterContract;

  const client = Client.forTestnet();
  client.setOperator(adapterAccountId, operatorKey);

  const startSessionTx = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(500000)
    .setFunction(
      "startSession",
      new ContractFunctionParameters()
        .addAddress(userAccountId.toSolidityAddress())
        .addString("Test Location")
    )
    .execute(client);

  const startSessionReceipt = await startSessionTx.getReceipt(client);
  console.log("Session Start Status:", startSessionReceipt.status.toString());

  const startSessionRecord = await startSessionTx.getRecord(client);
  const sessionId = startSessionRecord.contractFunctionResult.getString(0);
  console.log("Generated Session ID:", sessionId);
  const filePath = path.join(__dirname, "sessions.json");

  updateSessionsFile(filePath, sessionId);

  res.json({ message: "Session Created and Started", sessionId:sessionId });
};

const updateSessionsFile = (filePath, sessionid) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify({ sessions: [] }, null, 2),
      "utf8"
    );
  }
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
    }

    if (!Array.isArray(jsonData.sessions)) {
      jsonData.sessions = [];
    }

    jsonData.sessions.push(sessionid);

    fs.writeFile(
      filePath,
      JSON.stringify(jsonData, null, 2),
      "utf8",
      (writeErr) => {
        if (writeErr) {
          console.error("Error writing file:", writeErr);
        }
      }
    );
  });
};
module.exports = { startSession };
