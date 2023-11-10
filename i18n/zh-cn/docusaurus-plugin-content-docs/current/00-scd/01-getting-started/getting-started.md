---
title: 开启课程
sidebar_position: 2
slug: /getting-started/getting-started
hide_table_of_contents: true
---

这里有两种配置开发环境的方式。

## A. 使用 Gitpod

第一种方式是使用 [Gitpod](https://www.gitpod.io/)。 **Gitpod** 开发者仅需单击一个按钮便可启动已经就绪的 GitHub 项目的开发环境。

使用 Gitpod 配置编码环境有两种选项。

1. 选项 1

- 在浏览器中，导航到 GitHub 或 GitLab 上的项目；
- 在浏览器的地址栏中，加上整个 URL 的前缀 `gitpod.io/#`，然后按 <kbd>Enter</kbd> 键。这将创建一个云开发环境，并在 VS Code 中打开一个工作区；
- 安装构建 Rust 智能合约所需的工具。Gitpod 始终预安装了最新的 Rust 工具链，使用 Rust 编译器 `rustup`。让我们使用 `rustup`安装工具链的一个夜间版本：

    ```
    rustup toolchain add nightly
    ```

    我们需要一个 WebAssembly（Wasm）编译器来将 Rust 智能合约编译为 Wasm。让我们将它添加到工具链中：

    ```bash
    rustup target add wasm32-unknown-unknown --toolchain nightly
    ```

    现在，Gitpod 环境已准备好用于 Gear 上的智能合约开发。

2. 使用 Gitpod 另一种开始的方式是安装 Chrome 和 Firefox 上可用的 Gitpod 扩展：

    - [Chrome](https://chrome.google.com/webstore/detail/gitpod-always-ready-to-co/dodmmooeoklaejobgleioelladacbeki)
    - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/gitpod/)

    安装扩展后，任何 Git 存储库上都会显示 Gitpod 按钮：

    ![Gitpod 按钮](/img/01/gitpod-button.png)

## B. 设置本地环境

macOS 和 Linux 是最适合学习本课程的用户友好操作系统。Windows 可能会带来更多困难，但你可以使用你熟悉的任何操作系统。

1. Linux 用户通常应根据其发行版的文档安装 GCC 和 Clang。


    例如，如果你使用 Ubuntu：

    ```
    sudo apt install -y build-essential clang cmake
    ```

    在 macOS 上，你可以通过运行以下命令来获取编译器工具集：

    ```
    xcode-select --install
    brew install cmake
    ```

2. 安装构建 Rust 智能合约所需的工具。我们将使用 `rustup` 来准备 Rust 编译器：

    ```
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```

    让我们使用 `rustup` 安装工具链的一个夜间版本和一个 Wasm 目标：

    ```bash
    rustup toolchain add nightly
    rustup target add wasm32-unknown-unknown --toolchain nightly
    ```

  现在你可以完成你的环境配置。
