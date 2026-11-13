const globalStateProxyHandler = {
  set(target, key, value) {
    target[key] = value;

    broadcastSubscribers(key)

    return {target, key, value};
  }
};

export const broadcastSubscribers = (key) => {
  if (globalThis._globalListeners?.length) {
    globalThis._globalListeners.forEach(item => {
      const [_id, varName, callback] = item;
      if (varName && key === varName && callback) callback();
    });
  }
}

const globalState = (initialize = false, initialState = {}, afterInitialize = () => {}) => {
  const initializeGlobalState = () => {
    const state = initialState || {};

    setGlobalState(null, state);
    afterInitialize();
  };

  const addListener = (varName = null, callback = () => {}) => {
    const generateRandomId = () => Math.random().toString().replace(".", "");

    globalThis._globalListeners = globalThis._globalListeners || [];

    const id = generateRandomId();
    const taggedListener = [id, varName, callback];
    globalThis._globalListeners.push(taggedListener);

    return taggedListener;
  };

  const removeListener = (taggedListener) => {
    globalThis._globalListeners = globalThis._globalListeners.filter(item => item[0] !== id);
  };

  const setGlobalState = (name = null, newState = {}) => {
    const state = getGlobalState();

    const baseState = name ? state[name] : state;
    const updatedState = isObject(baseState) ? {...baseState, ...newState} : newState;

    if (isEqual(baseState, updatedState)) return;

    if (name) state[name] = updatedState;
    else globalThis._globalState = new Proxy(updatedState, globalStateProxyHandler);
  };

  const isObject = (obj) => obj?.constructor === Object;

  // Serialization equality: slower for huge objects, but good for now.
  const isEqual = (objectA, objectB) => {
    const stringify = (obj) => JSON.stringify(obj);

    return stringify(objectA) === stringify(objectB);
  };

  if (initialize) initializeGlobalState();

  return {getGlobalState, setGlobalState, initializeGlobalState, addListener, removeListener};
};

export const getGlobalState = (name = null) => {
  globalThis._globalState ||= new Proxy({}, globalStateProxyHandler);
  return name ? globalThis._globalState[name] : globalThis._globalState;
};

// small React compatibility layer for initialization.
export const useGlobalState = () => {
  const {initialize} = globalState();
  initialize();
};

export default globalState;
