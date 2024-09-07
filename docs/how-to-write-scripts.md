# How to write scripts?

In this tutorial we will set up our environment and write
simple huzuni script!

## Requirements

- JavaScript knowledge
- Visual Studio Code or other editor with Language Server Protocol (you'll thank me later)
- grit
- `http-server` or other software that can start HTTP file server `php -S` will do

## Getting started

1. Create directory with name like `my-awesome-script` it will serve as your workspace
2. Download rkgk-huzuni repository as zip or clone it
3. Go to `dist` and copy `types` directory to your workspace
4. Create `index.js`
5. Start web server
6. Go to `huzuni menu` in top left corner of rkgk
7. Then visit `Live Code Reload` tab
8. Paste url to web server with index.js added at the end e.x. `http://127.0.0.1:8080/index.js`
9. Show console in browser, it wlll be useful

## Code

Generally, each script is executed as JavaScript function, so to adhere
to this requirement we will need to return some value at the end.

Due to architecture or rkgk-huzuni, we will create a class and then
return it, so internals can use it to set everything up for us.

```typescript
// ==Huzuni Script==
// @name Hello world!
// @author Firstbober
// @description A simple hello world script
// ==Huzuni Script==

/**
 * Types for autocomplete with LSP:
 * @typedef {import("./types/huzuni-api").HuzuniAPI} HuzuniAPI
 */

class Script {
  /**
   * @param {HuzuniAPI} api
   */
  start(api) {
    console.warn("hello world from script!");
  }
  stop() {

  }
}

// Always return Script class at the end!
return Script;
```

This simple script will start executing from `start(api)` and if user
disables it then we will go to `stop()`.

Worth noting that `api` exposes a variable named `enabled`. It is required
for proper callback handling right now.

## Does it work?

If everything worked out, then you'll see a warn in console with
out message! yay!

## What's next?

Take a look at [internal scripts](https://github.com/Firstbober/rkgk-huzuni/tree/master/src/rkgk-huzuni/scripts)
and types for [HuzuniAPI](https://github.com/Firstbober/rkgk-huzuni/blob/master/dist/types/huzuni-api.d.ts) it will
give an great insight to what you can use.

Currently there is no solid readable documentation.
