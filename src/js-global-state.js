// import sessionState from "./globalState/sessionState";

const globalState = (initialize = false, initialState = {}, afterInitialize = () => {}) => {
  const initializeGlobalState = () => {
    const state = new Map(Object.entries(initialState || {}));

    setGlobalState(null, state);
    afterInitialize();
  };

  const globalStateProxyHandler = {
    set(target, key, value) {
      target[key] = value;

      if (globalThis.globalListeners) {
        globalThis.globalListeners.forEach(item => {
          const [varName, callback] = item;
          if (varName && key !== varName) return;
          if (callback) callback();
        });
      }

      return {target, key, value};
    }
  };

  const addListener = (varName = null, callback = () => {}) => {
    const generateRandomId = () => Math.random().toString().replace(".", "");

    globalThis.globalListeners = globalThis.globalListeners || [];

    const id = generateRandomId();
    const taggedListener = [id, varName, callback];
    globalThis.globalListeners.push(taggedListener);

    return id;
  };

  const removeListener = (id) => {
    globalThis.globalListeners = globalThis.globalListeners.filter(item => item[0] !== id);
  };

  const setGlobalState = (name = null, newState = {}) => {
    newState = newState instanceof Map ? newState : new Map(Object.entries(newState || {}));
    const state = getGlobalState();

    const baseState = name ? state.get(name) : state;
    const updatedState = new Map([...baseState, ...newState]);

    if (isEqual(baseState, updatedState)) return;

    if (name) state.set(name, updatedState);
    else globalThis.globalState = new Proxy(updatedState, globalStateProxyHandler);
  };

  // Serialization equality: slower for huge objects, but good for now.
  const isEqual = (objectA, objectB) => {
    const stringify = (obj) => JSON.stringify(Array.from(obj.entries()));

    return stringify(objectA) === stringify(objectB);
  };

  if (initialize) initializeGlobalState();

  return {getGlobalState, setGlobalState, initializeGlobalState, addListener, removeListener};
};

export const getGlobalState = (name = null) => {
  const globalState = globalThis.globalState || new Proxy(new Map(), globalStateProxyHandler);
  return name ? globalState[name] : globalState;
};

// small React compatibility layer for initialization.
export const useGlobalState = () => {
  const {initialize} = globalState();
  initialize();
};

export default globalState;
