"use strict";

const fs = require("fs/promises");
const path = require("path");

const UglifyJS = require("uglify-js");
const {transformFileSync} = require("@babel/core");

const minify = require("babel-minify");

const source = function (_route) {
    return path.join(__dirname, "..", "..", _route);
};

const destiny = function (_route) {
    return path.join(__dirname, "..", "..", "build", _route);
};

async function isExists(_path) {
    try {
        await fs.access(_path);
        return true;
    } catch {
        return false;
    }
}

async function buildDirectory(_path) {
    const exist = await isExists(_path);
    if (!exist) await fs.mkdir(_path, {recursive: true});
}

async function buildMinify(_source, _destiny) {
    let dirname = path.dirname(_destiny);
    await buildDirectory(dirname);
    let data = await fs.readFile(_source, "utf8");
    try {
        let result = UglifyJS.minify(data.trim());
        await fs.writeFile(_destiny, result.code);
    } catch (e) {
        const transformedCode = transformFileSync(_source, {
            presets: [require("@babel/preset-react")]
        }).code;
        const result = await minify(transformedCode);
        await fs.writeFile(_destiny, result.code);
    }
}

async function buildMinifyCss(_source, _destiny) {
    let dirname = path.dirname(_destiny);
    await buildDirectory(dirname);
    let data = await fs.readFile(_source, "utf8");
    const minifiedCss = data.replace(/\s+/g, " ")
        .replace(/\/\*.*?\*\//g, "")
        .replace(/(\s*([:;,{}])\s*)/g, "$2");
    await fs.writeFile(_destiny, minifiedCss);
}

async function cloneConfig(_source, _destiny) {
    let dirname = path.dirname(_destiny);
    await buildDirectory(dirname);
    await fs.copyFile(_source, _destiny);
}

async function iterateMinify(_source, _destiny) {
    let _src = await fs.readdir(_source);
    _src.map(async function (_path) {
        const sourcePath = path.join(_source, _path);
        const destinyPath = path.join(_destiny, _path);
        let file = await fs.stat(sourcePath);
        if (file.isFile()) {
            let file = sourcePath.split(".").pop();
            switch (file) {
                case "js":
                    await buildMinify(sourcePath, destinyPath);
                    break;
                case "json":
                    await buildPackage(sourcePath, destinyPath);
                    break;
                case "css":
                    await buildMinifyCss(sourcePath, destinyPath);
                    break;
                default:
                    await cloneConfig(sourcePath, destinyPath);
                    break;
            }
        }
        if (file.isDirectory()) {
            await buildDirectory(destinyPath);
            await iterateMinify(sourcePath, destinyPath);
        }
    });
}

async function buildPackage(_source, _destiny, _fn) {
    await cloneConfig(_source, _destiny);
    let data = await fs.readFile(_source);
    if (data) {
        let packageJsonObj = JSON.parse(data);
        if (typeof _fn == "function") packageJsonObj = await _fn(packageJsonObj);
        packageJsonObj = JSON.stringify(packageJsonObj);
        await fs.writeFile(_destiny, packageJsonObj);
    }
}

async function buildEnv(_source, _destiny, _fn) {
    await cloneConfig(_source, _destiny);
    let resource = await fs.readFile(_source, "utf8");
    if (resource) {
        if (typeof _fn == "function") {
            const json = {};
            resource.split("\n").forEach(line => {
                let [key, value] = line.split("=");
                json[key] = value;
            });
            resource = await _fn(json);
            let params = "";
            for (const key in resource) {
                params += json[key] ? `${key}=${json[key]}\n` : "\n";
            }
            resource = params;
        }
        await fs.writeFile(_destiny, resource);
    }
}

/***
 * async function main() {
 * await buildDirectory(source("build"));
 * await iterateMinify(source("environments"), destiny("environments"));
 * await buildPackage(source("package.json"), destiny("package.json"), function (_params) {
 delete _params.scripts.config;
 delete _params.scripts.build;
 _params.scripts.start = "node index.js";
 return _params;
 });
 * await buildPackage(source("package-lock.json"), destiny("package-lock.json"));
 * await cloneConfig(source("web.config"), destiny("web.config"));
 * await buildMinify(source("index.js"), destiny("index.js"));
 * await iterateMinify(source("src"), destiny("src"));
 * await iterateMinify(source("uploads"), destiny("uploads"));
 * }
 ***/

module.exports = {
    source,
    destiny,
    buildDirectory,
    iterateMinify,
    buildPackage,
    cloneConfig,
    buildMinify,
    buildEnv
};
