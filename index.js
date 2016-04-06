'use strict';

var Buffer = require('buffer').Buffer;

var EncodeDecode = function (params) {
    this.sizeLength = 4;
    this.size = undefined;
    this.tail = undefined;
    this.decodeHandler = undefined;
};

EncodeDecode.prototype.registerDecodeHandler = function (handler) {
    this.decodeHandler = handler;
};

EncodeDecode.prototype.decode = function (buffer) {
    var size = this.size;

    if (this.tail) {
        buffer = Buffer.concat([this.tail, buffer], this.tail.length + buffer.length);
        delete this.tail;
    }

    if (size) {
        if (buffer.length >= size) {
            this.decodeHandler(buffer.slice(0, size));
            delete this.size;
            if (buffer.length !== size) {
                this.decode(buffer.slice(size));
            }
            return;
        }
    } else {
        if (buffer.length >= this.sizeLength) {
            this.size = buffer.readUInt32BE(0);
            if (buffer.length !== this.sizeLength) {
                this.decode(buffer.slice(this.sizeLength));
            }
            return;
        }
    }
    this.tail = buffer;
};

EncodeDecode.prototype.encode = function (data) {
    data = data.toBuffer();
    var sizeLength = this.sizeLength;
    var dataLength = data.length;
    var size = new Buffer(sizeLength);
    size.writeInt32BE(dataLength, 0);
    return Buffer.concat([size, data], sizeLength + dataLength);
};

module.exports = EncodeDecode;
