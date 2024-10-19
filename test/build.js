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
