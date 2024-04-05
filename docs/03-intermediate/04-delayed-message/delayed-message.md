---
sidebar_position: 1
hide_table_of_contents: true
---

# Delayed message

The conventional approach adopted by programs on other blockchains involves dependency on external, centralized resources. Consequently, the execution of code within these programs and any corresponding alterations to the blockchain's state are contingent upon being triggered by an on-chain transaction.

The external transaction functions as a trigger to activate the program and commence its logic. For example, an individual can initiate an auction by dispatching a message to the auction program. Following the expiration of the auction period, the program will require processing the auction's outcome. However, this processing will remain pending until an individual dispatches the appropriate message to the program, thereby initiating this action.

Gear Protocol solves this issue by introducing delayed messaging functionality. The programs in Gear Networks are able to execute themselves an unlimited number of blocks, as long as enough gas for execution is kept available. As a result the need for including centralized components in dApps is eliminated, allowing them to function totally on-chain.

`msg::send_delayed` function allows sending a message after a specified delay. The function takes the following parameters:
- `program` - the program (or user) to which the message will be sent;
- `payload` - the payload of the message;
- `value` - the amount of tokens to be sent with the message;
- `delay `- the delay in blocks after which the message will be sent.

The delayed message will be executed after the specified delay measured in blocks. For example, on a network with a block producing time of 3 seconds, a delay of 20 is equal to 1 minute.

