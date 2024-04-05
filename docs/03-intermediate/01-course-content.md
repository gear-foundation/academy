---
sidebar_position: 1
hide_table_of_contents: true
---

# Course content

This course serves as a continuation of the basic course and delves deeper into the implementation of programs using Gear technologies. Specifically, it focuses on how programs can communicate with each other, receive and process requests, and handle scenarios where one party does not respond.

The course material is structured into three sections:

1. Message Acquisition and Processing:
- Detailed examination of the `handle_reply()` function;
- Acquisition of skills in processing messages received as responses;
- Testing of the developed program.

2. Asynchronous Logic Utilizing the Waiting List:
- Introduction to the `exec::wait()` and `exec::wake()` functions;
- Mastery of halting message processing and awakening it as necessary;
- Analysis of scenarios where responses are not received and resolution using the `exec::wait_for()` function;
- Testing of the implemented programs.

3. Handling of Delayed Messages:
- In-depth exploration of delayed messages;
- Resolution of issues related to lack of response through the use of delayed messages;
- Testing of the program featuring delayed messages.

