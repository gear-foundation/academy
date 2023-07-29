---
title: Comenzando
sidebar_position: 2
hide_table_of_contents: true
---

Antes de comenzar a desarrollar un contrato inteligente en Gear, debes configurar el entorno de desarrollo.
Una de las formas es utilizar Gitpod. Gitpod es una herramienta que permite a los desarrolladores lanzar entornos de desarrollo listos para codificar para tus proyectos de GitHub con un solo clic.

## Uso de Gitpod

1. La primera opción para usar Gitpod:

- En un navegador, dirígete a tu proyecto en GitHub o GitLab;
- En la barra de direcciones del navegador, agrega el prefijo `gitpod.io/#` a toda la URL y presiona <kbd>Enter</kbd>. Esto creará un entorno de desarrollo en la nube y abrirá un espacio de trabajo en VS code;
- Instala las herramientas necesarias para construir contratos inteligentes en Rust. Gitpod siempre viene con la última versión disponible de la cadena de herramientas de Rust preinstalada mediante el compilador de Rust `rustup`. Vamos a instalar una versión nightly de la cadena de herramientas con `rustup`:

    ```
    rustup toolchain add nightly
    ```

    Como compilaremos nuestro contrato inteligente en Rust a Wasm, necesitaremos un compilador de Wasm. Vamos a agregarlo a la cadena de herramientas:

    ```bash
    rustup target add wasm32-unknown-unknown --toolchain nightly
    ```

    Ahora el entorno de Gitpod está listo para el desarrollo de contratos inteligentes en Gear.

2. Otra forma de comenzar con Gitpod es instalando la extensión de Gitpod, disponible en Chrome y Firefox:

    - [Chrome](https://chrome.google.com/webstore/detail/gitpod-always-ready-to-co/dodmmooeoklaejobgleioelladacbeki)
    - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/gitpod/)

    Una vez que hayas instalado la extensión, aparecerá un botón de gitpod en cualquier repositorio de git:

    ![Gitpod Button](/img/01/gitpod-button.png)

## Configuración del entorno local

Para este curso, macOS y Linux serán los sistemas operativos más fáciles de usar. Windows puede ser más desafiante, sin embargo, si estás de acuerdo con eso, no dudes en unirte utilizando cualquier sistema operativo al que tengas acceso y te sientas cómodo.

1. Los usuarios de Linux deben instalar `GCC` y `Clang`, según la documentación de su distribución.

    Por ejemplo, en Ubuntu usa:

    ```
    sudo apt install -y build-essential clang cmake
    ```

    En macOS, puedes obtener un conjunto de herramientas de compilación ejecutando:

    ```
    xcode-select --install
    brew install cmake
    ```

2. Instala las herramientas necesarias para construir contratos inteligentes en Rust. rustup se utilizará para obtener el compilador de Rust listo:

    ```
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```

    Vamos a instalar una versión nightly de la cadena de herramientas y un objetivo de Wasm con `rustup`:

    ```bash
    rustup toolchain add nightly
    rustup target add wasm32-unknown-unknown --toolchain nightly
    ```
