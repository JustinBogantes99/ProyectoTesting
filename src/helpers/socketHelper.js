var io = null;

exports.set = function (socket) {
    io = socket;
    return;
};

exports.get = function () {
    return io;
};