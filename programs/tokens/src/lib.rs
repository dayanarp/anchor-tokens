use anchor_lang::prelude::*;
use anchor_spl::token::*;
use anchor_spl::associated_token::*;

declare_id!("88BwGU74Yno9PQQVPZUQ3S93U6fGGjFKnpLfUxKDxKJf");

#[program]
pub mod tokens {
    use super::*;
    // Instrucción para crear un nuevo Token (Mint Account)
    pub fn create_token(ctx: Context<CreateToken>) -> Result<()> {
        msg!("Token {} created!", ctx.accounts.mint_account.key());
        Ok(())
    }

     // Instrucción para crear (mint) <amount> unidades nuevas de un Token 
     // específico en un Token Account
    pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        // Invoca la instrucción mint_to del token program
        mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(), // token program
                MintTo {
                    mint: ctx.accounts.mint_account.to_account_info(), // mint
                    to: ctx.accounts.associated_token_account.to_account_info(), // associated token account
                    authority: ctx.accounts.mint_authority.to_account_info(), // mint authority
                },
            ),
            // Calcula la cantidad final de tokens a mintear segín los decimales del token 
            amount * 10u64.pow(ctx.accounts.mint_account.decimals as u32),
        )?;
    
        msg!("Token minted successfully.");
        Ok(())
    }

    // Instrucción para trnasferir <amount> tokens desde un Token Account a otro
    pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
        // Invoca la instrucción transfer del token program
        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(), // token program
                Transfer {
                    from: ctx.accounts.sender_ata.to_account_info(), // associated token account que envía
                    to: ctx.accounts.recipient_ata.to_account_info(), // associated token account que recibe
                    authority: ctx.accounts.sender.to_account_info(), // wallet de quien envía
                },
            ),
            // Calcula la cantidad final de tokens a mintear segín los decimales del token 
            amount * 10u64.pow(ctx.accounts.mint_account.decimals as u32), 
        )?;
    
        msg!("Tokens transferred successfully.");
        Ok(())
    }
}


//--------------------------------- Contextos -----------------------------------// 

// Contexto para crear un nuevo Token
#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>, // cuenta que tienen la autoridad sobre el token

    #[account(
        init,
        payer = payer,
        mint::decimals = 9,
        mint::authority = payer.key(),
        mint::freeze_authority = payer.key(),
    )]
    pub mint_account: Account<'info, Mint>, // Mint Account

    pub token_program: Program<'info, Token>, // Token Program
    pub system_program: Program<'info, System>, // Sysytem Program
    pub rent: Sysvar<'info, Rent>, // Renta
}

// Contexto para crear nuevas unidades de un Token
// específico (mintear)
#[derive(Accounts)]
#[instruction(amount:u64)]
pub struct MintToken<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>, // autoridad sobre el token

    pub recipient: SystemAccount<'info>, // wallet del recipiente
    #[account(mut)]
    pub mint_account: Account<'info, Mint>, // Mint Account

    #[account(
        init_if_needed, // crea la cuenta si aún no existe
        payer = mint_authority, 
        associated_token::mint = mint_account, // token que se recibe la cuenta
        associated_token::authority = recipient, // wallet del recipiente será autoridad del token account
    )]
    pub associated_token_account: Account<'info, TokenAccount>, // Token Account del recipiente

    pub token_program: Program<'info, Token>, // Token Program
    pub associated_token_program: Program<'info, AssociatedToken>, // Token Program
    pub system_program: Program<'info, System>, // System Program
}

// Contexto para transferir tokens desde un
// Token Account a otro
#[derive(Accounts)]
#[instruction(amount:u64)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub sender: Signer<'info>, // wallet de quien envía 
    pub recipient: SystemAccount<'info>, // wallet del recipiente

    #[account(mut)]
    pub mint_account: Account<'info, Mint>, // Mint Account
    #[account(mut)]
    pub sender_ata: Account<'info, TokenAccount>, // Token Account de quien envía

    #[account(
        init_if_needed, // crea la cienta si aún no existe
        payer = sender, // quien envía corre con los gastos de ser necesario
        associated_token::mint = mint_account, // token que recibe la cuenta
        associated_token::authority = recipient, // la autoridad del token account sera la wallet del recipiente
    )]
    pub recipient_ata: Account<'info, TokenAccount>, // Token Account del recipiente

    pub token_program: Program<'info, Token>, // Token Program
    pub associated_token_program: Program<'info, AssociatedToken>, // Token Program
    pub system_program: Program<'info, System>, // System Program
}