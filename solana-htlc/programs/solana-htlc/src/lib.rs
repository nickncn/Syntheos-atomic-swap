#[cfg(custom_getrandom)]
#[allow(non_snake_case)]
#[no_mangle]
pub extern "C" fn __getrandom(dest: *mut u8, len: usize, _flags: u32) -> i32 {
    unsafe {
        let slice = core::slice::from_raw_parts_mut(dest, len);
        for b in slice.iter_mut() {
            *b = 0; // deterministic zero bytes instead of random
        }
    }
    0 // 0 for success
}

use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkgGYiD3eE3rv");

#[program]
pub mod solana_htlc {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
