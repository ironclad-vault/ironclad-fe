import InfoBox from "../../_components/InfoBox";

export default function DepositInfoPanel() {
  return (
    <div className="space-y-8">
      <InfoBox title="THRESHOLD ECDSA">
        <p className="body-brutal mb-4">
          When you deposit BTC to create a new vault, your private keys are
          secured using a threshold ECDSA scheme with multiple key shards
          distributed across the Internet Computer.
        </p>
        <p className="body-brutal">
          This ensures that no single party has complete control over your
          Bitcoin, providing maximum security while still enabling timely
          withdrawals when needed.
        </p>
      </InfoBox>

      <InfoBox title="DEPOSIT WARNING (UTXO)">
        <p className="body-brutal mb-4">
          Bitcoin deposits require network confirmations to be fully secured in
          your vault. After sending BTC to the address, you&apos;ll need to wait
          for blockchain confirmations.
        </p>
        <p className="body-brutal">
          The vault creation process typically takes approximately 30-60
          minutes, depending on network congestion and confirmation
          requirements.
        </p>
      </InfoBox>

      <InfoBox
        title="MOCK PRINCIPAL ID"
        value="2vxsx-paeaaa-caaaa-aaaaa-q"
        isMono={true}
      >
        <p className="body-brutal mt-4">
          This identifier represents your account on the Internet Computer
          blockchain. Your vault access is tied to this principal ID and can be
          recovered through your identity agent or recovery method.
        </p>
      </InfoBox>
    </div>
  );
}
