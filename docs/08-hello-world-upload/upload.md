---
title: Upload the program to the blockchain
sidebar_position: 1
hide_table_of_contents: true
---

In this lesson, you'll learn how to upload a program using the "Upload program" option in the Gear Idea portal. To begin, create an account and connect to Gear Idea. Next, choose the network where you want to upload the program. Once you've selected the testnet node, follow these steps to upload the program:
Select the file you'd like to upload.
  1. Add a *.meta.txt file.
  2. Set the program's name and greeting message.
  3. Confirm the upload.
Once the upload is successful, you'll interact with your program by sending messages and accessing its current state, including the greeting message you set during initialization.

The easiest way to upload the program is to use the "Upload program" option in the Gear Idea portal: <https://idea.gear-tech.io/>.

First, you need to create an account and connect to Gear Idea. Follow the instructions provided at <https://wiki.gear-tech.io/docs/idea/account/create-account> to create your account.

After logging in, you can choose the network where you wish to upload the program. Click the gear icon located in the bottom-left corner of the screen. To access the Gear Academy, opt for the Vara Stable Testnet node (`wss://testnet.vara.rs`) and click the **Switch** button.

Select the workshop node and click on the **Switch** button:

![Switch Network](/img/08/switch-network.png)

Get the test balance by clicking on the button in the top right corner:

![Get Balance](/img/08/get-balance.jpg)

Then select **Programs** in the left column and click on the **Upload program** button:

![Upload Program](/img/08/upload-program.jpg)

Choose the file` hello_world.opt.wasm` located in the `target/wasm32-unknown-unknown/release` folder:

![Choose File](/img/08/choose-file.jpg)

Then add the `hello_world.meta.txt` file located in the project root:

![Add Meta File](/img/08/add-meta-file.jpg)

Enter the name for your program (for example, `Hello_World`) and set the greeting message:

![Set Program Name](/img/08/set-program-name.jpg)

If the program uploads successfully, you will see it in the programs section.

![Programs](/img/08/programs.jpg)

Now you can send messages to your program:

![Send Message](/img/08/send-message.jpg)

You can also read the program state (click on the **Read full state** button):

![Read State](/img/08/read-state.jpg)

It's our greeting string that was set during the program initialization.

![State](/img/08/state.jpg)
