#[cfg(custom_getrandom)]
pub mod custom_getrandom {
    use core::ptr;

    pub fn getrandom_inner(dest: &mut [u8]) -> Result<(), ()> {
        for b in dest.iter_mut() {
            *b = 0; // or any constant value, since randomness is unsupported
        }
        Ok(())
    }
}

#[cfg(custom_getrandom)]
pub use custom_getrandom::getrandom_inner;
