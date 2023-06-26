---
title: Getting started
sidebar_position: 2
---

Before you start developing a smart contract on Gear, you have to configure the development environment.

One of the ways is to use [Gitpod](https://www.gitpod.io/). **Gitpod** is a tool allowing developers to launch ready-to-code development environments for their GitHub projects with a single click.

## Using Gitpod

1. The first option to use Gitpod:

- In a browser, navigate to your project in GitHub or GitLab;
- In the browser’s address bar, prefix the entire URL with `gitpod.io/#` and press <kbd>Enter</kbd>. It will create a cloud development environment and open up a workspace in VS code;
- Install the tools required to build smart contracts in Rust. Gitpod always comes with the latest available Rust toolchain pre-installed using Rust compiler `rustup`. Let’s install a nightly version of the toolchain with `rustup`:

    ```
    rustup toolchain add nightly
    ```

    As we will be compiling our Rust smart contract to Wasm, we will need a Wasm compiler. Let’s add it to the toolchain:

    ```bash
    rustup target add wasm32-unknown-unknown --toolchain nightly
    ```

    Now the Gitpod environment is ready for the development of smart contracts on Gear.

2. Another way to get started with Gitpod is by installing the Gitpod extension which is available on Chrome and Firefox:

    - [Chrome](https://chrome.google.com/webstore/detail/gitpod-always-ready-to-co/dodmmooeoklaejobgleioelladacbeki)
    - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/gitpod/)

    Once you have the extension installed, a Gitpod button will show up on any git repos:

    ![Gitpod Button](/img/01/gitpod-button.png)

## Setting up the local environment

For this course, macOS and Linux will be the easiest operating systems to use. Windows may be more challenging, however, if you’re ok with that, please feel free to join us using whatever operating system that you have access to and are comfortable with.

1. Linux users should generally install `GCC` and `Clang`, according to their distribution’s documentation.

    For example, on Ubuntu use:

    ```
    sudo apt install -y build-essential clang cmake
    ```

    On macOS, you can get a compiler toolset by running:

    ```
    xcode-select --install
    brew install cmake
    ```

2. Install the tools required to build smart contracts in Rust. `rustup` will be used to get Rust compiler ready:

    ```
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```

    Let’s install a nightly version of the toolchain and a Wasm target with `rustup`:

    ```bash
    rustup toolchain add nightly
    rustup target add wasm32-unknown-unknown --toolchain nightly
    ```
