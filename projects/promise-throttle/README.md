# @packageforge/promise-throttle

A TypeScript promise throttle to limit the number of open promises at any given time. Typical use is to keep the number of http requests to a server at a time to a reasonable number.

Add the package to your project on the command line:
```
npm install @packageforge/promise-throttle --save
```

Import the `PromiseThrottle` class into your code file:
```typescript
import { PromiseThrottle } from '@packageforge/promise-throttle';
```

Say you have a function that makes HTTP requests using Promise:
```typescript
// Typical Promise wrapper around JSON http request
function makeJsonReqeust(url){
  return new Promise((resolve,reject)=>{
    const request=http.get(url,response=>{
      const chunks:string[]=[];
      response.on("data",chunk=>{
        chunks.push(chunk);
      });
      response.on("end",()=>{
        const contents=chunks.join("");
        if (response.statusCode===200)
          resolve(JSON.parse(contents));
        else
          reject(contents);
      });
    });
    request.on("error",reject);
  });
}
```

And say you had 100 urls to get:
```typescript
const jsonUrls:string[]=[];
for (let i=0;i<100;i++)
  jsonUrls.push("/path/data_"+i+".json");
```

The following would make 100 simultaneous HTTP requests:
```typescript
jsonUrls.forEach(url=>makeJsonReqeust(url).then(data=>console.log(data)));
```

To limit the number of simultaneous HTTP requests to 5, use PromiseThrottle:
```typescript
const throttle=new PromiseThrottle(5);
jsonUrls.forEach(url=>throttle.add(()=>makeJsonReqeust(url)).then(data=>console.log(data)));
```

To alter the throttle value at any time:
```typescript
// Say the count property is 5, there are 5 open requests, and 12 queued requests.
throttle.count=10;
// There are now 10 open requests, and 7 queued requests.
```

To flush the queue at any time:
```typescript
// Say the count property is 5, there are 5 open requests, and 12 queued requests.
throttle.flush();
// There are now 17 open requests, and 0 queued requests.
// New promises added are queued until there are less than 5 open requests.
```

By default, the throttle is -1 (unlimited).

Additional arguments are curried, so an index can be preserved like so:
```typescript
const throttle=new PromiseThrottle(5);
for (let i=0;i<100;i++)
  throttle.add(index=>makeJsonReqeust("/path/data_"+index+".json"),i).then(data=>console.log(data)));
// Note that i is curried as index.
```
