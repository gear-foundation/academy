---
sidebar_position: 1
hide_table_of_contents: true
---

# Delayed Message

Conventional approaches by programs on other blockchains rely on external, centralized resources. Thus, the execution of code within these programs and any corresponding changes to the blockchain's state depend on being triggered by an on-chain transaction.

An external transaction acts as a trigger to activate the program and start its logic. For instance, someone can initiate an auction by sending a message to the auction program. After the auction period expires, the program needs to process the auction's outcome. However, this process awaits until someone sends the correct message to the program, triggering this action.

The Gear Protocol enables this logic to be fully onchain and do not rely on external services by introducing delayed messaging functionality. Programs within the Gear-powered networks can execute autonomously over an unlimited number of blocks, provided there is sufficient gas for execution. This advancement eliminates the need for centralized components in dApps, enabling them to operate entirely on-chain.

The `msg::send_delayed` function facilitates sending a message after a specified delay, accepting the following parameters:
- `program` - the program (or user) to which the message will be directed;
- `payload` - the content of the message;
- `value` - the amount of tokens to be sent with the message;
- `delay` - the number of blocks after which the message will be dispatched.

The delayed message executes after the predetermined delay measured in blocks. For example, in a network where blocks are produced every 3 seconds, a delay of 20 equates to 1 minute.
