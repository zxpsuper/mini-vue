import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./baseHandlers";

/**响应对象 map 集合 */
export const reactiveMap = new WeakMap();
/**只读对象 */
export const readonlyMap = new WeakMap();
/**浅只读对象？？ */
export const shallowReadonlyMap = new WeakMap();

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
  RAW = "__v_raw",
}
/**
 * 创建响应对象
 * @param target 
 * @returns 
 */
export function reactive(target) {
  return createReactiveObject(target, reactiveMap, mutableHandlers);
}

/**
 * 创建只读对象
 * @param target 
 * @returns 
 */
export function readonly(target) {
  return createReactiveObject(target, readonlyMap, readonlyHandlers);
}

/**
 * 创建浅只读对象
 * @param target 
 * @returns 
 */
export function shallowReadonly(target) {
  return createReactiveObject(
    target,
    shallowReadonlyMap,
    shallowReadonlyHandlers
  );
}

/**
 * 判断是否为代理对象
 * @param value 
 * @returns 
 */
export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}

/**
 * 判断 value 是否为只读对象
 * @param value 
 * @returns 
 */
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

/**
 * 判断是否为响应对象
 * @param value 
 * @returns 
 */
export function isReactive(value) {
  // 如果 value 是 proxy 的话
  // 会触发 get 操作，而在 createGetter 里面会判断
  // 如果 value 是普通对象的话
  // 那么会返回 undefined ，那么就需要转换成布尔值
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function toRaw(value) {
  // 如果 value 是 proxy 的话 ,那么直接返回就可以了
  // 因为会触发 createGetter 内的逻辑
  // 如果 value 是普通对象的话，
  // 我们就应该返回普通对象
  // 只要不是 proxy ，只要是得到了 undefined 的话，那么就一定是普通对象
  // TODO 这里和源码里面实现的不一样，不确定后面会不会有问题
  if (!value[ReactiveFlags.RAW]) {
    return value;
  }

  return value[ReactiveFlags.RAW];
}

/**
 * 创建响应对象
 * @param target 目标对戏 
 * @param proxyMap 全部代理map
 * @param baseHandlers 创建函数
 * @returns 
 */
function createReactiveObject(target, proxyMap, baseHandlers) {
  // 核心就是 proxy
  // 目的是可以侦听到用户 get 或者 set 的动作
  // 如果命中的话就直接返回就好了
  // 使用缓存做的优化点
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }

  const proxy = new Proxy(target, baseHandlers);

  // 把创建好的 proxy 给存起来，
  proxyMap.set(target, proxy);
  return proxy;
}
