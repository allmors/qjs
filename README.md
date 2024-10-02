# 什么是qjs?

**qjs**是一个基于**fastify**实现的轻量框架，通过使用`约定式`来进行api的快速生成，如果你想快速使用nodejs进行`RESTful API`开发，那么**qjs**是一个非常不错的选择

是否有集成案例？当然有，该框架我在内部项目已经使用已久，目前修复了一版并进行开源，以下是集成了qjs的相关项目

- [text2img](https://text2img.vip)
- ......

### 快速开始

```
npx create-qjs qjs-app && cd qjs-qpp
```

```
npm run start
```

### 项目结构

```js
qjs-app/
│
├── db/                 # 数据库 (调用db接口才会创建)
│
├── functions/          # 云函数或其他功能模块（重点）
│
├── public/             # 对外公开目录
│
├── node_modules/       # 依赖包目录
│
├── package.json        # 项目配置文件
│
├── package-lock.json   # 依赖版本信息
└── README.md           # 项目说明文件        
```

### 如何使用？

通过上面的命令，你已经创建好了qjs项目，现在我们来一个个的分析：

- `package.json`
  
  该目录里面的start命令是一个关键点，让我们看看里面启动命令：
  
  ```json
  "scripts": {
    "start": "cross-env QJS_ROOTDIR=functions QJS_PORT=5173 QJS_PREFIX=/api QJS_STATIC=public run-qjs --init"
  }
  ```
  
  - `QJS_PREFIX`:路由前缀
    
    ```js
    QJS_PREFIX=/api
    
    // route
    host:port/{QJS_PREFIX}/hello
    ```
    
  - `QJS_PORT`:qjs项目运行端口
    
  - `QJS_STATIC`:公开目录
    
  - `QJS_ROOTDIR`:云函数目录，你使用最频繁的地方，具体看**functions**
    
- `functions`
  
  该目录为核心目录，如果你按照上面的命令进行创建并启动项目，那么qjs会自动创建functions目录，该目录为约定式api所在位置，其以文件名为api地址
  
  ```js
  functions/
  │
  ├── hello._id.dash._name.mjs  # host:port/{QJS_PREFIX}/hello/{id}/dash/{name}
  │
  ├── hello.mjs                 # host:port/{QJS_PREFIX}/hello
  │
  ├── (DIR)                     # 以`()`包裹的为路由组，默认排除
  │   └── qjs.mjs               # host:port/{QJS_PREFIX}/qjs
  │
  └── DIR                       
      └── hello.mjs               # host:port/{QJS_PREFIX}/{DIR}/hello
  ```
  

### 函数相关

下面是默认函数示例：

```js
// functions/qjs.mjs

// @see https://github.com/allmors/qjs/
// import qjs from '@allmors/qjs/core';

export default async function (params, ctx) {
    // const User = await qjs.db.collection('user');
    // const user = await User.insertOne({ name: "Sam", email: 'sam@codingsamrat.com' })

    // or 

    const User = await this.db.collection('user');
    const user = await User.insertOne({ name: "Sam", email: 'sam@codingsamrat.com' })
    // ......

    return ctx.reply.send({
        message: 'Hello from qjs API',
        method: context.method,
        params: {
            ...user
        }
    });
}
```

- `params`:
  
  - params.params `host:port/${QJS_PREFIX}/qjs/:id/:name`
    
  - params.query `host:port/${QJS_PREFIX}/qjs?id=1321`
    
  - params.body `host:port/${QJS_PREFIX}/qjs`==> `POST/PUT Method`
    
- ctx
  
  - ctx.method
    
  - ctx.headers
    
  - ctx.reply
    
  - ...ctx
    

***ctx完美继承了fastify，如果有需要，请查询fasify官方文档***

示例中你可能看到了两段被注释的代码

```js
// functions/qjs.mjs

// import qjs from '@allmors/qjs/core';
// const User = await qjs.db.collection('user');
// const user = await User.insertOne({ name: "Sam", email: 'sam@codingsamrat.com' })

// or 

// const User = await this.db.collection('user');
// const user = await User.insertOne({ name: "Sam", email: 'sam@codingsamrat.com' })
// ......
```

为什么出现这两个，其实上面两段代码最终结果一样，因为qjs为了方便开发者提供了两套使用方案，你可以通过导入`core`包进行操作，或者直接使用`this`

**qjs目前暴露了两个接口，一个是db另一个是files，它们见名知意，就是数据库的操作和文件操作**

### 数据库相关

qjs使用**bson**进行数据存储，以下是qjs数据库提供的相关操作，请记住，fastify严格使用(`async/await`)

```js
db.collection(collectionName)
db.listCollection()
```

```js
await Collection.find(query, option)
await Collection.findOne(query)
await Collection.findById(_id)

await Collection.create(document)
await Collection.insertOne(document)
await Collection.insertMany(documents)

await Collection.deleteOne(query)
await Collection.deleteMany(query)
await Collection.findByIdAndDelete(_id)

await Collection.updateOne(query, payload, option)
await Collection.updateMany(query, payload)
await Collection.findByIdAndUpdate(_if, payload, option)

await Collection.export()

await Collection.count()
await Collection.drop()
await Collection.rename()
```

### 文件相关

目前qjs提供了文件相关的两个方法，分别是：

- upload()
  
  ```js
  /*
  * @fileObj File
  * @name string
  * @options Object
  * @options?.addOptons
  */
  async this.files.upload(fileObj:File, options = {})
  ```
  
- delete()
  
  ```js
  /*
  * @params {_id:string}
  */
  async this.files.delete(params = {})
  ```
  

### JWT鉴权

qjs既然是轻量化的接口框架，当然也提供了JWT相关，目前qjs提供了以下与jwt相关的方法，qjs-jwt继承[fast-jwt](https://nearform.github.io/fast-jwt/docs/api/)

- sign()
  
  ```js
  /*
  * @payload {name:"张三",...} as Object
  */
  async this.jwt.sign(payload:Object)
  ```
  
- verify()
  
  ```js
  /*
  * @token string
  */
  async this.jwt.verify(token:string)
  ```
  
- Beare Token
  
  ```js
  //继承在云函数的ctx中
  export default async function (params, ctx) {
         ctx.user
  }
  ```
  

### 完整示例

```js
/**
 * @param {*} params
 * @ctx {request,reply,method,headers}
 * @see https://github.com/allmors/qjs
 */
export default async function (params, ctx) {
    /**
     * use db
     */
    const sql = await this.db.collection('_files')

    try {
        /**
         * if(ctx.method === 'PUT') {}
         * if(ctx.method === 'DELETE') {}
         * if(ctx.method === 'GET') {}
         */
        if (ctx.method === 'POST') {
            const { file } = params
            const res = await this.files.upload(file)
            return ctx.reply.send({
                message: 'Hello from test APIssfwe',
                method: ctx.method,
                params: {
                    ...res
                }
            });
        }

        // get files
        const file = await sql.findById(params.id);
        // const t = await qjs.files.delete({ _id: params.id });

        const token = await this.jwt.sign({ name: 'test' });

        // verify = user
        const verify = await this.jwt.verify(token);
        // const user = ctx.user

        return ctx.reply.send({
            message: 'Hello from test API',
            method: ctx.method,
            params: {
                token,
                verify,
                file
            }
        })
    } catch (error) {
        throw new Error(error)
    }
}
```

### 响应

```json
{
    "message": "Hello from test API",
    "method": "GET",
    "params": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdCIsImlhdCI6MTcyNzY1OTkyMn0.iC3m9WyOHdXVHbybiLveIxXaI7oX4Gu1dQWo7hotAT4",
        "verify": {
            "name": "test",
            "iat": 1727659922
        },
        "file": {
            "_id": "66f9fb5b00e6f64eb8b8fdb7",
            "url": "/uploads/05942efe-071e-42-1727658843191/deKGMl9.jpg",
            "name": "deKGMl9.jpg",
            "type": "image/jpeg",
            "size": 360969
        }
    }
}
```