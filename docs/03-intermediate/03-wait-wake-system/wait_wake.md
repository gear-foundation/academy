---
sidebar_position: 1
hide_table_of_contents: true
---

# wait() and wake()

In order to improve the handling of messages in the Gear program, the use of the `exec::wait()` and `exec::wake()` functions can be beneficial:

## Wait
`exec::wait()`: pause the current message handling. It completes the current message handle execution with a special result and puts this message into the waiting queue. The message can then be awakened using the corresponding `exec::wake()` function at a later time.
When a message goes into the waiting state using the `exec::wait()` function, all the changes made by the program before the wait call are saved. These changes are stored in the program's persistent storage, so they are not lost when the current message handling is paused.
When a message is waiting, all gas that hasn't been spent yet is attributed to that message in the waiting queue. If the gas runs out while the message is waiting, it will not be awakened, and the program can be stuck in an intermediate state. This is very important to realize that each block of a message's presence in the queue is charged for in the form of some amount of gas.

Therefore, Gear also provides the ability to enter a waiting state for a certain number of blocks using the `exec::wait_for` and `exec::wait_up_to` functions:
- `exec::wait_for(duration)`: The message waits for the specified number of blocks, and after that time, it wakes up itself if it hasn't been woken up before. If the message doesn't have enough gas to pay for the specified number of blocks, then the function panics;
- `exec::wait_up_to(duration)`: The message waits for the number of blocks that it has enough gas to pay for, and this number of blocks does not exceed the specified duration.

## Wake
`exec::exec::wake()`: Resume the execution of a message that was previously paused using the wait function. When the wake function is called with a valid message_id, it will take the message out of the waiting queue and put it back into the processing queue. 

**It is important to note that message execution starts from the very beginning. The message comes to the handle entry point and executes all the logic from the beginning.**


