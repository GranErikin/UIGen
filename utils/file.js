const tmp = require("tmp");
const fs = require("fs");

function writeTmpFileSync(content, postfix) {
	let tmpFile = tmp.fileSync({ prefix: '', postfix });
	fs.writeFileSync(tmpFile.name, content);
	return tmpFile.name;
}

module.exports={writeTmpFileSync};