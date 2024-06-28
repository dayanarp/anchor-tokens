import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Tokens } from "../target/types/tokens";
import { Keypair, PublicKey } from '@solana/web3.js';

describe("Token Test", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Tokens as Program<Tokens>;

   // Generate new keypair to use as address for mint account.
   const mintKp = new Keypair();

   // Generate new keypair to use as address for recipient wallet.
   const tokenAccountKp = new Keypair();

   const alice = new PublicKey(
    "AivDNg7fdxHzotN8sMMXMVULTdfuYhfq5PKCoVWCx3Tg"
  );
   // Generate new keypair to use as address for recipient wallet.
   const recipientTokenAccountKp = new Keypair();

  it("Creates a new Token", async () => {
    // Add your test here.
    const tx = await program.methods.createToken().accounts({
        payer: provider.wallet.publicKey,
        mintAccount: mintKp.publicKey,
    })
    .signers([mintKp])
    .rpc();
    console.log('Success!');
    console.log(`   Mint Address: ${mintKp.publicKey}`);
  });

  it('Mint tokens!', async () => {
    // Amount of tokens to mint.
    const amount = new anchor.BN(100);

    // Mint the tokens to the associated token account.
    const transactionSignature = await program.methods
      .mintToken(amount)
      .accounts({
        mintAuthority: provider.wallet.publicKey,
        recipient: provider.wallet.publicKey,
        mintAccount: mintKp.publicKey,
        tokenAccount: tokenAccountKp.publicKey,
      })
      .signers([tokenAccountKp])
      .rpc();

    console.log('Success!');
    console.log(`   Token Account Address: ${tokenAccountKp.publicKey}`);
    console.log(`   Transaction Signature: ${transactionSignature}`);
  });

  it('Transfer tokens!', async () => {
    // Amount of tokens to transfer.
    const amount = new anchor.BN(50);

    const transactionSignature = await program.methods
      .transferTokens(amount)
      .accounts({
        sender: provider.wallet.publicKey,
        recipient: alice,
        mintAccount: mintKp.publicKey,
        senderTokenAccount: tokenAccountKp.publicKey,
        recipientTokenAccount: recipientTokenAccountKp.publicKey,
      })
      .signers([recipientTokenAccountKp])
      .rpc();

    console.log('Success!');
    console.log(`   Transaction Signature: ${transactionSignature}`);
  });

});
