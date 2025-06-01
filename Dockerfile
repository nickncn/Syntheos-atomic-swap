FROM rust:1.70

RUN apt-get update && apt-get install -y pkg-config libssl-dev libudev-dev npm
RUN npm install -g @coral-xyz/anchor-cli
RUN curl -sSfL https://release.solana.com/stable/install | sh -s -- -y

ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

WORKDIR /work
