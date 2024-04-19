const fs = require("fs");

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (!err) {
            console.log(`successfully deleted ${filePath}`);
        } else {
            throw err;
        }
    });
};

exports.deleteFile = deleteFile;
