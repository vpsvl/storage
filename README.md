# HTML5 storage

## 1. 安装

#### npm包

```
// use npm
npm install --save-dev @vpsvl/storage
// use yarn
yarn add --dev @vpsvl/storage
// use pnpm
pnpm add -D @vpsvl/storage
```

#### script引入

`createStorage` 会被注册为一个全局变量

```
<script src="https://unpkg.com/@vpsvl/storage@1.0.0"></script>
```

## 2. 使用

```
import createStorage from '@vpsvl/storage'

export const storageLocal = createStorage()
export const storageSession = createStorage('sessionStorage')
```

## 3. API

#### createStorage(storage)

创建对应storage对象

* storage: 可选. String, 创建storage的类型, 值为localStorage或sessionStorage, 默认为localStorage

#### storage.set(key, val, option)

设置storage对应key的值

* key: 必选. storage存储的key
* val: 可选. undefined会删除对应的key
* option: 可选. Object, 过期时间, 对应key => date: 日期; second,hour,day,month: number

#### storage.get(key)

获取storage对应key的值, 过期数据会被删除并返回null

* key: 必选. storage存储的key

#### storage.del(key)

删除storage对应key的值

* key: 必选. storage存储的key

#### storage.clearExpires()

清空所有过期的缓存数据

#### storage.clear()

清空所有缓存数据
