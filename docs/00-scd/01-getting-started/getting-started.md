---
title: Getting started
sidebar_position: 2
slug: /getting-started/getting-started
hide_table_of_contents: true
---

There are two ways you can configure your development environment.

## A. Using Gitpod

The first is to use [Gitpod](https://www.gitpod.io/). **Gitpod** allows developers to launch ready-to-code development environments for their GitHub projects with a single click.

You have two options when setting up your coding environment with Gitpod.

1. Here's the first option:

- In a browser, navigate to your project in GitHub or GitLab;
- In the browser's address bar, prefix the entire URL with `gitpod.io/#` and press <kbd>Enter</kbd>. It will create a cloud development environment and open up a workspace in VS code;
- Install the tools required to build smart contracts in Rust. Gitpod always comes with the latest Rust toolchain pre-installed using Rust compiler `rustup`. Let's install a nightly version of the toolchain with `rustup`:

    ```
    rustup toolchain add nightly
    ```

    We'll need a Wasm compiler to compile our Rust smart contract to Wasm. Let's add it to the toolchain:

    ```bash
    rustup target add wasm32-unknown-unknown --toolchain nightly
    ```

    Now, the Gitpod environment is ready for smart contract development on Gear.

2. Another way to get started with Gitpod is by installing the Gitpod extension available on Chrome and Firefox:

    - [Chrome](https://chrome.google.com/webstore/detail/gitpod-always-ready-to-co/dodmmooeoklaejobgleioelladacbeki)
    - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/gitpod/)

    Once you have the extension installed, a Gitpod button will show up on any Git repos:

    ![Gitpod Button](/img/01/gitpod-button.png)

## B. Setting up the local environment

macOS and Linux are the most user-friendly operating systems for this course. While Windows might pose more difficulties, you can use any operating system you're comfortable with.

1. Linux users should generally install `GCC` and `Clang` according to their distribution documentation.

    For example, if you're using Ubuntu:

    ```
    sudo apt install -y build-essential clang cmake
    ```

    On macOS, you can get a compiler toolset by running:

    ```
    xcode-select --install
    brew install cmake
    ```

2. Install the tools required to build smart contracts in Rust. We'll use `rustup` to get the Rust compiler ready:

    ```
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```

    Let's install a nightly version of the toolchain and a Wasm target with `rustup`:

    ```bash
    rustup toolchain add nightly
    rustup target add wasm32-unknown-unknown --toolchain nightly
    ```

  You can now complete your environment configuration.
