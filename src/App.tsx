import React, { useEffect, useState } from "react";
import "./App.css";
import Lottie from "lottie-react";
import spinnerAnimation from "./spinner.json";
import { Keplr } from "@keplr-wallet/types";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { grantGenericDelegate } from "./msgDefinitions";

const GRANTEE_ADDRESS = "osmo1jv65s3grqf6v6jl3dp4t6c9t9rk99cd80yhvld";

function App() {
  const [walletAddress, setWalletAddress] = useState<string>();
  const [client, setClient] = useState<SigningStargateClient>();
  useEffect(() => {
    // enable keplr for osmosis and store the offline signer and wallet address
    (async () => {
      if ("keplr" in window) {
        const keplr: Keplr = window.keplr as Keplr;
        // enable osmosis chain
        await keplr.enable("osmosis-1");

        const signer = await keplr.getOfflineSigner("osmosis-1");

        // store the offline signer so we can later sign the grant msg
        !client &&
          setClient(
            await SigningStargateClient.connectWithSigner(
              "https://rpc.cosmos.directory/osmosis",
              signer,
              {
                gasPrice: GasPrice.fromString("0.025uosmo"),
              }
            )
          );

        client &&
          !walletAddress &&
          setWalletAddress(
            await signer.getAccounts().then((as) => as[0].address)
          );
      } else {
        alert("Please install keplr extension");
      }
    })();
  }, [client, walletAddress]);

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ height: "300px", width: "300px" }}>
          <Lottie animationData={spinnerAnimation} />
        </div>
        <div>{walletAddress}</div>
        <button
          onClick={() => {
            client &&
              walletAddress &&
              client
                .signAndBroadcast(
                  walletAddress,
                  [
                    grantGenericDelegate({
                      granter: walletAddress,
                      grantee: GRANTEE_ADDRESS,
                      // one year grant
                      duration: 3.15576e10,
                    }),
                  ],
                  "auto",
                  "authz grant demo"
                )
                .then((res) => {
                  alert(res?.transactionHash);
                  console.log(
                    `https://www.mintscan.io/osmosis/txs/${res?.transactionHash}`
                  );
                  return console.log(res);
                });
          }}
        >
          Create a grant
        </button>
      </header>
    </div>
  );
}

export default App;
