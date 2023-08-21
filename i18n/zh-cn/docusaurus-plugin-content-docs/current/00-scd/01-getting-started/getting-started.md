---
title: 开始之前
sidebar_position: 2
slug: /getting-started/getting-started
hide_table_of_contents: true
---

在Gear上开发智能合约之前，您需要配置开发环境。

其中一种方式是使用 [Gitpod](https://www.gitpod.io/)。**Gitpod**是一个工具，允许开发人员通过单击一次启动为您的GitHub项目准备的可用于编码的开发环境。

## 使用Gitpod

1. 使用Gitpod的第一种方式：

- 在浏览器中，导航至您在GitHub或GitLab上的项目；
- 在浏览器的地址栏中，在整个URL前加上gitpod.io/#并按Enter键。这将创建一个云开发环境，并在VS code中打开一个工作空间；
 安装构建Rust智能合约所需的工具。Gitpod始终预安装了使用Rust编译器`rustup`的最新可用Rust工具链。让我们使用`rustup`安装一个夜间版本的工具链：

    ```
    rustup toolchain add nightly
    ```

    由于我们将把Rust智能合约编译为Wasm，因此我们需要一个Wasm编译器。让我们将其添加到工具链中：

    ```rustup target add wasm32-unknown-unknown --toolchain nightly```

    现在，Gitpod环境已准备好在Gear上开发智能合约。

2. 使用Gitpod的另一种方式是安装Gitpod扩展程序，该扩展程序可在Chrome和Firefox上使用：

    - [Chrome](https://chrome.google.com/webstore/detail/gitpod-always-ready-to-co/dodmmooeoklaejobgleioelladacbeki)
    - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/gitpod/)

    安装扩展程序后，任何git存储库上都会出现一个Gitpod按钮：

    ![Gitpod Button](/img/01/gitpod-button.png)

## 设置本地环境

对于本课程来说，macOS和Linux是最容易使用的操作系统。Windows可能会更具挑战性，但如果您愿意接受挑战，请随时使用您可以访问和熟悉的操作系统参加我们的课程。

1. Linux用户通常应根据其发行版的文档安装`GCC` `Clang`。

    例如，在Ubuntu上使用以下命令：

    ```
    sudo apt install -y build-essential clang cmake
    ```

    在macOS上，您可以通过运行以下命令来获取编译器工具集：

    ```
    xcode-select --install
    brew install cmake
    ```

2. 安装构建Rust智能合约所需的工具。我们将使`rustup` 来准备Rust编译器：

    ```
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```

    让我们使用`rustup`安装夜间版本的工具链和Wasm目标：

    ```
    rustup toolchain add nightly
    rustup target add wasm32-unknown-unknown --toolchain nightly
    ```
