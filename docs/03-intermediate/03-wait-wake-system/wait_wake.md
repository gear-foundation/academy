---
sidebar_position: 1
hide_table_of_contents: true
---

# wait() and wake()

In order to enhance message handling in the Gear program, utilizing the `exec::wait()` and `exec::wake()` functions can be advantageous:

## Wait

`exec::wait()`: Pauses the current message handling process, completing it with a special result and placing the message into the waiting queue. The message can later be awakened using the corresponding `exec::wake()` function. When a message enters the waiting state with `exec::wait()`, all changes made by the program before the wait call are preserved. These changes are stored in the program's persistent storage, ensuring they are not lost when message handling is paused. While a message is in the waiting state, all remaining gas is allocated to that message in the waiting queue. If the gas is depleted while the message is waiting, it will not be awakened, potentially causing the program to become stuck in an intermediate state. It is crucial to understand that each block of a message's presence in the queue incurs a charge in the form of gas.

Therefore, Gear also provides the ability to enter a waiting state for a certain number of blocks using the `exec::wait_for` and `exec::wait_up_to` functions:

- `exec::wait_for(duration)`: With this function, the message pauses and waits for a specific number of blocks to pass. After this time has elapsed, if the message hasn't already been awakened, it will wake up on its own. However, if the message doesn't have enough gas to cover the cost of waiting for the specified number of blocks, the function will cause an panic.

- `exec::wait_up_to(duration)`: This function allows the message to wait for a duration of time, but it only waits for as many blocks as it has enough gas to pay for. It ensures that the waiting time does not exceed the specified duration.

## Wake
`exec::exec::wake()`: Resume the execution of a message that was previously paused using the wait function. When the wake function is called with a valid message_id, it will take the message out of the waiting queue and put it back into the processing queue. 

**It is important to note that message execution starts from the very beginning. The message comes to the handle entry point and executes all the logic from the beginning.**


