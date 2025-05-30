// build.rs

fn main() {
    println!("cargo:rustc-cfg=custom_getrandom");
}
