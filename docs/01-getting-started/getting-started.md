---
title: Getting started
sidebar_position: 2
---

Before you start developing a smart contract on Gear, you have to configure the development environment.

One of the ways is to use <a href="https://www.gitpod.io/" target="_new">Gitpod</a>. <b>Gitpod</b> is a tool allowing developers to launch ready-to-code development environments for your GitHub projects with a single click.

<h2>Using Gitpod</h2>

1. The first option to use Gitpod:

<ul><li>In a browser, navigate to your project in GitHub or GitLab;</li><li>In the browser’s address bar, prefix the entire URL with <code>gitpod.io/#</code> and press <kbd>Enter</kbd>. It will create a cloud development environment and open up a workspace in VS code;</li><li>Install the tools required to build smart contracts in Rust. Gitpod always comes with the latest available Rust toolchain pre-installed using Rust compiler <code>rustup</code>. Let’s install a nightly version of the toolchain with <code>rustup</code>:</li></ul>

<pre><code class="language-bash">rustup toolchain add nightly</code></pre>

As we will be compiling our Rust smart contract to Wasm, we will need a Wasm compiler. Let’s add it to the toolchain:

<pre><code class="language-bash">rustup target add wasm32-unknown-unknown --toolchain nightly</code></pre>

Now the Gitpod environment is ready for development of smart contracts on Gear.

2. Another way to get started with Gitpod is by installing the Gitpod extension which is available on Chrome and Firefox:

<ul><li><a href="https://chrome.google.com/webstore/detail/gitpod-always-ready-to-co/dodmmooeoklaejobgleioelladacbeki" target="_new">Chrome</a></li><li><a href="https://addons.mozilla.org/en-US/firefox/addon/gitpod/" target="_new">Firefox</a></li></ul>

Once you have the extension installed, a gitpod button will shop up on any git repos:

<img class="elimg-bg elimg15-bg" src="https://lwfiles.mycourse.app/gear-academy-public/374a25aed93c167202869acaa8c32288.png?client_id=62728f8299966026c80a4810&amp;width=881&amp;height=62.25" data-unsaved="false" />

<h2>Setting up the local environment</h2>

For this course macOS and Linux will be the easiest operating systems to use. Windows may be more challenging, however if you’re ok with that, please feel free to join us using whatever operating system that you have access to and are comfortable with.

1. Linux users should generally install <code>GCC</code> and <code>Clang</code>, according to their distribution’s documentation.

For example, on Ubuntu use:

<pre><code class="language-bash">sudo apt install -y build-essential clang cmake</code></pre>

On macOS, you can get a compiler toolset by running:

<pre><code class="language-bash">xcode-select --install
brew install cmake</code></pre>

2. Install the tools required to build smart contract in Rust. <code>rustup</code> will be used to get Rust compiler ready:

<pre><code class="language-bash">curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh</code></pre>

Let’s install a nightly version of the toolchain and a Wasm target with <code>rustup</code>:

<pre><code class="language-bash">rustup toolchain add nightly
rustup target add wasm32-unknown-unknown --toolchain nightly</code></pre>
