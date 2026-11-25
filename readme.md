# Js Global State (WIP)

This project provides a tiny, basic global state management system without relying on external libraries. It's written in plain vanilla JS so it can be used out of the box for quick prototyping.

The state is a global key/value dictionary and It's designed to allow one level splitting.

This state architecture is deliberately mutable: only one single state object is maintained at any given time.

***

## Main import:

The main import is globalState: it exposes public functions, and initializes the state if so specified. Initialization is not mandatory unless we'd like to pass an initial state on app launch: `getGlobalState` will create an empty state if not present yet.

```javascript
globalState(initialize = false, initialState = {}, afterInitialize = () => {})
```

```javascript
import globalState from "../.."

const initialState = {
  score: 0
}

const afterInitialize = () => {
  doStuff()
}

// Initialization:
globalState(true, initialState, afterInitialize)

// Import:
const {getGlobalScope, setGlobalScope, addListener, removeListener} = globalState()

// Subscribe to a key:
const listenerID = addListener("likes", (newVal) => { this.scope.likes = newVal })

// Remove subscription:
removeListener(listenerID)
```

***



* `getGlobalState(name = "")` => if a name is specified, it will return the requested one level state. Else the whole sttate is returned. It falls back to an empty scope, creates it if necessary.
  * Arguments:
    * `name` (string:optional) => specifies the key to retrieve.
  * Returns: 
    * state object.
* `setGlobalState(name: optional, newState = {})` => will update state or sub-state as specified. This setter triggers listeneres targeted to the specific keys (see `addListener`).
  * Arguments:
    * `name` (string:optional) => specifies a key state to set, else it assumes the wole global state.
    * `newState` (object) => key/value set.
* `addListener(varName = "", callback = () => {})` => listens to changes in a specific state key, passes the callback to be executed. It returns the listener ID, which will be used to clean it up.
  * Arguments:
    * `varName` (string)
    * `callback` (function)
  * Returns:
    * Listener ID
* `removeListener(listenerID)` => it clears the specific listener.

