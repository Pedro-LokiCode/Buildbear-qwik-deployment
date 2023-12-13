import { component$, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { createSanboxAPI, deployWithMetamask, sandboxStatus } from "~/buildbear";

export default component$(() => {
  const buildbearStore = useStore<{
    sandboxId: string | null;
    forkedChainId: string | null;
    forkedChainStatus: string | null;
    faucetUrl: string | null;
    rpcUrl: string | null;
    explorerUrl: string | null;
  }>({
    sandboxId: null,
    forkedChainId: null,
    forkedChainStatus: null,
    faucetUrl: null,
    rpcUrl: null,
    explorerUrl: null,
  })


  return (
    <>
      <div>
        <button title="deploy"
          onClick$={async () => {
            deployWithMetamask(parseInt(buildbearStore.forkedChainId!));
          }}>Deploy</button>


        <button title="create-sandbox"
          onClick$={async () => {
            createSanboxAPI().then((res) => {
              buildbearStore.sandboxId = res.data.sandboxId;
              buildbearStore.forkedChainId = res.data.chainId;
            }).catch((err) => {
              console.log(err);
            })
          }}
        >Fork Ethereum</button>


        <button title="check-status"
          onClick$={async () => {
            sandboxStatus(buildbearStore.sandboxId!).then((res) => {
              buildbearStore.forkedChainStatus = res.data.status;
              buildbearStore.faucetUrl = res.data.faucetUrl;
              buildbearStore.rpcUrl = res.data.rpcUrl;
              buildbearStore.explorerUrl = res.data.explorerUrl;
            }).catch((err) => {
              console.log(err);
            });
          }}
        >Check status</button>

        <button title="add-network"
          onClick$={() => {
            window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x" + parseInt(buildbearStore.forkedChainId!).toString(16),
                  chainName: "Ethereum Fork",
                  rpcUrls: [buildbearStore.rpcUrl!],
                  blockExplorerUrls: [buildbearStore.explorerUrl!],
                },
              ],
            })
          }}
        >Add Network</button>
        <div id="status">
          <p>Forked chain id: {buildbearStore.forkedChainId}</p>
          <p>Sandbox id: {buildbearStore.sandboxId}</p>
          <p>Forked chain status: {buildbearStore.forkedChainStatus}</p>
          <p>Faucet url: {buildbearStore.faucetUrl}</p>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
