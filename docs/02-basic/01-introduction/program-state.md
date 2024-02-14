---
sidebar_position: 3
hide_table_of_contents: true
---

# Program State

Programs on Vara are very similar to any other programs in terms of memory usage. They have a stack, static, and heap sections. The main difference is that Programs on Vara are stateful and their state is persisted in the blockchain’s state. That means that the program’s state is preserved between calls.

Program memory is organized in pages of 64KB according to the Wasm memory model. These pages are used for static data as well as for heap allocations. The stack is not persisted between calls. If the program needs more memory, it can allocate additional pages. The program can also deallocate pages that are not needed anymore. Each memory block allocation requires a gas fee. Each page (64KB) is stored separately on the distributed database backend, but at the run time, Gear node constructs continuous runtime memory and allows programs to run on it without reloads.

## Persistent memory

Programs running in Vara networks don’t use a shared storage but rather their full state is persisted which ensures much less API surface for blockchain context. It avoids domain-specific language features as well as allows using much more complex language constructs — persisted boxed closures, futures compositors, etc.

The Gear Protocol uses clever memory virtualization techniques (despite vanilla Wasm does not), memory allocation and deallocation are first-class syscalls of the protocol. Memory access is also tracked and only required pages are loaded/stored. That allows heap-allocated frames of smart contracts stored in the blockchain’s state (typically found in futures and their compositors) to be seamlessly persisted and invoked when needed, preserving their state upon request.

Gear instance holds individual memory space per program and guarantees its persistence. A program can read and write only within its own memory space and has no access to the memory space of other programs. Individual memory space is reserved for a program during its initialization and does not require an additional fee (it is included in the program's initialization fee).
