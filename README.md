# CompileNodeJS

**CompileNodeJS** uses `uglify-js`, `@babel/core`, `@babel/preset-react`, and `babel-minify` as a JavaScript and JSON parser, minifier, compressor, and beautifier toolkit.

## Table of Contents

- [Install](#install)
    - [Prerequisites](#prerequisites)
    - [From NPM for use as a command-line app](#from-npm-for-use-as-a-command-line-app)
    - [From NPM for programmatic use](#from-npm-for-programmatic-use)
    - [Add the build script to `package.json`](#add-the-build-script-to-packagejson)
- [Usage](#usage)
    - [Create a `build.js` file](#create-a-buildjs-file)
    - [Running the build](#running-the-build)

## Install

### Prerequisites

Ensure you have the latest version of [Node.js](http://nodejs.org/) installed. You may need to restart your computer after this step.

### From NPM for use as a command-line app:

```bash
npm install compile-nodejs -g
```

### From NPM for programmatic use:

```bash
npm install compile-nodejs
```

### Add the build script to `package.json`:

```json
"scripts": {
  "build": "node build.js"
}
```

## Usage

### Create a `build.js` file

Create a `build.js` file in the root of your project with the following contents:

```javascript
let compile = require("compile-nodejs");

async function main() {
    // Build all files from the 'build' directory
    await compile.buildDirectory(compile.source("build"));

    // Build and modify the package.json file
    await compile.buildPackage(compile.source("package.json"), compile.destiny("package.json"), function (_params) {
        delete _params.scripts.config; // Remove config script
        delete _params.scripts.build;  // Remove build script
        _params.scripts.start = "node index.js"; // Set start script
        return _params;
    });

    // Build and modify the .env file
    await compile.buildEnv(compile.source(".env"), compile.destiny(".env"), function (_params) {
        _params["PRODUCTION"] = true; // Set production environment
        _params["IP"] = "localhost";  // Set IP to localhost
        return _params;
    });

    // Build package-lock.json
    await compile.buildPackage(compile.source("package-lock.json"), compile.destiny("package-lock.json"));

    // Clone the web.config file
    await compile.cloneConfig(compile.source("web.config"), compile.destiny("web.config"));

    // Minify the index.js file
    await compile.buildMinify(compile.source("index.js"), compile.destiny("index.js"));

    // Minify all files in the 'public' directory
    await compile.iterateMinify(compile.source("public"), compile.destiny("public"));
}

// Execute the main build process
main().then(function () {
    console.log("Build process completed.");
}).catch(function (err) {
    console.error("Error during build process:", err);
});
```

### Running the build

Once the `build.js` file is created, you can run the build process by executing the following command:

```bash
npm run build
```

When the build process finishes, a folder named `build` will be created containing the compiled and minified files.
