---
title: Upload the program to the blockchain
sidebar_position: 1
hide_table_of_contents: true
---

This lesson explains how to upload a program using the "Upload program" option in the Gear Idea portal. To do so, you need to create an account and connect to Gear Idea, and then select the network on which you want to upload the program. Once you've selected the testnet node, you can upload the program by selecting the file and adding a `*.meta.txt` file, setting the program's name and greeting message. After successful upload, you can send messages to your program and read its state, including the greeting message set during initialization.

The easiest way to upload the program is to use the “Upload program” option in the Gear Idea portal: <https://idea.gear-tech.io/>.

First, you need to create an account and connect to Gear Idea. Follow the instructions provided at <https://wiki.gear-tech.io/docs/idea/account/create-account> to create your account.

Once you've logged in, you can select the network on which you want to upload the program by clicking on the gear icon in the lower left corner of the screen. For the Gear Academy, select the Vara Stable Testnet node (`wss://testnet.vara.rs`) and click the **Switch** button.

Select the workshop node and click on the **Switch** button:

![Switch Network](/img/08/switch-network.png)

Get the test balance by clicking on the button in the top right corner:

![Get Balance](/img/08/get-balance.jpg)

Then select **Programs** in the left column and click on the **Upload program** button:

![Upload Program](/img/08/upload-program.jpg)

Choose the file` hello_world.opt.wasm` located in the `target/wasm32-unknown-unknown/release` folder:

![Choose File](/img/08/choose-file.jpg)

Then add `hello_world.meta.txt` file located in the project root:

![Add Meta File](/img/08/add-meta-file.jpg)

Enter the name for your program (for example, `Hello_World`) and set the greeting message:

![Set Program Name](/img/08/set-program-name.jpg)

If the program has successfully uploaded, you will see it in the program.

![Programs](/img/08/programs.jpg)

Now you can send messages to your program:

![Send Message](/img/08/send-message.jpg)

You can also read the program state (click on **Read full state** button):

![Read State](/img/08/read-state.jpg)

It’s our greeting string that was set during the program initialization.

![State](/img/08/state.jpg)
