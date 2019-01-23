const exec = require('child_process');
const fs = require('fs');

const script_path = '../lesari/publish.sh'; 

function publishDemo() {
	return exec(script_path + ' ');
}

function publish() {
	return exec(script_path)
}

function convertAndSave() {
	return new Promise((resolve, reject) => {
		
	});
}

exports.publishDemo = (req, res) => {

}