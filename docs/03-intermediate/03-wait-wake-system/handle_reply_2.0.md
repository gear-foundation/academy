---
sidebar_position: 2
hide_table_of_contents: true
---

# Handle reply with wait() and wake()

Now let's use the knowledge about `wait()`/`wake()` functions and try to improve the program that was shown in the previous lesson. 

![gif 2](../img/03/wait_wake.gif)

As you may observe, the user will no longer receive two separate messages; instead, a single reply will be dispatched once the entire process is finalized.

## Main program

Since the "echo" program remains unchanged, let's proceed directly to the consideration of changes in the main program::

```rust
type MessageSentId = MessageId;
type OriginalMessageId = MessageId;

struct Program {
    echo_address: ActorId,
    msg_ids: (MessageSentId, OriginalMessageId),
    status: Status,
}
```
New fields have been created
- `msg_ids` — a tuple consisting of two elements: MessageSentId and OriginalMessageId;
    - `MessageSentId` - identifier of the message to be sent to the echo address;
    - `OriginalMessageId` - identifier of the message to be sent to the main program (required for using the wake() function);
- `status` - program status (required to track program activity stages);

```rust
enum Status {
    Waiting,
    Sent,
    Received(String),
}
```
- `Waiting` — the program is waiting for a message;
- `Sent` - the program has sent a message to the "echo" program and has not yet received a response;
- `Received(String)` - the program received a reply to a message;


Considering the new fields in the program structure, initialization appears as follows:

```rust
#[no_mangle]
extern fn init() {
    let echo_address = msg::load().expect("Unable to decode Init");
    unsafe {
        PROGRAM = Some(Program {
            echo_address,
            msg_ids: (MessageId::zero(), MessageId::zero()),
            status: Status::Waiting
        });
    }
}
```

This time let's include debugging in our program to understand the whole process of the program during testing


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
        Status::Waiting | Status::Sent => {
            debug!("HANDLE: Status != Received");
            let msg_id = msg::send(program.echo_address, message.clone(), 0)
                .expect("Error in sending a message");
            debug!("HANDLE: Status::Sent");
            program.status = Status::Sent;
            program.msg_ids = (msg_id, msg::id());
            debug!("HANDLE: WAIT");
            exec::wait();
        }
    }
    debug!("HANDLE: END");
}

```

At the beginning, as you may have noticed, the program is in a `Status::Waiting` status, and when a `match` occurs, the code moves to the second variant. Send messages, set the program status to `Status::Sent` and save the identifiers of the current message and the sent message.  After all this call the function `exec::wait()` function, which pauses the code and adds the current message to the waiting list until `exec::wake()` is called or the gas runs out.

Let's move on to the `handle_reply()` function: 

```rust
#[no_mangle]
extern "C" fn handle_reply() {
    debug!("HANDLE_REPLY");
    let reply_message: String = msg::load().expect("Unable to decode ");
    let reply_to = msg::reply_to().expect("Failed to query reply_to data");
    let program = unsafe { PROGRAM.as_mut().expect("The program is not initialized") };

    if reply_to == program.msg_ids.0 && program.status == Status::Sent {
        debug!("HANDLE_REPLY: Status::Received");
        program.status = Status::Received(reply_message);
        let original_message_id = program.msg_ids.1;
        debug!("HANDLE: WAKE");
        exec::wake(original_message_id).expect("Failed to wake message");
    }
}
```

Сondition  `if reply_to == program.msg_ids.0 && program.status == Status::Sent` gives a guarantee that the expected message has arrived and arrived at the right moment, i.e. at the correct program status. 
After that the status is set to `Status::Received(reply_message)` and the response message is saved; get the ID of the original message and call the `exec::wake()` function, which retrieves the message from the waiting list and the suspended message is restarted in `handle()`. 

Important note: the `exec::wake()` function wakes up the message from the very beginning of the function `handle()`, i.e. the program code will get into the `match` again:
```rust
// ...
match &program.status {
    Status::Received(reply_message) => {
        debug!("HANDLE: Status::Received");
        msg::reply(reply_message, 0).expect("Error in sending a reply");
        debug!("HANDLE: Status::Waiting");
        program.status = Status::Waiting;
    }
    // ...
```
However, this time it will go into the first variant, send a response and set the status to `Status::Waiting`.

Now, let's examine this process as a whole: 

TODO: make a gif

academy gif 3

![Code part 2](../img/03/wait_wake_code.gif)

