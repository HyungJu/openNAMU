module.exports = function(req, n, ba){
  var fs = require('fs');
  var six = n;
  var today = getNow();
  var parseNamu = require('./namumark')
  var plugin = require('./plugin/plugin.js')
  var d = require('debug')('openNAMU:parser');
  var htmlencode = require('htmlencode');
  var katex = require('parse-katex');
  
  function getNow() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear();
  if(dd<10) {
      dd='0'+dd;
  }
  if(mm<10) {
      mm='0'+mm;
  }
  return yyyy+'/' + mm+'/'+dd;
  }
  
  six = six + '\r\n';
  six = six.replace(/<[Ss][Cc][Rr][Ii][Pp][Tt]>|<\/[Ss][Cc][Rr][Ii][Pp][Tt]>/g, "");
  six = six.replace(/<(.*) [Oo][Nn](.*)="(.*)">/g, "");
  six = six.replace(/[Jj][Aa][Vv][Aa][Ss][Cc][Rr][Ii][Pp][Tt]:/g, "");
  
  /* 모니위키 및 추가 파싱 부분 */
  
  six = six.replace(/\[\[[Yy][Oo][Uu][Tt][Uu][Bb][Ee]\(([^)]*)\)\]\]/g, "[youtube($1)]");
  six = six.replace(/\[\[[Ii][Nn][Cc][Ll][Uu][Dd][Ee]\(([^)]*)\)\]\]/g, "[include($1)]");
  
  six = six.replace(/\[\[목차\]\]/g, "[목차]");
  six = six.replace(/\[\[각주\]\]/g, "[각주]");
  
  six = six.replace(/[Aa][Tt][Tt][Aa][Cc][Hh][Mm][Ee][Nn][Tt]:((?:[^.]*)\.(?:[Jj][Pp][Gg]|[Pp][Nn][Gg]|[Gg][Ii][Ff]|[Jj][Pp][Ee][Gg]))/g, "http://rigvedawiki.net/w/%EC%95%84%EC%9D%B4%ED%8F%B0%207?action=download&value=$1");
  
  six = six.replace(/\[[Yy][Tt]\(([^)]*)\)\]/g, "[youtube($1)]");
  six = six.replace(/\[[Ii][Nn]\(([^)]*)\)\]/g, "[include($1)]");
  
  /* 끝 */
  
  var ohhhh = /\n>\s?((?:[^\n]*)(?:(?:(?:(?:\n>\s?)(?:[^\n]*))+)?))/;
  var read;
  while(true)
  {
	  if(read = ohhhh.exec(six))
	  {
		read[1] = read[1].replace(/\n>\s?/g, "\n");
		six = six.replace(ohhhh, "\n<blockquote>" + read[1] + "</blockquote>");
	  }
	  else
	  {
		  break;
	  }
  }
  
  six = six.replace(/##\s?([^\n]*)\n/g, "<div style='display:none;'>$1</div>");
  
  six = six.replace(/\[\[분류:([^\]\]]*)\]\]/g, "");
  
  var include = /\[[Ii][Nn][Cc][Ll][Uu][Dd][Ee]\(([^)]*)\)\]/;
  var under;
  while(true) {
	  if(under = include.exec(six)) {
		  if(req.params.page === under[1]) {
			  six = six.replace(include, "<a href=\"/w/$1\">$1</a>");
		  }
		  else if(fs.existsSync('./data/' + encodeURIComponent(under[1])+'.txt')) {
			var data = fs.readFileSync('./data/' + encodeURIComponent(under[1])+'.txt', 'utf8');
			parseNamu(req, data, function(cnt){
			six = six.replace(include, cnt);
			})
		  }
		  else {
			  six = six.replace(include, "<a class=\"not_thing\" href=\"/w/$1\">$1</a>");
		  }
	  }
	  else {
		  break;
	  }
  }
  
  var tong = /\[\[([^\]\]]*)\|([^\]\]]*)\]\]/;
  var tang = /\[\[([^\]\]]*)\]\]/;
  var match;
  var van;
  var test = /(.*)(#s-[0-9]+)$/;
  var testing;
  six = six.replace(/\[\[(?:([Hh][Tt][Tt][Pp][Ss]?:\/\/(?:(?:(?![Jj][Pp][Gg]|[Pp][Nn][Gg]|[Gg][Ii][Ff]|[Jj][Pp][Ee][Gg]))[^\s])*)\.([Jj][Pp][Gg]|[Pp][Nn][Gg]|[Gg][Ii][Ff]|[Jj][Pp][Ee][Gg]))\|([^\]\]]*)\]\]/g, "<a class#is#\"out_link\" href#is#\"$1#$2#\"><span class#is#\"contect\">外</span>$3</a>");
  six = six.replace(/\[\[(?:([Hh][Tt][Tt][Pp][Ss]?:\/\/(?:(?:(?![Jj][Pp][Gg]|[Pp][Nn][Gg]|[Gg][Ii][Ff]|[Jj][Pp][Ee][Gg]))[^\s])*)\.([Jj][Pp][Gg]|[Pp][Nn][Gg]|[Gg][Ii][Ff]|[Jj][Pp][Ee][Gg]))\]\]/g, "<a class#is#\"out_link\" href#is#\"$1#$2#\"><span class#is#\"contect\">外</span>$1#$2#</a>");
	
  six = six.replace(/\[\[([Hh][Tt][Tt][Pp][Ss]?:\/\/)([^\]\]]*)\|([^\]\]]*)\]\]/g, "<a class#is#\"out_link\" href#is#\"$1$2\"><span class#is#\"contect\">外</span>$3</a>");
  six = six.replace(/\[\[([Hh][Tt][Tt][Pp][Ss]?:\/\/)([^\]\]]*)\]\]/g, "<a class#is#\"out_link\" href#is#\"$1$2\"><span class#is#\"contect\">外</span>$1$2</a>");
  
  while(true) {
	if(match = tong.exec(six)) {
		van = '';
		if(match[1] === req.params.page) {
			six = six.replace(tong, '<b>'+match[2]+'</b>');
		}
		else if(testing = test.exec(match[1])) {
			if(!fs.existsSync('./data/' + encodeURIComponent(testing[1])+'.txt')) {
				van = van + 'class#is#"not_thing"';
			}
			six = six.replace(tong, '<a '+van+' title#is#"'+htmlencode.htmlEncode(testing[1])+testing[2]+'" href#is#"/w/'+encodeURIComponent(testing[1])+testing[2]+'">'+match[2]+'</a>');
		}
		else {
			if(!fs.existsSync('./data/' + encodeURIComponent(match[1])+'.txt')) {
				van = van + 'class#is#"not_thing"';
			}
			six = six.replace(tong, '<a '+van+' title#is#"'+htmlencode.htmlEncode(match[1])+'" href#is#"/w/'+encodeURIComponent(match[1])+'">'+match[2]+'</a>');
		}
	}
	else {
		break;
	}
  }
  while(true) {
	if(match = tang.exec(six)) {
		van = '';
		if(match[1] === req.params.page) {
			six = six.replace(tang, '<b>'+match[1]+'</b>');
		}
		else if(testing = test.exec(match[1])) {
			if(!fs.existsSync('./data/' + encodeURIComponent(testing[1])+'.txt')) {
				van = van + 'class#is#"not_thing"';
			}
			six = six.replace(tang, '<a '+van+' title#is#"'+htmlencode.htmlEncode(testing[1]+testing[2])+'" href#is#"/w/'+encodeURIComponent(testing[1])+testing[2]+'">'+match[1]+'</a>');
		}
		else {
			if(!fs.existsSync('./data/' + encodeURIComponent(match[1])+'.txt')) {
				van = van + 'class#is#"not_thing"';
			}
			six = six.replace(tang, '<a '+van+' title#is#"'+htmlencode.htmlEncode(match[1])+'" href#is#"/w/'+encodeURIComponent(match[1])+'">'+match[1]+'</a>');
		}
	}
	else {
		break;
	}
  }
  
  var h = /(={1,6})\s?([^=]*)\s?(?:={1,6})\r\n/;
  var h0c = 0;
  var h1c = 0;
  var h2c = 0;
  var h3c = 0;
  var h4c = 0;
  var h5c = 0;
  var last = 0;
  var head;
  var toc;
  var wiki;
  var rtoc = '<div id="toc"><span id="toc-name">목차</span><br><br>';
  while(true) {
	  if(head = h.exec(six)) {
		  wiki = head[1].length;
		  if(last < wiki) {
			  last = wiki;
		  }
		  else {
			  last = wiki;
			  if(wiki === 1) {
				h1c = 0;
				h2c = 0;
				h3c = 0;
				h4c = 0;
				h5c = 0;
			  } else if(wiki === 2) {
				h2c = 0;
				h3c = 0;
				h4c = 0;
				h5c = 0;
			  } else if(wiki === 3) {
				h3c = 0;
				h4c = 0;
				h5c = 0;
			  } else if(wiki === 4) {
				h4c = 0;
				h5c = 0;
			  } else if(wiki === 5) {
				h4c = 0;
			  }
		  }
		  if(wiki === 1) {
				h0c = h0c + 1;
		  } else if(wiki === 2) {
		        h1c = h1c + 1;
		  } else if(wiki === 3) {
		        h2c = h2c + 1;
		  } else if(wiki === 4) {
		        h3c = h3c + 1;
		  } else if(wiki === 5) {
		        h4c = h4c + 1;
		  } else {
		        h5c = h5c + 1;
		  }
		  toc = h0c + '.' + h1c + '.' + h2c + '.' + h3c + '.' + h4c + '.' + h5c + '.';
		  toc = toc.replace(/1(0(?:[0]*)?)\./g, '1$1#.');
	      toc = toc.replace(/0\./g, '');
		  toc = toc.replace(/#\./g, '.');
	      toc = toc.replace(/(.*)\./g, '$1');
		  rtoc = rtoc + '<a href="#s-' + toc + '">' + toc + '</a>. ' + head[2] + '<br>';
		  six = six.replace(h, '<h'+wiki+'><a href="#toc" id="s-' + toc + '">' + toc + '.</a> $2</h'+wiki+'>');
	  } else {
		  rtoc = rtoc + '</div>';
		  break;
	  }
  }

  six = six.replace(/#is#/g, '=');
  rtoc = rtoc.replace(/#is#/g, '=');

  six = six.replace(/\[목차\]/g, rtoc);
  
  six = six.replace(/'''(.+?)'''(?!')/g,'<strong>$1</strong>');
  six = six.replace(/''(.+?)''(?!')/g,'<i>$1</i>');
  six = six.replace(/~~(.+?)~~(?!~)/g,'<s>$1</s>');
  six = six.replace(/--(.+?)--(?!-)/g,'<s>$1</s>');
  six = six.replace(/__(.+?)__(?!_)/g,'<u>$1</u>');
  six = six.replace(/\^\^(.+?)\^\^(?!\^)/g,'<sup>$1</sup>');
  six = six.replace(/,,(.+?),,(?!,)/g,'<sub>$1</sub>');
  
  six = six.replace(/\[[Bb][Rr]\]/ig,'<br>');
  
  six = six.replace(/{{\|((?:[^|]*)\n?(?:(?:(?:(?:(?:[^|]*)(?:\n)?)+))))\|}}/g, "<table><tbody><tr><td>$1</td></tr></tbody></table>");
  
  six = six.replace(/([Hh][Tt][Tt][Pp][Ss]?:\/\/(?:(?:(?:(?!\.[Jj][Pp][Gg]|\.[Pp][Nn][Gg]|\.[Gg][Ii][Ff]|\.[Jj][Pp][Ee][Gg]))[^\s])*)\.(?:[Jj][Pp][Gg]|[Pp][Nn][Gg]|[Gg][Ii][Ff]|[Jj][Pp][Ee][Gg]))(?:\?([^&\n]*))?(?:\&([^&\n]*))?(?:\&([^&\n]*))?/g, '<img src="$1" $2 $3 $4><hr style="display: inline;">');
  
  six = six.replace(/#([Jj][Pp][Gg])#/g, '.$1');
  six = six.replace(/#([Jj][Ee][Pp][Gg])#/g, '.$1');
  six = six.replace(/#([Pp][Nn][Gg])#/g, '.$1');
  six = six.replace(/#([Gg][Ii][Ff])#/g, '.$1');
  
  var youtube = /\[youtube\(([^,\n]*)(?:,([^)\n]*))?\)\]/;
  var widthy = /width=([0-9]*)/;
  var heighty = /height=([0-9]*)/;
  var matchy;
  var matchy2;
  var matchy3;
  
  while(true) {
	  if(matchy = youtube.exec(six)) {
		  var ytw = 0;
		  var yth = 0;
		  if(matchy2 = widthy.exec(matchy)) {
				ytw = 'width='+matchy2[1];
		  }
		  else {
			  ytw = 'width=500';
		  }
		  if(matchy3 = heighty.exec(matchy)) {
				yth = 'height='+matchy3[1];
		  }
		  else {
			  yth = 'height=300';
		  }
		  six = six.replace(youtube, '<iframe '+ytw+' '+yth+' src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>');
	  }
	  else {
		  break;
	  }
  }
  
  six = six.replace(/\[[Dd][Aa][Tt][Ee]\]/g, today);
  six = six.replace(/\[[Dd][Aa][Tt][Ee][Tt][Ii][Mm][Ee]\]/g, today);
  
  six = six.replace(/\[[Aa][Nn][Cc][Hh][Oo][Rr]\(([^\[\]]*)\)\]/g, "<div id=\"$1\"></div>");
  
  var bad = /((?:(?:\s\*\s[^\n]*)\n?)+)/;
  var apple;
  var reimu = /\s\*\s([^\n]*)/g;
  
  while(true) {
	  if(apple = bad.exec(six)) {
		  apple[1] = apple[1].replace(reimu, '<li>$1</li>');
		  apple[1] = apple[1].replace(/\n/g, '');
		  six = six.replace(bad, '<ul id="list">'+apple[1]+'</ul>');
	  }
	  else {
		  break;
	  }
  }
  
  six = six.replace(/-{4,11}/g, "<hr>");
  
  var a = 1;
  var b = /\[\*([^\s]*)\s((?:[^\[\]]+)*)\]/;
  var tou = "<hr id='footnote'><div class='wiki-macro-footnote'><br>";
  
  while(true)
  {
	  match = b.exec(six);
	  if(match === null)
	  {
		  tou = tou + '</div>';
		  if(tou === "<hr id='footnote'><div class='wiki-macro-footnote'><br></div>")
		  {
			  tou = "<div class='wiki-macro-footnote'><br></div>";
		  }
		  break; 
	  }
	  else if(match[1]) {
		tou = tou + "<span class='footnote-list'><a href=\"#rfn-" + a + "\" id=\"fn-" + a + "\">[" + htmlencode.htmlEncode(match[1]) + "]</a> " + match[2] + "</span><br>";
		six = six.replace(b, "<sup><a href='javascript:void(0);' id=\"rfn-" + a + "\" onclick=\"var f=document.getElementById('footnote_"+a+"');var s=f.style.display=='inline';f.style.display=s?'none':'inline';this.className=s?'':'opened';\">[" + htmlencode.htmlEncode(match[1]) + "]</a></sup><span class='foot' id='footnote_"+a+"' style='display:none;'><a href=\"#fn-" + a + "\" onclick=\"var f=document.getElementById('footnote_"+a+"');var s=f.style.display=='inline';f.style.display=s?'none':'inline';this.className=s?'':'opened';\">[" + htmlencode.htmlEncode(match[1]) + "]</a> <a href='javascript:void(0);' onclick=\"var f=document.getElementById('footnote_"+a+"');var s=f.style.display=='inline';f.style.display=s?'none':'inline';this.className=s?'':'opened';\">[X]</a> " + match[2] + "</span>");
		a = a + 1;
	  }
	  else
	  {
		tou = tou + "<span class='footnote-list'><a href=\"#rfn-" + a + "\" id=\"fn-" + a + "\">[" + a + "]</a> " + match[2] + "</span><br>";
		six = six.replace(b, "<sup><a href='javascript:void(0);' id=\"rfn-" + a + "\" onclick=\"var f=document.getElementById('footnote_"+a+"');var s=f.style.display=='inline';f.style.display=s?'none':'inline';this.className=s?'':'opened';\">[" + a + "]</a></sup><span class='foot' id='footnote_"+a+"' style='display:none;'><a href=\"#fn-" + a + "\" onclick=\"var f=document.getElementById('footnote_"+a+"');var s=f.style.display=='inline';f.style.display=s?'none':'inline';this.className=s?'':'opened';\">[" + a + "]</a> <a href='javascript:void(0);' onclick=\"var f=document.getElementById('footnote_"+a+"');var s=f.style.display=='inline';f.style.display=s?'none':'inline';this.className=s?'':'opened';\">[X]</a> " + match[2] + "</span>");
		a = a + 1;
	  }
  }
 
  var math = /<[Mm][Aa][Tt][Hh]>(((?!<math>).)*)<\/[Mm][Aa][Tt][Hh]>/;
  var mathm;
  var matht;
  while(true)
  {
	  if(mathm = math.exec(six)) {	  
		  mathm[1] = '$' + mathm[1] + '$'
		  var matht = katex.renderLaTeX(mathm[1]);
		  six = six.replace(math, matht)
	  }
	  else {
		  break;
	  }
  }
  
  six = six.replace(/\r\n\s/g, '<br><span id="in"></span>');
  
  six = six.replace(/\n/g, "<br>");
  
  six = six.replace(/\[각주\](((<br>+)*(\s+)*(\n+))+)?$/g, "");
  six = six.replace(/\[각주\]/g, "<br>" + tou);
  six = six + tou;
  d('1: '+six)
  six = plugin(six);
  ba(six)
  
  // Thank for 2DU, LiteHell //
}
function doNothing(a) {}