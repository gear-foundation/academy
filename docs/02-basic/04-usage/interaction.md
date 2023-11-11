---
sidebar_position: 3
hide_table_of_contents: true
---

# Interaction with the Program

1. Now, try sending your newly uploaded program a message to see how it responds! Click the <kbd>Send message</kbd> button.

2. In the `Payload` field of the opened dialog type `0x696E63` (this is `inc` encoded in hex). Click <kbd>Calculate Gas</kbd> button, the Gas limit will be set automatically. Now click the <kbd>Send Message</kbd> button.

    ![Send form](../img/04/send-request.png)

3. Sign the message sending transaction as it is shown in step 3 of the section **Upload Program**.

4. After your message has been successfully processed, you are to see correspondent log messages:

    ![Log](../img/04/message-log.png)

    Now you have sent an increment command to the program. After processing the counter will be incremented to `1`.

5. Repeat step 2 with `0x676574` payload (this is `get` command). This will send a get command to the program.

6. Press the <kbd>Mailbox</kbd> button to enter the mailbox and find the reply.

    ![Mailbox reply](../img/04/mailbox-reply.png)

    :::note

    The reply is in the mailbox for a limited time depending on the gas limit. If you don't see the reply, try resending the `0x676574` (`get`) message with the gas limit increasing and go to the mailbox immediately after sending the message.

    :::
