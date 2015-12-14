# Damda

Damda is a state/actions container for Javascript client apps.

It simplifies react and react native app development by separating data management from view rendering codes.

Damda was inspired by Redux. While the core ideas of Redux are inherited, Damda differs from Redux in that actions and reducer functions are not separate entities. In Damda, actions are state change functions that can be dispatched directly.


```js
const { createStore, createActionGroup } = require('damda')

/**
 * This is action group definition.
 * Each action is a pure function with (state) => state signature.
 * 
 * The shape of the state can be a nested javascript object.
 */
const counter = createActionGroup({
  default: () => 0,
  increment: (state) => state+1,
  decrement: (state) => state-1
})

let store = createStore(counter)

// You can subscribe to state changes.
store.subscribe((state) => console.log(state))

// You can change internal state by dispatching actions.
store.dispatch(counter.increment)
// 1
store.dispatch(counter.increment)
// 2
store.dispatch(counter.decrement)
// 1
```