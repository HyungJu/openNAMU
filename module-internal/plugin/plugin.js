module.exports = function(six){
var fs = require('fs');
var list = './plugin.json'
var obj = require(list);

var length = obj['plugin'].length;

for (i=0; i < length; i++){
	
var pluginsrc = require('./'+obj['plugin'][i]+'/plugin');
var plugininfo = require('./'+obj['plugin'][i]+'/'+obj['plugin'][i]+'.json');
var information = plugininfo['info'];
var development = plugininfo['status'];
if(development == "stable")
	six = pluginsrc(six);
else if (development == "unstable" || development == "experimental" )
	var exists = fs.existsSync('./setting/Plugin.txt');
	if(exists) {
		allowp = fs.readFileSync('./setting/Plugin.txt', 'utf8');
	}
	else {
		allowp = "false";
	}
	if(allowp == "true")
		six = pluginsrc(six);
	
		
}
return six;
}

