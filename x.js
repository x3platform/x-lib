"use strict";
var x = require("./src/core");
var color = require("./src/color");
var encoding = require("./src/encoding");
var string = require("./src/string");
var time = require("./src/time");
module.exports = x.ext(x, {
    color: color,
    encoding: encoding,
    string: string,
    time: time
});