---
title: 开始之前
sidebar_position: 2
---

在Gear上开发智能合约之前，您需要配置开发环境。

其中一种方式是使用 <a href="https://www.gitpod.io/" target="_new">Gitpod</a>。<b>Gitpod</b>是一个工具，允许开发人员通过单击一次启动为您的GitHub项目准备的可用于编码的开发环境。

## 使用Gitpod

1. 使用Gitpod的第一种方式：

<ul>
<li>在浏览器中，导航至您在GitHub或GitLab上的项目；</li>
<li>在浏览器的地址栏中，在整个URL前加上gitpod.io/#并按Enter键。这将创建一个云开发环境，并在VS code中打开一个工作空间；</li>
<li>安装构建Rust智能合约所需的工具。Gitpod始终预安装了使用Rust编译器<code>rustup</code>的最新可用Rust工具链。让我们使用<code>rustup</code>安装一个夜间版本的工具链：</li>
</ul>

<pre><code class="language-bash">rustup toolchain add nightly</code></pre>

由于我们将把Rust智能合约编译为Wasm，因此我们需要一个Wasm编译器。让我们将其添加到工具链中：

<pre><code class="language-bash">rustup target add wasm32-unknown-unknown --toolchain nightly</code></pre>

现在，Gitpod环境已准备好在Gear上开发智能合约。

2. 使用Gitpod的另一种方式是安装Gitpod扩展程序，该扩展程序可在Chrome和Firefox上使用：

<ul>
<li><a href="https://chrome.google.com/webstore/detail/gitpod-always-ready-to-co/dodmmooeoklaejobgleioelladacbeki" target="_new">Chrome</a></li>
<li><a href="https://addons.mozilla.org/en-US/firefox/addon/gitpod/" target="_new">Firefox</a></li>
</ul>

安装扩展程序后，任何git存储库上都会出现一个Gitpod按钮：

<img class="elimg-bg elimg15-bg" src="https://lwfiles.mycourse.app/gear-academy-public/374a25aed93c167202869acaa8c32288.png?client_id=62728f8299966026c80a4810&amp;width=881&amp;height=62.25" data-unsaved="false" />

## 设置本地环境

对于本课程来说，macOS和Linux是最容易使用的操作系统。Windows可能会更具挑战性，但如果您愿意接受挑战，请随时使用您可以访问和熟悉的操作系统参加我们的课程。

1. Linux用户通常应根据其发行版的文档安装<code>GCC</code> <code>Clang</code>。

例如，在Ubuntu上使用以下命令：

<pre><code class="language-bash">sudo apt install -y build-essential clang cmake</code></pre>

在macOS上，您可以通过运行以下命令来获取编译器工具集：

<pre><code class="language-bash">xcode-select --install
brew install cmake</code></pre>

2. 安装构建Rust智能合约所需的工具。我们将使<code>rustup</code> 来准备Rust编译器：

<pre><code class="language-bash">curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh</code></pre>

让我们使用<code>rustup</code>安装夜间版本的工具链和Wasm目标：

<pre><code class="language-bash">rustup toolchain add nightly
rustup target add wasm32-unknown-unknown --toolchain nightly</code></pre>
