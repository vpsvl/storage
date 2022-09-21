/**
 * 创建storage
 * @param storage localStorage | sessionStorage
 * @returns {object}
 */
export default function createStorage(storage) {
  if (storage !== 'localStorage' && storage !== 'sessionStorage') {
    storage = 'localStorage';
  }
  const webStorage = window[storage];

  /**
   * 类型判断
   * @param val
   * @returns {string}
   * @private
   */
  function _typeof(val) {
    return Object.prototype.toString.call(val).replace(/.* (.*)]/, '$1');
  }

  /**
   * json格式转换
   * @type {{toJson(*=): (any|undefined), toString(*=): string}}
   * @private
   */
  const _jsonFormat = {
    toString(data) {
      return JSON.stringify(data);
    },
    toJson(data) {
      try {
        return JSON.parse(data);
      } catch (err) {
        return data;
      }
    },
  };

  /**
   * 检查是否为Date类型
   * @param date
   * @returns {boolean}
   * @private
   */
  function _isValidDate(date) {
    return _typeof(date) === 'Date' && !isNaN(date.getTime());
  }

  /**
   * 过期时间 0为不会过期
   * @type {number}
   * @private
   */
  const _maxExpire = 0;

  /**
   * 转毫秒
   * @type {{hour: number, month: number, day: number, second: number}}
   * @private
   */
  const _msMap = {
    second: 1000,
    hour: 3600000,
    day: 86400000,
    month: 2592000000,
  };

  /**
   * 获取过期时间
   * @param opt Object的key => date; second,hour,day,month: 值为number
   * @returns {number|number}
   * @private
   */
  function _getExpiresTime(opt) {
    if (!opt || _typeof(opt) !== 'Object') {
      return _maxExpire;
    }
    try {
      if (opt.date) {
        let expires = new Date(opt.date);
        return _isValidDate(expires) ? expires.getTime() : _maxExpire;
      }
      for (let k in opt) {
        if (_msMap[k]) {
          let time = Number(opt[k]);
          if (isNaN(time) || time <= 0 || time === Infinity) {
            continue;
          }
          return Date.now() + time * _msMap[k];
        }
      }
      return _maxExpire;
    } catch (e) {
      return _maxExpire;
    }
  }

  /**
   * 格式化缓存数据
   * @param value
   * @param exp
   * @returns {{e: number, v}}
   * @private
   */
  function _getCacheItem(value, exp) {
    let expires = _getExpiresTime(exp);
    return {
      e: expires,
      v: value,
    };
  }

  /**
   * 检查缓存数据格式
   * @param cacheItem
   * @returns {boolean}
   * @private
   */
  function _isCacheItem(cacheItem) {
    if (_typeof(cacheItem) !== 'Object') {
      return false;
    }
    return Reflect.has(cacheItem, 'e') && Reflect.has(cacheItem, 'v');
  }

  /**
   * 获取key
   * @param key
   * @returns {string|string}
   * @private
   */
  function _getKey(key) {
    return _typeof(key) === 'String' ? key : JSON.stringify(key);
  }

  /**
   * 检查是否可用 0过期, 1有效, 2不符合格式
   * @param cacheItem
   * @returns {number} 0过期, 1有效, 2不符合格式
   * @private
   */
  function _checkEffective(cacheItem) {
    if (!_isCacheItem(cacheItem)) {
      return 2;
    }
    if (cacheItem.e === 0 || Date.now() < cacheItem.e) {
      return 1;
    }
    return 0;
  }

  /**
   * 添加/修改缓存数据
   * @param key
   * @param val
   * @param option
   * @returns {string|null}
   */
  function set(key, val, option) {
    key = _getKey(key);
    if (_typeof(val) === 'Undefined') {
      return del(key);
    }
    const cacheItem = _getCacheItem(val, option);
    try {
      webStorage.setItem(key, _jsonFormat.toString(cacheItem));
      return key;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * 获取缓存数据
   * @param key
   * @returns {null|any}
   */
  function get(key) {
    key = _getKey(key);
    const cacheItem = _jsonFormat.toJson(webStorage.getItem(key));
    const effectiveRst = _checkEffective(cacheItem);
    if (effectiveRst === 2) {
      return cacheItem;
    }
    if (effectiveRst === 1) {
      return cacheItem.v;
    }
    webStorage.removeItem(key);
    return null;
  }

  /**
   * 删除缓存数据
   * @param key
   * @returns {string}
   */
  function del(key) {
    key = _getKey(key);
    webStorage.removeItem(key);
    return key;
  }

  /**
   * 清空所有过期的缓存数据
   * @returns {*[]}
   */
  function clearExpires() {
    const length = webStorage.length;
    let deleteKeys = [];
    for (let i = 0; i < length; i++) {
      const key = webStorage.key(i);
      const cacheItem = _jsonFormat.toJson(webStorage.getItem(key));
      if (_checkEffective(cacheItem) === 0) {
        deleteKeys.push(key);
        webStorage.removeItem(key);
      }
    }
    return deleteKeys;
  }

  /**
   * 清空所有缓存数据
   */
  function clear() {
    webStorage.clear();
  }

  return {
    get,
    set,
    del,
    clearExpires,
    clear,
  };
}
