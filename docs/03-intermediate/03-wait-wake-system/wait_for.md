---
sidebar_position: 4
hide_table_of_contents: true
---

# Breakdowns in communication 

Sometimes the second program may not answer for any reason and it is necessary to be able to handle this case correctly. 

## wait_for()

Let's try to solve this problem using `wait_for(DURATION_IN_BLOCK)`.
Reminder: this function itself wakes up the message from the waiting list after a certain number of blocks, if `exec::wake()` was not called.

## Echo program

Let's add `exec::wait()` so that the echo program does not reply to incoming messages:

```rust
#[no_mangle]
extern "C" fn handle() {
    exec::wait();
    msg::reply_input(0, 0..msg::size()).expect("Error in sending a reply");
}

```

## Main program

In the main program `handle()` function will be modified instead of `exec::wait()` let's use `exec::wait_for(3)`, so if `exec::wake()`, which is in `handle_reply()`, is not called within 3 blocks, the program will wake itself up.

```rust
#[no_mangle]
extern "C" fn handle() {
    debug!("!!!! HANDLE !!!!");
    debug!("Message ID: {:?}", msg::id());
    let message: String = msg::load().expect("Unable to decode ");
    let program = unsafe { PROGRAM.as_mut().expect("The program is not initialized") };

    // match status
    match &program.status {
        Status::Received(reply_message) => {
            debug!("HANDLE: Status::Received");
            msg::reply(reply_message, 0).expect("Error in sending a reply");
            debug!("HANDLE: Status::Waiting");
            program.status = Status::Waiting;
        }
        Status::Waiting  => {
            debug!("HANDLE: Status != Received");
            let msg_id = msg::send(program.echo_address, message.clone(), 0)
                .expect("Error in sending a message");

            debug!("HANDLE: Status::Sent");
            program.status = Status::Sent;
            program.msg_ids = (msg_id, msg::id());
            debug!("HANDLE: WAIT");
            exec::wait_for(3);
        }
        Status::Sent => {
            debug!("HANDLE: No response was received");
            msg::reply("No response was received", 0).expect("Error in sending a reply");
        }
    }
    debug!("HANDLE: END");
}
```

In this case the program will go to `handle()` again, but this time the status will be `Status::Sent`, so a message will be sent to the user that there was no response and the status will be set to `Status::Waiting`.

