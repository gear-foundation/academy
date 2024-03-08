---
sidebar_position: 1
hide_table_of_contents: true
---

# Actor Model

The Actor Model is an approach to designing and implementing systems for concurrent processing. “Actors” are independent entities, like users and programs, which communicate with each other by exchanging messages. The Actor Model is unique in that actors are isolated from each other, without sharing memory. Instead, each actor maintains its own state and can only change its state in response to received messages from other actors. When an actor receives a message, it can perform some computation based on the contents of the message and its internal state, and may also send messages to other actors in response.

## How does the Actor Model work?

Within the Vara network, each actor — whether a smart contract or a user — has its own private internal state, contained within that actor’s “persistent memory”. Actors communicate with each other by sending asynchronous messages.

When messages are sent, they are stored in a message queue after validation being a part of the blockchain state. Once the message criteria have been met (such as available processing time in the current block or a specific block number having passed), a message is dequeued, a target program is loaded and executed with the message on input. The program can send new messages as a result of processing, these messages are enqueued back into the message queue.

Essentially, actors are able to independently receive inputs, perform functions, and send outputs. This is how programs, including smart contracts, can work automatically and in parallel. It’s also worth noting that actors can create other actors, extending the chain within a program and allowing for more flexible and complex functionality.

## Why does Gear use the Actor Model?

The Actor Model differs from other methods for program communication in that it passes messages between actors instead of sharing a network state. This contributes to greater program security and robustness, because each actor has its own individual mailbox and cannot change the state of another actor within the chain.

Typically, smart contracts lack the ability to support asynchronous messaging, but as implemented by Gear, the Actor Model provides native arbitrary asynchronous communication for all programs. This allows for the use of design patterns and language constructs enabled by asynchronous programming that are commonly seen in Web 2.0 contexts today — greatly simplifying both development and testing, whilst unlocking entirely new use cases for smart contracts. Importantly, Gear details design principles and patterns that align concurrent communication inside smart contract logic with program state consistency.

Actor isolation, asynchronous message-passing, and state encapsulation make the Actor Model a very highly fault-tolerant framework because it provides mechanisms that allow systems to recover from failures and continue operating. Combined with the aforementioned improvements to performance, scalability, developer experience, and design choices — Gear’s use of the Actor Model makes it an ideal environment to create the next generation of fast & scalable Web 3.0 dApps using established tools and workflows from the Web 2.0 world.
