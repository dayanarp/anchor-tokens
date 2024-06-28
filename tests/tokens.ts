import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Tokens } from "../target/types/tokens";
import { Keypair, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

describe("Token Test", () => {
  // Configura el Cliente al cluster local.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // programa
  const program = anchor.workspace.Tokens as Program<Tokens>;

  // Generamos una keypair nueva para usar como address del nuevo Token.
  const mintKp = new Keypair();
  // Definimos una public key de una wallet existente.
  const recipient = new PublicKey(
    "AivDNg7fdxHzotN8sMMXMVULTdfuYhfq5PKCoVWCx3Tg"
  );

  // Generamos una keypair nueva para usar como address de la
  // wallet del recipiente.
  //const recipient = new Keypair();

  let senderATA: PublicKey;
  let recipientATA: PublicKey;

  before(async () => {
    // Derivamos la dirección del associated token account de nuestra wallet y el nuevo Token.
    senderATA = getAssociatedTokenAddressSync(mintKp.publicKey, provider.wallet.publicKey);

    // Derivamos la dirección del associated token account del recipiente y el nuevo Token.
    recipientATA = getAssociatedTokenAddressSync(mintKp.publicKey, recipient);
  });

  // TEST
  // ----------------------- Create New Token -------------------------//
  it("Creates a new Token", async () => {
    const tx = await program.methods.createToken().accounts({
        payer: provider.wallet.publicKey, // nuestra wallet
        mintAccount: mintKp.publicKey, // dirección del nuevo Token
    })
    .signers([mintKp])
    .rpc();
    console.log('Success!');
    console.log(`Mint Address: ${mintKp.publicKey}`);
    console.log(`Transaction Signature: ${tx}`);
  });

  // ----------------------- Mint 10 Tokens -------------------------//
  it('Mint 10 Tokens', async () => {
    const amount = new anchor.BN(10); // Numero de tokens a mintear
    const tx = await program.methods
      .mintToken(amount)
      .accounts({
        mintAuthority: provider.wallet.publicKey, // autoridad del Token
        recipient: provider.wallet.publicKey, // wallet de quien recibe el mint
        mintAccount: mintKp.publicKey, // dirección del Token
        associatedTokenAccount: senderATA, // Token Account donde se recibirán los tokens
      })
      .rpc();
    console.log('Success!');
    console.log(`Token Account Address: ${senderATA}`);
    console.log(`Transaction Signature: ${tx}`);
  });

  // ----------------------- Transferir 4 Tokens -------------------------//
  it('Transfer tokens!', async () => {
    const amount = new anchor.BN(4); // Numero de tokens a transferir
    const tx = await program.methods
      .transferTokens(amount)
      .accounts({
        sender: provider.wallet.publicKey, // wallet de quien envía
        recipient: recipient, // wallet del recipiente
        mintAccount: mintKp.publicKey, // dirección del token
        senderAta: senderATA, // Token Account de quien envía
        recipientAta: recipientATA, // Token Account de quien recibe
      })
      .rpc();
    console.log('Success!');
    console.log(`Transaction Signature: ${tx}`);
  });

});
