---
sidebar_position: 1
hide_table_of_contents: true
---

# wait() and wake()

To enhance message handling in Gear programs, the `exec::wait()` and `exec::wake()` functions are invaluable tools:

## Wait

`exec::wait()`: This function pauses the current message handling process, completing it with a special result and placing the message into the waiting queue. The message can later be reactivated using the `exec::wake()` function. When a message is put into the waiting queue with `exec::wait()`, all changes made by the program before the wait call are preserved. These changes are stored in the program's persistent storage, ensuring they are not lost when message handling is paused. All remaining gas associated with the message stays allocated to the message in the waiting queue. While in the waiting state, the newtork charges gas to keep the message in the waiting queue. If all associated gas is depleted, the message will not be awakened, potentially causing the program to become stuck in an intermediate state. It is essential to note that each block of a message's presence in the queue incurs a gas charge.

To address this, Gear provides functions for entering a waiting state for a specified number of blocks:

- `exec::wait_for(duration)`: This function pauses the message for a specific number of blocks. If the message has not been awakened by other means, it will automatically wake up after this period. However, if there isn’t enough gas to cover the waiting period, the function will trigger a panic.

- `exec::wait_up_to(duration)`: Allows the message to wait for a period, but only for as many blocks as it has gas to afford. This ensures that the wait does not exceed the available resources.

## Wake
`exec::wake(message_id)`: Resumes the execution of a message that was previously paused with the `exec::wait()`, `exec::wait_for()`, `exec::wait_up_to()` functions. Calling the wake function with a valid message ID takes the message out of the waiting queue and places it back in the processing queue.

**Important: Message execution restarts from the beginning. The message enters at the `handle` entry point and executes all logic from the start.**