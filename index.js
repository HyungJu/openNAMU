var express = require('express');
var router = express.Router();
var parseNamu = require('./module-internal/namumark')
var fs = require('fs');
var htmlencode = require('htmlencode');
var Diff = require('text-diff');
var Cokies = require( "js-cookie" )
var Cookies = require( "cookies" )
var sha3_512 = require('js-sha3').sha3_512;
var licen;
var name;
var FrontPage;
// 라이선스
function rlicen(licen) {
	var exists = fs.existsSync('./setting/License.txt');
	if(exists) {
		licen = fs.readFileSync('./setting/License.txt', 'utf8');
	}
	else {
		licen = "CC ZERO";
	}
	return licen;
}
// 위키 이름
function rname(name) {
	var exists = fs.existsSync('./setting/WikiName.txt');
	if(exists) {
		name = fs.readFileSync('./setting/WikiName.txt', 'utf8');
	}
	else {
		name = "오픈나무";
	}
	return name;
}
// 대문
function rFrontPage(FrontPage) {
	var exists = fs.existsSync('./setting/FrontPage.txt');
	
	if(exists) {
		FrontPage = fs.readFileSync('./setting/FrontPage.txt', 'utf8');
	}
	else {
		FrontPage = "FrontPage";
	}
	return FrontPage;
}
// 시간
function getNow() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear();
  var nn = today.getHours();
  var aa = today.getMinutes();
  var ee = today.getSeconds();
  if(dd<10) {
	  dd='0'+dd;
  }
  if(mm<10) {
	  mm='0'+mm;
  }
 if(aa<10) {
	  aa='0'+aa;
  }
  if(ee<10) {
	  ee='0'+ee;
  }
  if(nn/12>=1) {
	  if(nn<10) {
		  nn='0'+nn;
	  }
	  nn= 'PM ' + nn%12;						
  }
  else {
	  if(nn<10) {
		  nn='0'+nn;
	  }
	  nn= 'AM ' + nn;
  }
  return yyyy+'-' + mm+'-'+dd+' / '+nn+':'+aa+':'+ee;
}
// 아이피
function yourip(req, res) {
	var test = (req.headers['x-forwarded-for'] || '').split(',')[0] 
        || req.connection.remoteAddress;
		
	var cookies = new Cookies( req, res )
	, AqoursGanbaRuby, WikiID
	
	if(cookies.get( "WikiID" ) && cookies.get( "AqoursGanbaRuby" )) {
		id = cookies.get( "WikiID" );
		pw = cookies.get( "AqoursGanbaRuby" );
		
		var exists = fs.existsSync('./user/' + id + '.txt');
		if(exists) {
			var pass = fs.readFileSync('./user/' + id + '.txt', 'utf8');
			var test = pw;

			if(pass === test) {
				test = decodeURIComponent(id);
			}
			else {
				cookies.set( "AqoursGanbaRuby", '', { maxAge: 60 * 60 * 24 * 7 } )
				cookies.set( "WikiID", '', { maxAge: 60 * 60 * 24 * 7 } )
			}
		}
		else {
			cookies.set( "AqoursGanbaRuby", '', { maxAge: 60 * 60 * 24 * 7 } )
			cookies.set( "WikiID", '', { maxAge: 60 * 60 * 24 * 7 } )
		}
	}
	return test;
}
// 로그인 부분 display
function loginy(req,res) {
	var cookies = new Cookies( req, res )
	, AqoursGanbaRuby, WikiID
	
	if(cookies.get( "WikiID" ) && cookies.get( "AqoursGanbaRuby" )) {
		var dis2 = 'none';
	}
	return dis2;
}
// 밴
function stop(ip) {
    var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
	
	if(exists) {
		res.send('<script type="text/javascript">alert("밴 당한 상태 입니다.");</script>')
	}
}
// acl
function editstop(ip, page) {
	var exists = fs.existsSync('./data/' + encodeURIComponent(page) + '-stop.txt');
	
	if(exists) {
		admin(ip);
	}
}
// 어드민
function admin(ip) {
	var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-admin.txt');
	
	if(!exists) {
		res.send('<script type="text/javascript">alert("어드민이 아닙니다.");</script>')
	}
}
// 소유자
function mine(ip) {
	var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-mine.txt');
	
	if(!exists) {
		res.send('<script type="text/javascript">alert("소유자가 아닙니다.");</script>')
	}
}
// 최근 바뀜 추가
function rplus(ip, today, name, rtitle, now, req, content) {
	var number = fs.readFileSync('./recent/RC-number.txt', 'utf8');
	fs.writeFileSync('./recent/RC-number.txt', Number(number)+1, 'utf8');
	fs.open('./recent/RC-' + number + '.txt','w+',function(err,fd){
		fs.writeFileSync('./recent/RC-' + number + '.txt', name, 'utf8');
	});
	fs.open('./recent/RC-' + number + '-title.txt','w+',function(err,fd){
		fs.writeFileSync('./recent/RC-' + number + '-title.txt', rtitle, 'utf8');
	});
	fs.open('./recent/RC-' + number + '-ip.txt','w+',function(err,fd){
		fs.writeFileSync('./recent/RC-' + number + '-ip.txt', ip, 'utf8');
	});
	fs.open('./recent/RC-' + number + '-today.txt','w+',function(err,fd){
		fs.writeFileSync('./recent/RC-' + number + '-today.txt', today, 'utf8');
	});
	
	if(content) {
		if(!now) {
			var leng = req.body.content.length;
			fs.open('./recent/RC-' + number + '-leng.txt','w+',function(err,fd){
				leng = '+' + leng
				fs.writeFileSync('./recent/RC-' + number + '-leng.txt', leng, 'utf8');
			});
		}
		else if(now.length > req.body.content.length) {
			var leng = now.length - req.body.content.length;
			fs.open('./recent/RC-' + number + '-leng.txt','w+',function(err,fd){
				leng = '-' + leng
				fs.writeFileSync('./recent/RC-' + number + '-leng.txt', leng, 'utf8');
			});
		}
		else if(now.length < req.body.content.length) {
			var leng = req.body.content.length - now.length;
			fs.open('./recent/RC-' + number + '-leng.txt','w+',function(err,fd){
				leng = '+' + leng
				fs.writeFileSync('./recent/RC-' + number + '-leng.txt', leng, 'utf8');
			});
		}
	}
}
// 최근 토론 추가
function tplus(ip, today, name, name2) {
	var number = fs.readFileSync('./recent/RD-number.txt', 'utf8');
	fs.writeFileSync('./recent/RD-number.txt', Number(number)+1, 'utf8');
	fs.open('./recent/RD-' + number + '.txt','w+',function(err,fd){
		fs.writeFileSync('./recent/RD-' + number + '.txt', name, 'utf8');
	});
	fs.open('./recent/RD-' + number + '-title.txt','w+',function(err,fd){
		fs.writeFileSync('./recent/RD-' + number + '-title.txt', name2, 'utf8');
	});
	fs.open('./recent/RD-' + number + '-ip.txt','w+',function(err,fd){
		fs.writeFileSync('./recent/RD-' + number + '-ip.txt', ip, 'utf8');
	});
	fs.open('./recent/RD-' + number + '-today.txt','w+',function(err,fd){
		fs.writeFileSync('./recent/RD-' + number + '-today.txt', today, 'utf8');
	});	
}
// 회원 가입
router.get('/register', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	
	var dis2 = loginy(req,res)
	
	res.status(200).render('register', { wikiname: name, dis2: dis2, title: '회원가입' });
	res.end()
});
// 가입 하기
router.post('/register', function(req, res, next) {
	var nope = /\-/;
	var nnope = /\:/;
	var nnnope = /\./;
	if(nope.exec(req.body.id)) {
		res.send('<script type="text/javascript">alert("닉네임에 - . :은 들어 갈 수 없습니다.");</script>')
	}
	else if(nnope.exec(req.body.id)) {
		res.send('<script type="text/javascript">alert("닉네임에 - . :은 들어 갈 수 없습니다.");</script>')
	}
	else if(nnnope.exec(req.body.id)) {
		res.send('<script type="text/javascript">alert("닉네임에 - . :은 들어 갈 수 없습니다.");</script>')
	}
	else { 
		var exists = fs.existsSync('./user/' + encodeURIComponent(req.body.id) + '.txt');
		if(!exists) {
			fs.writeFileSync('./user/' + encodeURIComponent(req.body.id) + '.txt', sha3_512(req.body.pw), 'utf8');
			res.redirect('/login')
		}
		else {
			res.send('<script type="text/javascript">alert("이미 있는 계정 입니다.");</script>')
		}
	}
});
// 로그아웃
router.get('/logout', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var cookies = new Cookies( req, res )
	, AqoursGanbaRuby, WikiID
			
	if(cookies.get( "WikiID" ) && cookies.get( "AqoursGanbaRuby" )) {
		cookies.set( "AqoursGanbaRuby", '', { maxAge: 60 * 60 * 24 * 7 } )
		cookies.set( "WikiID", '', { maxAge: 60 * 60 * 24 * 7 } )
		res.status(200).render('ban', { title: '로그아웃', content: "로그아웃 했습니다.", License: licen, wikiname: name });
		res.end()
	}
	else {
		res.redirect('/login')
	}
});
// 로그인
router.get('/login', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	
	var ip = yourip(req,res);
	
	stop(ip)
	
	var cookies = new Cookies( req, res )
	, AqoursGanbaRuby, WikiID
			
	if(cookies.get( "WikiID" ) && cookies.get( "AqoursGanbaRuby" )) {
		res.status(200).render('ban', { title: '로그인', content: "이미 로그인 되어 있습니다.", License: licen, wikiname: name });
		res.end()	
	}
	else {
		res.status(200).render('login', { wikiname: name, title: '로그인' });
		res.end()	
	}
});
// 로그인 하기
router.post('/login', function(req, res, next) {
	var exists = fs.existsSync('./user/' + encodeURIComponent(req.body.id) + '.txt');
	if(exists) {
		var pass = fs.readFileSync('./user/' + encodeURIComponent(req.body.id) + '.txt', 'utf8');
		var test = sha3_512(req.body.pw);

		if(pass === test) {
			var cookies = new Cookies( req, res )
			, AqoursGanbaRuby, WikiID
			cookies.set( "AqoursGanbaRuby", test, { maxAge: 60 * 60 * 24 * 7 } )
			cookies.set( "WikiID", encodeURIComponent(req.body.id), { maxAge: 60 * 60 * 24 * 7 } )
		}
		else {
			res.send('<script type="text/javascript">alert("암호가 틀렸습니다!");</script>')
		}
	}
	else {
		res.send('<script type="text/javascript">alert("계정이 없습니다!");</script>')
	}
	res.redirect('/w/')
});
// 대문으로 이동합니다.
router.get('/', function(req, res, next) {
	FrontPage = rFrontPage(FrontPage);
	res.redirect('/w/'+encodeURIComponent(FrontPage))
});
// 파일 업로드
router.get('/Upload', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	
	var dis2 = loginy(req,res)
	
	res.status(200).render('upload', { title: '파일 업로드', dis2:dis2, wikiname: name });
	res.end()
});
// 사용자 문서
router.get('/user/:user', function(req, res) {
  licen = rlicen(licen);
  name = rname(name);
  var title2 = encodeURIComponent(req.params.user)
  var dis2 = loginy(req,res)
  var exists = fs.existsSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt');
  if(!exists) {
	  res.status(200).render('user', { title: '사용자:' + req.params.user, dis: 'none', dis2: dis2, title2: title2, content: '이 문서가 없습니다.', License: licen , wikiname: name});
	  res.end()
  } else {
	  var data = fs.readFileSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt');
	  var redirect = /^#(?:넘겨주기|[Rr][Ee][Dd][Ii][Rr][Ee][Cc][Tt])\s([^\n]*)/g;
	  if(redirect.exec(data)) {
		data = data.replace(redirect, "<li>리다이렉트 [[$1]]</li>");
	  }
	  parseNamu(req, data, function(cnt){
			res.status(200).render('user', { title: '사용자:' + req.params.user, dis: 'none', dis2: dis2, title2: title2, content: cnt, License: licen , wikiname: name});
			res.end()
	  })
  }
});
// 사용자 편집
router.get('/edit/user/:user', function(req, res) {
  licen = rlicen(licen);
  name = rname(name);
  var ip = yourip(req,res);
  var title2 = encodeURIComponent(req.params.user)
  var dis2 = loginy(req,res)
  var cookies = new Cookies( req, res )
  , AqoursGanbaRuby, WikiID
	
  if(cookies.get( "WikiID" ) && cookies.get( "AqoursGanbaRuby" )) {
	id = cookies.get( "WikiID" );
	pw = cookies.get( "AqoursGanbaRuby" );
		
	var exists = fs.existsSync('./user/' + id + '.txt');
	if(exists) {
		var pass = fs.readFileSync('./user/' + id + '.txt', 'utf8');
		var test = pw;

		if(pass === test) {
			if(req.params.user === id) {
				var exists = fs.existsSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt');
				if(!exists) {
				  res.status(200).render('user-edit', { title: '사용자:' + req.params.user, dis2: dis2, title2: title2, content: '', License: licen , wikiname: name});
				  res.end()
				} else {
				  var data = fs.readFileSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt');
				  res.status(200).render('user-edit', { title: '사용자:' + req.params.user, dis2: dis2, title2: title2, content: data, License: licen , wikiname: name});
				  res.end()
				}
			} else {
				res.send('<script type="text/javascript">alert("본인 문서가 아닙니다.");</script>')
			}
		}
		else {
			cookies.set( "AqoursGanbaRuby", '', { maxAge: 60 * 60 * 24 * 7 } )
			cookies.set( "WikiID", '', { maxAge: 60 * 60 * 24 * 7 } )
		}
	}
	else {
		cookies.set( "AqoursGanbaRuby", '', { maxAge: 60 * 60 * 24 * 7 } )
		cookies.set( "WikiID", '', { maxAge: 60 * 60 * 24 * 7 } )
	}
  } else {
	  res.send('<script type="text/javascript">alert("본인 문서가 아닙니다.");</script>')
  }
});
router.post('/edit/user/:user', function(req, res) {
  licen = rlicen(licen);
  name = rname(name);
  var title2 = encodeURIComponent(req.params.user)
  var dis2 = loginy(req,res)
  var exists = fs.existsSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt');
  if(exists) {
	  fs.writeFileSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt', req.body.content, 'utf8');
  } else {
	  fs.open('./user/' + encodeURIComponent(req.params.user) + '-page.txt','w+',function(err,fd){
		fs.writeFileSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt', req.body.content, 'utf8');
	  });
  }
  res.redirect('/user/'+encodeURIComponent(req.params.user))
});
// 생성
router.get('/setup', function(req, res, next) {
	licen = 'CC ZERO';
	name = '오픈나무';
	FrontPage = 'FrontPage';
	var exists = fs.existsSync('./user/');
	if(!exists) {
		fs.mkdirSync('./user', 777);
	}
	var exists = fs.existsSync('./topic/');
	if(!exists) {
		fs.mkdirSync('./topic', 777);
	}
	var exists = fs.existsSync('./data/');
	if(!exists) {
		fs.mkdirSync('./data', 777);
	}
	var exists = fs.existsSync('./recent/');
	if(!exists) {
		fs.mkdirSync('./recent', 777);
	}
	var exists = fs.existsSync('./setting/');
	if(!exists) {
		fs.mkdirSync('./setting', 777);
	}
	var exists = fs.existsSync('./history/');
	if(!exists) {
		fs.mkdirSync('./history', 777);
	}
	var exists = fs.existsSync('./recent/RC-number.txt');
	if(!exists) {
		fs.open('./recent/RC-number.txt','w+',function(err,fd){
			fs.writeFileSync('./recent/RC-number.txt', 1, 'utf8');
		});
	}
	var exists = fs.existsSync('./recent/RD-number.txt');
	if(!exists) {
		fs.open('./recent/RD-number.txt','w+',function(err,fd){
			fs.writeFileSync('./recent/RD-number.txt', 1, 'utf8');
		});
	}
	var exists = fs.existsSync('./setting/FrontPage.txt');
	if(!exists) {
		fs.open('./setting/FrontPage.txt','w+', function (err,fd) {
			fs.writeFileSync('./setting/FrontPage.txt', FrontPage, 'utf8');
		});
	}
	var exists = fs.existsSync('./setting/License.txt');
	if(!exists) {
		fs.open('./setting/License.txt','w+', function (err,fd) {
			fs.writeFileSync('./setting/License.txt', licen, 'utf8');
		});
	}
	var exists = fs.existsSync('./setting/Plugin.txt');
	if(!exists) {
		fs.open('./setting/Plugin.txt','w+', function (err,fd) {
			fs.writeFileSync('./setting/Plugin.txt', 'false', 'utf8');
		});
	}
	var exists = fs.existsSync('./setting/WikiName.txt');
	if(!exists) {
		fs.open('./setting/WikiName.txt','w+', function (err,fd) {
			fs.writeFileSync('./setting/WikiName.txt', name, 'utf8');
		});
	}
	var exists = fs.existsSync('./setting/CapSec.txt');
	if(!exists) {
		fs.open('./setting/CapSec.txt','w+', function (err,fd) {
		});
	}
	var exists = fs.existsSync('./setting/CapSec.txt');
	if(!exists) {
		fs.open('./setting/CapPub.txt.txt','w+', function (err,fd) {
		});
	}
	res.status(200).render('ban', { title: 'Setup', content: "완료 되었습니다.", License: licen, wikiname: name});
});
// 토론
router.get('/topic/:page', function(req, res) {
  licen = rlicen(licen);
  name = rname(name);
  FrontPage = rFrontPage(FrontPage);
  
  var dis2 = loginy(req,res)
  
  var title2 = encodeURIComponent(req.params.page);
  
  var exists = fs.existsSync('./topic/' + encodeURIComponent(req.params.page) + '/');
  if(exists) {
	var topic = fs.readdirSync('./topic/' + encodeURIComponent(req.params.page) + '/');
    var i = 0;
    var add = '<div id="all_topic">';
  
    while(true) {
	  j = i + 1;
	  
	  if(!topic[i]) {
		  break;
	  }
	  else {
		  add = add + '<h2><a href="/topic/' + encodeURIComponent(req.params.page) + '/' + topic[i] + '">' + j + '. ' + decodeURIComponent(topic[i]) + '</a></h2>';
		  
		  var data = htmlencode.htmlEncode(fs.readFileSync('./topic/' + encodeURIComponent(req.params.page) + '/' + topic[i] + '/1.txt', 'utf8'));
		  var ip = fs.readFileSync('./topic/' + encodeURIComponent(req.params.page) + '/' + topic[i] + '/1-ip.txt', 'utf8');
		  var today = fs.readFileSync('./topic/' + encodeURIComponent(req.params.page) + '/' + topic[i] + '/1-today.txt', 'utf8');
		  
		  data = data.replace(/&lt;a href=&quot;(#[0-9]*)&quot;&gt;(?:#[0-9]*)&lt;\/a&gt;/g, '<a href="$1">$1</a>')
		  
		  var exists = fs.existsSync('./topic/' + encodeURIComponent(req.params.page) + '/' + topic[i] + '/1-stop.txt');
		  if(exists) {
			  data = '블라인드 되었습니다.';
		  }
		  
		  var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-admin.txt');
		  if(exists) {			
			  add = add + '<table id="toron"><tbody><tr><td id="toroncoloradmin"><a href="javascript:void(0);" id="1">#1</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
		  }
		  else {
			  add = add + '<table id="toron"><tbody><tr><td id="toroncolorgreen"><a href="javascript:void(0);" id="1">#1</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
		  }
	  
		  var exists = fs.existsSync('./topic/' + encodeURIComponent(req.params.page) + '/' + topic[i] + '/stop.txt');
		  if(exists) {			
			  add = add + '<table id="toron"><tbody><tr><td id="toroncolorstop"><a href="javascript:void(0);" id="stop">#stop</a> 관리자</td></tr><tr><td>이 토론은 관리자에 의하여 지금 정지 되었습니다.</td></tr></tbody></table><br>'
		  }
	  }
	  
	  i = i + 1;
    }
  }
  else {
	var add = '';
  }
  
  res.status(200).render('new-topic', { title: req.params.page, dis2:dis2, title2: title2, content: add, wikiname: name });
  res.end()
});
// 토론으로 보냄
router.post('/topic/:page', function(req, res) {
  res.redirect('/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.body.topic));
});
// 토론 블라인드
router.get('/topic/:page/:topic/b:number', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	
	var ip = yourip(req,res);
    admin(ip);
  
    var file = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic);
	var sfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/starter.txt';
	
	fs.exists(sfile, function (exists) {
		if(!exists) {
			res.redirect('/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic))
		}
		else {
			fs.exists(file + '/' + req.params.number + '.txt', function (exists) {
				if(!exists) {
					res.redirect('/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic))
				}
				else {
					fs.exists(file + '/' + req.params.number + '-stop.txt', function (exists) {
						if(exists) {
							fs.unlink(file + '/' + req.params.number + '-stop.txt', function (err) {
							});
						}
						else {
							fs.open(file + '/' + req.params.number + '-stop.txt','w',function(err,fd){
							});
						}
					});
					res.redirect('/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic))
				}
			});
		}
	});
});
// 토론 정지
router.get('/topic/:page/:topic/stop', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	
	var ip = yourip(req,res);
    admin(ip);
  
	var sfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/stop.txt';
	
	fs.exists(sfile, function (exists) {
		if(!exists) {
			fs.open(sfile,'w',function(err,fd){
			});
		}
		else {
			fs.unlink(sfile, function (err) {
			});
		}
	});
	res.redirect('/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic))
});
// 토론 명
router.get('/topic/:page/:topic', function(req, res) {
  licen = rlicen(licen);
  name = rname(name);
  FrontPage = rFrontPage(FrontPage);
  
  var dis2 = loginy(req,res)
  
  var admin = yourip(req, res);
  
  var title2 = encodeURIComponent(req.params.page);
  var title3 = encodeURIComponent(req.params.topic);
  
  var file = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic);
  var sfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/starter.txt';
  var nfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/number.txt';
  var rfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/';
  var stfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/stop.txt';
  
  var exists = fs.existsSync(rfile);
  if(!exists) {
	if(encodeURIComponent(req.params.page).length > 255) {
		res.send('<script type="text/javascript">alert("문서 명이 너무 깁니다.");</script>')
	}
	else if(encodeURIComponent(req.params.topic) + '-10000-today'.length > 255) {
		res.send('<script type="text/javascript">alert("토론 명이 너무 깁니다.");</script>')
	}
	res.status(404).render('topic', { title: req.params.page, dis2:dis2, title2: title2, title3: req.params.topic, title4: title3, wikiname: name });
	res.end()	  
  }
  else {
	if(encodeURIComponent(req.params.page).length > 255) {
		res.send('<script type="text/javascript">alert("문서 명이 너무 깁니다.");</script>')
	}
	else if(encodeURIComponent(req.params.topic) + '-10000-today'.length > 255) {
		res.send('<script type="text/javascript">alert("토론 명이 너무 깁니다.");</script>')
	}
	  
	var number = fs.readFileSync(nfile, 'utf8');
	number = Number(number);
	var starter = fs.readFileSync(sfile, 'utf8');
	var i = 0;
	var add = '<div id="new_game">';
	
	var exists = fs.existsSync('./user/' + admin + '-admin.txt');
	if(exists) {
		var exists = fs.existsSync(stfile);
		if(exists) {
			add = add + '<a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/stop">(토론 재개)</a><br><br>';
		}
		else {
			add = add + '<a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/stop">(토론 정지)</a><br><br>';
		}
	}
	  
	while(true) {
		i = i + 1;
		  
		if(number === i) {
			add = add + '</div>';
			break;
		}
		else {
			var data = htmlencode.htmlEncode(fs.readFileSync(file + '/' + i + '.txt', 'utf8'));
			var ip = fs.readFileSync(file + '/' + i + '-ip.txt', 'utf8');
			var today = fs.readFileSync(file + '/' + i + '-today.txt', 'utf8');
			
			data = data.replace(/&lt;a href=&quot;(#[0-9]*)&quot;&gt;(?:#[0-9]*)&lt;\/a&gt;/g, '<a href="$1">$1</a>')
			
			var bl = '블라인드';
			
			var exists = fs.existsSync('./user/' + ip + '-admin.txt');
			if(exists) {
				ip = ip + ' - 관리자';
				var exists = fs.existsSync('./user/' + admin + '-admin.txt');
				if(exists) {
					var exists = fs.existsSync(file + '/' + i + '-stop.txt');
					if(exists) {
						add = add + '<table id="toron"><tbody><tr><td id="toroncoloradmin"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(해제)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
					}
					else {
						add = add + '<table id="toron"><tbody><tr><td id="toroncoloradmin"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(' + bl + ')</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
					}
				}
				else {
					var exists = fs.existsSync(file + '/' + i + '-stop.txt');
					if(exists) {
						add = add + '<table id="toron"><tbody><tr><td id="toroncoloradmin"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
					}
					else {
						add = add + '<table id="toron"><tbody><tr><td id="toroncoloradmin"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
					}
				}
			}
			else if(ip === starter) {				
				var exists = fs.existsSync('./user/' + admin + '-admin.txt');
				if(exists) {
					var exists = fs.existsSync(file + '/' + i + '-stop.txt');
					if(exists) {
						add = add + '<table id="toron"><tbody><tr><td id="toroncolorgreen"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(해제)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
					}
					else {
						add = add + '<table id="toron"><tbody><tr><td id="toroncolorgreen"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(' + bl + ')</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
					}
				}
				else {
					var exists = fs.existsSync(file + '/' + i + '-stop.txt');
					if(exists) {
						add = add + '<table id="toron"><tbody><tr><td id="toroncolorgreen"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
					}
					else {
						add = add + '<table id="toron"><tbody><tr><td id="toroncolorgreen"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
					}
				}
			}
			else {
				var exists = fs.existsSync('./user/' + admin + '-admin.txt');
				if(exists) {
					var exists = fs.existsSync(file + '/' + i + '-stop.txt');
					if(exists) {
						add = add + '<table id="toron"><tbody><tr><td id="toroncolor"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(해제)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
					}
					else {
						add = add + '<table id="toron"><tbody><tr><td id="toroncolor"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(' + bl + ')</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
					}
				}
				else {
					var exists = fs.existsSync(file + '/' + i + '-stop.txt');
					if(exists) {
						add = add + '<table id="toron"><tbody><tr><td id="toroncolor"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
					}
					else {
						add = add + '<table id="toron"><tbody><tr><td id="toroncolor"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
					}
				}
			}
		}
	}
	
	var exists = fs.existsSync(stfile);
	if(exists) {
		var toronstop = 'none';
		
		add = add + '<table id="toron"><tbody><tr><td id="toroncolorstop"><a href="javascript:void(0);" id="stop">#stop</a> 관리자</td></tr><tr><td>이 토론은 관리자에 의하여 지금 정지 되었습니다.</td></tr></tbody></table><br>'
	}
	
	res.status(200).render('topic', { title: req.params.page, dis2:dis2, title2: title2, title3: req.params.topic, title4: title3, content: add, wikiname: name, toronstop: toronstop });
	res.end()	  
  }
});
// post
router.post('/topic/:page/:topic', function(req, res) {
  var file = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic);
  var sfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/starter.txt';
  var nfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/number.txt';
  var rfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/';
  var yfile = './topic/' + encodeURIComponent(req.params.page) + '/';
  
  var exists = fs.existsSync(yfile);
  if(!exists) {
	fs.mkdirSync('./topic/' + encodeURIComponent(req.params.page), 777);
  }
  
  var exists = fs.existsSync(rfile);
  if(!exists) {
	fs.mkdirSync('./topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic), 777);
  }
  else {
	var number = fs.readFileSync(nfile, 'utf8');;
  }
  
  var ip = yourip(req,res);
  var page = req.params.page;
  stop(ip);
  
  var today = getNow();
  var name = req.params.page;
  var name2 = req.params.topic;
  tplus(ip, today, name, name2)
  
  req.body.content = req.body.content.replace(/(#[0-9]*)/g, "<a href=\"$1\">$1</a>");
  fs.exists(sfile, function (exists) {
	if(!exists) {
		fs.open(sfile,'w',function(err,fd){
			fs.writeFileSync(sfile, ip, 'utf8');
		});
		var number = 1;
		fs.writeFileSync(nfile, number + 1, 'utf8');
		fs.writeFileSync(file + '/' + number + '-ip.txt', ip, 'utf8');
		fs.writeFileSync(file + '/' + number + '-today.txt', today, 'utf8');
		fs.writeFileSync(file + '/' + number + '.txt',req.body.content);
		res.redirect('/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic));
	}
	else {
		var number = fs.readFileSync(nfile, 'utf8');
		number = Number(number);
		fs.writeFileSync(nfile, number + 1, 'utf8');
		fs.writeFileSync(file + '/' + number + '-ip.txt', ip, 'utf8');
		fs.writeFileSync(file + '/' + number + '-today.txt', today, 'utf8');
		fs.writeFileSync(file + '/' + number + '.txt',req.body.content);
		res.redirect('/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic));
	}
  });
});
// 밴 추가
router.get('/ban/:ip', function(req, res) {
	var ip = yourip(req,res);
	
	admin(ip);
	
	var exists = fs.existsSync('./user/' + encodeURIComponent(req.params.ip) + '-ban.txt');
	if(exists) {
		fs.unlink('./user/' + encodeURIComponent(req.params.ip) + '-ban.txt', function (err) {
		});
	}
	else {
		var exists = fs.existsSync('./user/' + encodeURIComponent(req.params.ip) + '-admin.txt');
		if(exists) {
			res.send('<script type="text/javascript">alert("관리자는 차단 할 수 없습니다.");</script>')
		}
		else {
			fs.open('./user/' + encodeURIComponent(req.params.ip) + '-ban.txt','w',function(err,fd){
			});
		}
	}
	res.redirect('/w/')
});
// 어드민 부여
router.get('/admin/:ip', function(req, res) {
	var ip = yourip(req,res);
	
	mine(ip);
	
	var exists = fs.existsSync('./user/' + encodeURIComponent(req.params.ip) + '-admin.txt');
	if(exists) {
		fs.unlink('./user/' + encodeURIComponent(req.params.ip) + '-admin.txt', function (err) {
		});
	}
	else {
		fs.open('./user/' + encodeURIComponent(req.params.ip) + '-admin.txt','w',function(err,fd){
		});
	}
	res.redirect('/w/')
});
// 밴 리스트
router.get('/ban', function(req, res, next) {
	name = rname(name);
	var dis2 = loginy(req,res)
	var sun = fs.readdirSync('./user');
	var shine = 0;
	var ganba;
	var ruby = '<div>';
	var dayo = /([^-]*)-ban\.txt/;
	var hehe;
	while(true) {
		if(sun[shine]) {
			hehe = decodeURIComponent(sun[shine]);
			if(ganba = dayo.exec(hehe)) {
				ruby = ruby + '<li>' + ganba[1] + '</a></li>';
			}
		}
		else {
			ruby = ruby + '</div>';
			break;
		}
		shine = shine + 1;
	}
	res.status(200).render('ban', { title: '밴 목록', dis2:dis2, content: ruby , wikiname: name});
	res.end()
});
// ACL
router.get('/acl/:page', function(req, res, next) {
	var ip = yourip(req,res);

    admin(ip);
	
	var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page) + '-stop.txt');
	if(exists) {
		fs.unlink('./data/' + encodeURIComponent(req.params.page) + '-stop.txt', function (err) {
		});
	}
	else {
		fs.open('./data/' + encodeURIComponent(req.params.page) + '-stop.txt','w',function(err,fd){
		});
	}
	res.redirect('/w/'+encodeURIComponent(req.params.page))
});
// 리다이렉트.
router.get('/w/', function(req, res) {
	FrontPage = rFrontPage(FrontPage);
	res.redirect('/w/'+encodeURIComponent(FrontPage))
});
// ver
router.get('/ver', function(req, res) {
	res.redirect('https://namu.ml/w/%EC%9C%84%ED%82%A4%20%EB%B2%84%EC%A0%84')
});
// 검색 결과를 보여줍니다.
router.post('/search', function(req, res) {
    fs.exists('./data/' + encodeURIComponent(req.body.name)+'.txt', function (exists) {
		if(exists) {
			res.redirect('/w/'+encodeURIComponent(req.body.name))
		}
		else {
			res.redirect('/edit/'+encodeURIComponent(req.body.name))
		}
	});
});
// diff
router.get('/diff/:page/:r/:rr', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var dis2 = loginy(req,res)
	var title2 = encodeURIComponent(req.params.page);
	fs.exists('./history/' + encodeURIComponent(req.params.page)+'/r1.txt', function (exists) {
		if(exists) {
			fs.exists('./history/' + encodeURIComponent(req.params.page)+'/'+req.params.r+'.txt', function (exists) {
				if(exists){
						fs.exists('./history/' + encodeURIComponent(req.params.page)+'/'+req.params.rr+'.txt', function (exists) {
							if(exists) {
								var sc = fs.readFileSync('./history/' + encodeURIComponent(req.params.page)+'/'+req.params.r+'.txt', 'utf8');
								var id = fs.readFileSync('./history/' + encodeURIComponent(req.params.page)+'/'+req.params.rr+'.txt', 'utf8');
 
								var diff = new Diff(); // options may be passed to constructor; see below 
								var textDiff = diff.main(sc, id); // produces diff array 
								
								
								res.status(200).render('diff', { title: req.params.page + ' (' + req.params.r + ' / ' + req.params.rr + ')', title2: title2, dis2:dis2, wikiname: name, License: licen, content: diff.prettyHtml(textDiff)});
								res.end()
							}
							else {
								res.status(404).render('diff', { title: req.params.page + ' (' + req.params.r + ' / ' + req.params.rr + ')', title2: title2, dis2:dis2, content: "이 문서의 "+req.params.rr+" 판이 없습니다. <a href='/w/"+encodeURIComponent(req.params.page)+"'>돌아가기</a>", License: licen, wikiname: name });
								res.end()
							}
						});
				}
				else {
					res.status(404).render('diff', { title: req.params.page + ' (' + req.params.r + ' / ' + req.params.rr + ')', title2: title2, dis2:dis2, content: "이 문서의 "+req.params.r+" 판이 없습니다. <a href='/w/"+encodeURIComponent(req.params.page)+"'>돌아가기</a>", License: licen, wikiname: name });
					res.end()
				}
			});
		}
		else {
			res.status(404).render('ban', { title: req.params.page, title2: title2, content: "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>", dis2:dis2, License: licen, wikiname: name});
			res.end()
			return;
		}
	});
});
// 되돌리기
router.post('/revert/:page', function(req, res) {
	res.redirect('/revert/'+ encodeURIComponent(req.params.page) + '/r' + encodeURIComponent(req.body.re))
});
// 되돌리기 2
router.get('/revert/:page/:r', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var dis2 = loginy(req,res)
	var title2 = encodeURIComponent(req.params.page);
	var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/'+ req.params.r +'.txt');
	if(exists) {
		res.status(200).render('ok', { title2: title2, title: req.params.page, dis2:dis2, wikiname: name, title3: req.params.r});
		res.end()
	}
	else {
		res.status(404).render('ban', { title: req.params.page, title2: title2, dis2:dis2, content: "이 리비전이 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>", License: licen, wikiname: name});
		res.end()
		return;
	}
});
// 되돌리기 3
router.post('/revert/:page/:r', function(req, res) {
	var ip = yourip(req,res);
	
    var today = getNow();
	var rtitle = req.params.r + ' 버전으로 되돌림';
	var name = req.params.page;
	rplus(ip, today, name, rtitle);
	var revert = fs.readFileSync('./history/' + encodeURIComponent(req.params.page) + '/'+ req.params.r +'.txt');
	fs.writeFileSync('./data/' + encodeURIComponent(req.params.page) + '.txt', revert, 'utf8');
	res.redirect('/w/'+ encodeURIComponent(req.params.page))
	var i = 0;
	while(true) {
		i = i + 1;
		var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
		if(!exists) {
			fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt','w',function(err,fd){
				fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt', revert, 'utf8');
			});
			fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt','w',function(err,fd){
				fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt', ip, 'utf8');
			});
			fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt','w',function(err,fd){
				fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt', today, 'utf8');
			});
			fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt','w',function(err,fd){
				fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt', req.params.r + ' 버전으로 되돌림', 'utf8');
			});
			break;
		}
	}
});
// 문서 삭제
router.get('/delete/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var ip = yourip(req,res);
	var page = req.params.page;
	var dis2 = loginy(req,res)
	stop(ip);
	var today = getNow();
	var title2 = encodeURIComponent(req.params.page);
  
	fs.exists('./data/' + encodeURIComponent(req.params.page)+'.txt', function (exists) {
		if(!exists) {
			res.status(404).render('ban', { title: req.params.page, title2: title2,dis2:dis2, content: "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>", License: licen, wikiname: name});
			res.end()
			return;
		}
		else {
			res.status(200).render('delete', { title: req.params.page, title2: title2,dis2:dis2, wikiname: name});
			res.end()
		}
	})
});
// 문서 삭제 처리
router.post('/delete/:page', function(req, res) {
	var ip = yourip(req,res);
	var today = getNow();
	var rtitle = '문서를 삭제함';
	var name = req.params.page;
	rplus(ip, today, name, rtitle);
	var i = 0;
	while(true) {
		i = i + 1;
		var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
		if(!exists) {
			fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt','w',function(err,fd){
				fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt', req.body.content, 'utf8');
			});
			fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt','w',function(err,fd){
				fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt', ip, 'utf8');
			});
			fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt','w',function(err,fd){
				fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt', today, 'utf8');
			});
			fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt','w',function(err,fd){
				fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt', '문서를 삭제함', 'utf8');
			});
			break;
		}
	}
	fs.unlink('./data/' + encodeURIComponent(req.params.page)+'.txt', function (err) {
	});
	res.redirect('/w/'+ encodeURIComponent(req.params.page))
});
// 문서 이동
router.get('/move/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var ip = yourip(req,res);
	var page = req.params.page;
	var dis2 = loginy(req,res)
    stop(ip);
    var today = getNow();
	var title2 = encodeURIComponent(req.params.page);
	fs.exists('./data/' + encodeURIComponent(req.params.page)+'.txt', function (exists) {
		if(!exists) {
			res.status(404).render('ban', { title: req.params.page, dis2:dis2, title2: title2, content: "이 문서가 없습니다. <a href='/edit/"+req.params.page+"'>편집</a>", License: licen , wikiname: name});
			res.end()
			return;
		}
		else {
			res.status(200).render('move', { title: req.params.page, dis2,dis2, title2: title2, wikiname: name});
			res.end()
		}
	})
});
// post
router.post('/move/:page', function(req, res) {
	var ip = yourip(req,res);
	var today = getNow();
	if(req.body.title === '')
	{
		res.send('<script type="text/javascript">alert("문서 이름 없음");</script>');
	}
	else {
		var exists = fs.existsSync('./history/' + encodeURIComponent(req.body.title) + '/r1.txt');
		if(exists)
		{
			res.send('<script type="text/javascript">alert("이미 해당 문서가 존재 합니다.");</script>');
		}
		else
		{
			var rtitle = '<a href="/w/'+encodeURIComponent(req.body.title)+'">'+req.body.title+'</a> 문서로 문서를 이동함';
			var name = req.params.page;
			rplus(ip, today, name, rtitle);
			var i = 0;
			fs.mkdirSync('./history/' + encodeURIComponent(req.body.title), 777);
			while(true) {
				i=i+1
				var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
				if(exists) {
					fs.rename('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt','./history/' + encodeURIComponent(req.body.title) + '/r'+ i +'.txt', function (err) {
					});
					fs.rename('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'-ip.txt','./history/' + encodeURIComponent(req.body.title) + '/r'+ i +'-ip.txt', function (err) {
					});
					fs.rename('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'-today.txt','./history/' + encodeURIComponent(req.body.title) + '/r'+ i +'-today.txt', function (err) {
					});
					fs.rename('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'-send.txt','./history/' + encodeURIComponent(req.body.title) + '/r'+ i +'-send.txt', function (err) {
					});
				}
				else {
					break;
				}
			}
			
			var j = 0;
			while(true) {
				j = j + 1;
				var exists = fs.existsSync('./history/' + encodeURIComponent(req.body.title) + '/r'+ i +'.txt');
				if(!exists) {
					fs.open('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '.txt','w',function(err,fd){
						fs.writeFileSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '.txt', req.body.content, 'utf8');
					});
					fs.open('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-ip.txt','w',function(err,fd){
						fs.writeFileSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-ip.txt', ip, 'utf8');
					});
					fs.open('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-today.txt','w',function(err,fd){
						fs.writeFileSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-today.txt', today, 'utf8');
					});
					fs.open('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-send.txt','w',function(err,fd){
						fs.writeFileSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-send.txt', '<a href="/w/'+encodeURIComponent(req.params.page)+'">'+req.params.page+'</a> 에서 <a href="/w/'+encodeURIComponent(req.params.page)+'">'+req.body.title+'</a> 문서로 문서를 이동함', 'utf8');
					});
					break;
				}
			}
			fs.rmdir('./history/' + encodeURIComponent(req.params.page), function(err) {
			});
				
			fs.rename('./data/' + encodeURIComponent(req.params.page)+'.txt','./data/' + encodeURIComponent(req.body.title)+'.txt', function (err) {
			});
		}
		
		res.redirect('/w/'+ encodeURIComponent(req.body.title))
	}
});
// 항목을 보여줍니다.
router.get('/w/:page', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
  var testing = /\//;
  if(testing.exec(req.params.page)) {
	  var zenkaino = /(.*)\/.*/;
	  var lovelive;
	  var subtitle = zenkaino.exec(req.params.page);
	  if(subtitle[1] == '') {
		  lovelive = req.params.page;
		  var dis = 'none';
	  } else {
		  lovelive = subtitle[1];
	  }
  }
  else {
	  var dis = 'none';
	  lovelive = req.params.page;
  }
  var dis2 = loginy(req,res)
  var title2 = encodeURIComponent(req.params.page);
  fs.readFile('./data/' + encodeURIComponent(req.params.page)+'.txt', 'utf8', function(err, data) {
	fs.exists('./data/' + encodeURIComponent(req.params.page)+'.txt', function (exists) {
		if(!exists) {
			res.status(404).render('index', { title: req.params.page, dis: dis,dis2:dis2, title2: title2, subtitle: encodeURIComponent(lovelive), content: "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>", License: licen, wikiname: name});
			res.end()
			return;
		}
		else {
			var redirect = /^#(?:넘겨주기|[Rr][Ee][Dd][Ii][Rr][Ee][Cc][Tt])\s([^\n]*)/g;
			var dtest;
			if(dtest = redirect.exec(data)) {
				data = data.replace(redirect, "<head><meta http-equiv=\"refresh\" content=\"0;url=/w/"+encodeURIComponent(dtest[1])+"/redirect/"+encodeURIComponent(req.params.page)+"\" /></head><li>리다이렉트 <a href='$1'>$1</a></li>");
				res.status(200).render('index', { title: req.params.page, dis: dis, dis2:dis2, title2: title2, subtitle: encodeURIComponent(lovelive), content: data, License: licen , wikiname: name});
				res.end()
			}
			else {
				parseNamu(req, data, function(cnt){
					res.status(200).render('index', { title: req.params.page, dis: dis, dis2:dis2, title2: title2, subtitle: encodeURIComponent(lovelive), content: cnt, License: licen , wikiname: name});
					res.end()
				})
			}
		}
	})
  })
});
// 리다이렉트 w
router.get('/w/:page/redirect/:rdrc', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
  var testing = /\//;
  if(testing.exec(req.params.page)) {
	  var zenkaino = /(.*)\/.*/;
	  var lovelive;
	  var subtitle = zenkaino.exec(req.params.page);
	  if(subtitle[1] == '') {
		  lovelive = req.params.page;
		  var dis = 'none';
	  } else {
		  lovelive = subtitle[1];
	  }
  }
  else {
	  var dis = 'none';
	  lovelive = req.params.page;
  }
  var dis2 = loginy(req,res)
  var title2 = encodeURIComponent(req.params.page);
  fs.readFile('./data/' + encodeURIComponent(req.params.page)+'.txt', 'utf8', function(err, data) {
	fs.exists('./data/' + encodeURIComponent(req.params.page)+'.txt', function (exists) {
		if(!exists) {
			res.status(404).render('index', { title: req.params.page, dis2:dis2, dis: dis, title2: title2, subtitle: encodeURIComponent(lovelive), content: '<li><a href="/edit/' + req.params.rdrc + '">' + req.params.rdrc + '</a> 에서 넘어 왔습니다.</li><br>' + "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>", License: licen, wikiname: name});
			res.end()
			return;
		}
		else {
			var redirect = /^#(?:넘겨주기|[Rr][Ee][Dd][Ii][Rr][Ee][Cc][Tt])\s([^\n]*)/g;
			if(redirect.exec(data)) {
				data = data.replace(redirect, "<li>리다이렉트 [[$1]]</li>");
			}
			parseNamu(req, data, function(cnt){
				res.status(200).render('index', { title: req.params.page, dis2:dis2, title2: title2, dis:dis, subtitle: encodeURIComponent(lovelive), content: '<li><a href="/edit/' + req.params.rdrc + '">' + req.params.rdrc + '</a> 에서 넘어 왔습니다.</li><br>' + cnt, License: licen , wikiname: name});
				res.end()
			})
		}
	})
  })
});
// 최근 바뀜을 보여줍니다.
router.get('/RecentChanges', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	
	var admin = yourip(req, res);
	
	var number = fs.readFileSync('./recent/RC-number.txt', 'utf8');
	var i = 0;
	var data = '';
	var dis2 = loginy(req,res)
	while(true) {
		if(Number(number) < 51) {
			i = i + 1;
			var exists = fs.existsSync('./recent/RC-' + i + '.txt');
			if(exists) {			
				var ip = fs.readFileSync('./recent/RC-' + i + '-ip.txt', 'utf8');
				var today = fs.readFileSync('./recent/RC-' + i + '-today.txt', 'utf8');
				var title = fs.readFileSync('./recent/RC-' + i + '-title.txt', 'utf8');
				var page = fs.readFileSync('./recent/RC-' + i + '.txt', 'utf8');
				
				var exists = fs.existsSync('./recent/RC-' + i + '-leng.txt');
				if(exists) {
					var plus = /\+/g;
					var leng = fs.readFileSync('./recent/RC-' + i + '-leng.txt', 'utf8');
					if(plus.exec(leng)) {
						var pageplus = page + '</a> <span style="color:green;">(' + leng + ')</span>';
					}
					else {
						var pageplus = page + '</a> <span style="color:red;">(' + leng + ')</span>';
					}
				}
				else {
					var pageplus = page + '</a>';
				}
				
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
				if(exists) {
					var ban = '풀기';
				}
				else {
					var ban = '차단';
				}
				
				var exists = fs.existsSync('./user/' + admin + '-admin.txt');
				if(exists) {
					ip = ip + ' <a href="/ban/' + ip + '">(' + ban + ')';
				}
				
				data = '<table id="toron"><tbody><tr><td id="yosolo"><a href="/w/'+encodeURIComponent(page)+'">'+pageplus+'</td><td id="yosolo">'+ip+'</td><td id="yosolo">'+today+'</td></tr><tr><td colspan="3" id="yosolo">'+title+'</td></tr></tbody></table>' + data;
			}
			else {
				break;
			}
		}
		else {
			if (i === 0) {
				i = Number(number) - 50;
			}
			else if (i === Number(number)) {
				break;
			}
			else {
				var ip = fs.readFileSync('./recent/RC-' + i + '-ip.txt', 'utf8');
				var today = fs.readFileSync('./recent/RC-' + i + '-today.txt', 'utf8');
				var title = fs.readFileSync('./recent/RC-' + i + '-title.txt', 'utf8');
				var page = fs.readFileSync('./recent/RC-' + i + '.txt', 'utf8');
				
				var exists = fs.existsSync('./recent/RC-' + i + '-leng.txt');
				if(exists) {
					var plus = /\+/g;
					var leng = fs.readFileSync('./recent/RC-' + i + '-leng.txt', 'utf8');
					if(plus.exec(leng)) {
						var pageplus = page + '</a> <span style="color:green;">(' + leng + ')</span>';
					}
					else {
						var pageplus = page + '</a> <span style="color:red;">(' + leng + ')</span>';
					}
				}
				else {
					var pageplus = page + '</a>';
				}
				
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
				if(exists) {
					var ban = '풀기';
				}
				else {
					var ban = '차단';
				}
				
				var exists = fs.existsSync('./user/' + admin + '-admin.txt');
				if(exists) {
					ip = ip + ' <a href="/ban/' + ip + '">(' + ban + ')';
				}
				
				data = '<table id="toron"><tbody><tr><td id="yosolo"><a href="/w/'+encodeURIComponent(page)+'">'+pageplus+'</td><td id="yosolo">'+ip+'</td><td id="yosolo">'+today+'</td></tr><tr><td colspan="3" id="yosolo">'+title+'</td></tr></tbody></table>' + data;
			}
			i = i + 1;
		}
	}
  	res.status(200).render('re1', { title: '최근 변경내역', dis2:dis2, content: data, License: licen , wikiname: name});
	res.end()
});
// 최근 토론을 보여줍니다.
router.get('/RecentDiscuss', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	
	var admin = yourip(req, res);
	
	var dis2 = loginy(req,res)
	var number = fs.readFileSync('./recent/RD-number.txt', 'utf8');
	var i = 0;
	var data = '';
	while(true) {
		if(Number(number) < 51) {
			i = i + 1;
			var exists = fs.existsSync('./recent/RD-' + i + '.txt');
			if(exists) {				
				var ip = fs.readFileSync('./recent/RD-' + i + '-ip.txt', 'utf8');
				var today = fs.readFileSync('./recent/RD-' + i + '-today.txt', 'utf8');
				var title = fs.readFileSync('./recent/RD-' + i + '-title.txt', 'utf8');
				var page = fs.readFileSync('./recent/RD-' + i + '.txt', 'utf8');
				
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
				if(exists) {
					var ban = '풀기';
				}
				else {
					var ban = '차단';
				}
				
				var exists = fs.existsSync('./user/' + admin + '-admin.txt');
				if(exists) {
					ip = ip + ' <a href="/ban/' + ip + '">(' + ban + ')';
				}
				
				data = '<table id="toron"><tbody><tr><td id="yosolo"><a href="/topic/'+encodeURIComponent(page)+'/'+encodeURIComponent(title)+'">'+page+' ('+title+')</a></td><td id="yosolo">'+ip+'</td><td id="yosolo">'+today+'</td></tr></tbody></table>' + data;
			}
			else {
				break;
			}
		}
		else {
			if (i === 0) {
				i = Number(number) - 50;
			}
			else if (i === Number(number)) {
				break;
			}
			else {			
				var ip = fs.readFileSync('./recent/RD-' + i + '-ip.txt', 'utf8');
				var today = fs.readFileSync('./recent/RD-' + i + '-today.txt', 'utf8');
				var title = fs.readFileSync('./recent/RD-' + i + '-title.txt', 'utf8');
				var page = fs.readFileSync('./recent/RD-' + i + '.txt', 'utf8');
				
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
				if(exists) {
					var ban = '풀기';
				}
				else {
					var ban = '차단';
				}
				
				var exists = fs.existsSync('./user/' + admin + '-admin.txt');
				if(exists) {
					ip = ip + ' <a href="/ban/' + ip + '">(' + ban + ')';
				}
				
				data = '<table id="toron"><tbody><tr><td id="yosolo"><a href="/topic/'+encodeURIComponent(page)+'/'+encodeURIComponent(title)+'">'+page+' ('+title+')</a></td><td id="yosolo">'+ip+'</td><td id="yosolo">'+today+'</td></tr></tbody></table>' + data;
			}
			i = i + 1;
		}
	}
  	res.status(200).render('de1', { title: '최근 토론내역', dis2:dis2, content: data, License: licen , wikiname: name});
	res.end()
});
// raw를 보여줍니다.
router.get('/raw/:page', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var dis2 = loginy(req,res)
  fs.readFile('./data/' + encodeURIComponent(req.params.page)+'.txt', 'utf8', function(err, data) {
	fs.exists('./data/' + encodeURIComponent(req.params.page)+'.txt', function (exists) {
		if(!exists) {
			res.status(404).render('ban', { title: req.params.page, dis2:dis2, content: "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>", License: licen ,wikiname: name});
			res.end()
			return;
		}
		else {
			data = data.replace(/<br>/g, '[br]')
			data = data.replace(/\n/g, '<br>')
			var raw = htmlencode.htmlEncode(data);
			raw = raw.replace(/;&lt;br&gt;/g, '<br>');
			res.status(200).render('ban', { title: req.params.page, dis2:dis2, content: raw, License: licen ,wikiname: name});
			res.end()
		}
	})
  })
});
// diff로 보냅니다.
router.post('/history/:page', function(req, res, next) {
	res.redirect('/diff/' + encodeURIComponent(req.params.page) + '/r' + encodeURIComponent(req.body.r) + '/r' + encodeURIComponent(req.body.rr));
});
// 미리보기
router.post('/preview/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var dis2 = loginy(req,res)
	var redirect = /^#(?:넘겨주기|[Rr][Ee][Dd][Ii][Rr][Ee][Cc][Tt])\s([^\n]*)/g;
	var data = req.body.content;
	data = data.replace(redirect, "<li>리다이렉트 [[$1]]</li>");
	parseNamu(req, data, function(cnt){
		res.render('preview', { title: req.params.page, dis2:dis2,  title2: encodeURIComponent(req.params.page), data: data, data2: req.body.content, content: cnt , wikiname: name});
		res.end()
	});
});
// 모든 문서
router.get('/TitleIndex', function(req, res) {
	licen = rlicen(licen);
	var dis2 = loginy(req,res)
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var sun = fs.readdirSync('./data');
	var shine = 0;
	var ganba;
	var ruby = '<div>';
	var dayo = /(.*)\.txt/;
	var haha = /-stop$/;
	var hehe;
	while(true) {
		if(sun[shine]) {
			hehe = decodeURIComponent(sun[shine]);
			ganba = dayo.exec(hehe);
			if(haha.exec(ganba[1])) {
				
			} else {
				ruby = ruby + '<li>' + '<a href="/w/' + encodeURIComponent(ganba[1]) + '">' + ganba[1] + '</a></li>';
			}
		}
		else {
			ruby = ruby + '</div>';
			break;
		}
		shine = shine + 1;
	}
	res.render('ban', { title: '모든 문서', dis2:dis2, content: ruby + '<br>' + shine + '개의 문서' , wikiname: name});
});
// 랜덤
router.get('/random', function(req, res) {
	var sun = fs.readdirSync('./data');
	var shine = 0;
	var ganba;
	var dayo = /(.*)\.txt/;
	var haha = /-stop$/;
	var hehe;
	while(true) {
		if(sun[shine]) {
			shine = shine + 1;
		}
		else {
			break;
		}
	}
	var random = Math.floor(Math.random() * (shine - 0)) + 0;
	var test = dayo.exec(sun[random])
	if(haha.exec(test[1])) {
		res.redirect('/random');
	}
	else {
		res.redirect('/w/' + test[1]);
	}
});
// 편집 화면을 보여줍니다.
router.get('/edit/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	
	var dis2 = loginy(req,res)
	
	if(encodeURIComponent(req.params.page).length > 255) {
		res.send('<script type="text/javascript">alert("문서 명이 너무 깁니다.");</script>')
	}
	
	var ip = yourip(req,res);
	var page = req.params.page;

    stop(ip);
	editstop(ip, page);
    var today = getNow();
	
	fs.exists('./data/' + encodeURIComponent(req.params.page)+'.txt', function(exists) {
		if(!exists){
			res.render('edit', { dis2:dis2, title: req.params.page, title2: encodeURIComponent(req.params.page), content: "" , wikiname: name});
			res.end()
		}
		else{
			var data = fs.readFileSync('./data/' + encodeURIComponent(req.params.page)+'.txt', 'utf8');
			res.render('edit', { dis2:dis2, title: req.params.page, title2: encodeURIComponent(req.params.page), content: data , wikiname: name});
			res.end()
		}
	})
});
// 편집 결과를 적용하고 해당 문서로 이동합니다.
router.post('/edit/:page', function(req, res) {
	var ip = yourip(req,res);
	var today = getNow();
	
	if(!req.body.send) {
		req.body.send = "<br>";
	}
	content = req.body.content;
	var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page)+'.txt');
	if(exists) {
		var now = fs.readFileSync('./data/' + encodeURIComponent(req.params.page) + '.txt', 'utf8');
	}
	
	var rtitle = req.body.send;
	
	var name = req.params.page;
	
	rplus(ip, today, name, rtitle, now, req, content);
	
	fs.exists('./data/' + encodeURIComponent(req.params.page)+'.txt', function (exists) {
		if(!exists) {
			var file = './data/' + encodeURIComponent(req.params.page)+'.txt';
			fs.open(file,'w',function(err,fd){
				fs.writeFileSync('./data/' + encodeURIComponent(req.params.page)+'.txt', req.body.content, 'utf8');
			});
			fs.exists('./history/' + encodeURIComponent(req.params.page) + '/r1.txt', function (exists) {
				if(!exists) {
					fs.mkdir('./history/' + encodeURIComponent(req.params.page), 777, function(err) {
						fs.open('./history/' + encodeURIComponent(req.params.page) + '/r1.txt','w+',function(err,fd){
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1.txt', req.body.content, 'utf8');
						});
						fs.open('./history/' + encodeURIComponent(req.params.page) + '/r1-ip.txt','w+',function(err,fd){
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-ip.txt', ip, 'utf8');
						});
						fs.open('./history/' + encodeURIComponent(req.params.page) + '/r1-today.txt','w+',function(err,fd){
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-today.txt', today, 'utf8');
						});
						fs.open('./history/' + encodeURIComponent(req.params.page) + '/r1-send.txt','w+',function(err,fd){
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-send.txt', req.body.send, 'utf8');
						});
					});
				}
				else {
					var i = 0;
					while(true) {
						i = i + 1;
						var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
						if(!exists) {
							fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt','w+',function(err,fd){
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt', req.body.content, 'utf8');
							});
							fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt','w+',function(err,fd){
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt', ip, 'utf8');
							});
							fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt','w+',function(err,fd){
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt', today, 'utf8');
							});
							fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt','w+',function(err,fd){
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt', req.body.send, 'utf8');
							});
							break;
						}
					}
				}
			});
		}
		else {
			fs.writeFileSync('./data/' + encodeURIComponent(req.params.page)+'.txt', req.body.content, 'utf8');
			fs.exists('./history/' + encodeURIComponent(req.params.page) + '/r1.txt', function (exists) {
				if(!exists) {
					fs.mkdir('./history/' + encodeURIComponent(req.params.page), 777, function(err) {
						fs.open('./history/' + encodeURIComponent(req.params.page) + '/r1.txt','w+',function(err,fd){
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1.txt', req.body.content, 'utf8');
						});
						fs.open('./history/' + encodeURIComponent(req.params.page) + '/r1-ip.txt','w+',function(err,fd){
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-ip.txt', ip, 'utf8');
						});
						fs.open('./history/' + encodeURIComponent(req.params.page) + '/r1-today.txt','w+',function(err,fd){
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-today.txt', today, 'utf8');
						});
						fs.open('./history/' + encodeURIComponent(req.params.page) + '/r1-send.txt','w+',function(err,fd){
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-send.txt', req.body.send, 'utf8');
						});
					});
				}
				else {
					var i = 0;
					while(true) {
						i = i + 1;
						var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
						if(!exists) {
							fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt','w+',function(err,fd){
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt', req.body.content, 'utf8');
							});
							fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt','w+',function(err,fd){
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt', ip, 'utf8');
							});
							fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt','w+',function(err,fd){
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt', today, 'utf8');
							});
							fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt','w+',function(err,fd){
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt', req.body.send, 'utf8');
							});
							break;
						}
					}
				}
			});
		}
	});
	res.redirect('/w/'+ encodeURIComponent(req.params.page))
});
// 역사 2
router.get('/history/:page/:r', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var title3 = encodeURIComponent(req.params.page);
	fs.exists('./history/' + encodeURIComponent(req.params.page) + '/' + req.params.r + '.txt', function (hists) {
		if(hists) {
			var neob = fs.readFileSync('./history/' + encodeURIComponent(req.params.page) + '/' + req.params.r + '.txt', 'utf8');
			neob = neob.replace(/<br>/g, '[br]')
			neob = neob.replace(/\n/g, '<br>')
			var raw = htmlencode.htmlEncode(neob);
			raw = raw.replace(/;&lt;br&gt;/g, '<br>');
			res.status(200).render('history', { title: req.params.page, title3: title3, title2: req.params.page + ' (' + req.params.r + ' 판)', content: raw, wikiname: name , License: licen});
			res.end()
		}
		else {
			res.status(404).render('history', { title: req.params.page, title3: title3, content: "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>", License: licen ,wikiname: name});
			res.end()
			return;
		}
	});
});
// 역사
router.get('/history/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	
	var admin = yourip(req, res);
	
	var dis2 = loginy(req,res)
	var title2 = encodeURIComponent(req.params.page);
	var i = 0;
	var neoa = '<div id="history">';
	
	while(true) {
		i = i + 1;
		var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
		if(exists) {
			var ip = fs.readFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt', 'utf8');
			var today = fs.readFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt', 'utf8');
			var send = fs.readFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt', 'utf8');
			var exists = fs.existsSync('./user/' + admin + '-admin.txt');
			if(exists) {
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
				if(exists) {
					var ban = '풀기';
				}
				else {
					var ban = '차단';
				}
				neoa = '<table id="toron"><tbody><tr><td id="yosolo"><a href="/history/' + encodeURIComponent(req.params.page) + '/r' + i + '">r' + i + '</a></td><td id="yosolo">' + ip + ' <a href="/ban/' + ip + '">(' + ban + ')</a></td><td id="yosolo">' + today +'</td></tr><tr><td colspan="3" id="yosolo">' + send + '</td></tr></tbody></table>' + neoa;
			}
			else {
				neoa = '<table id="toron"><tbody><tr><td id="yosolo"><a href="/history/' + encodeURIComponent(req.params.page) + '/r' + i + '">r' + i + '</a></td><td id="yosolo">' + ip + '</td><td id="yosolo">' + today +'</td></tr><tr><td colspan="3" id="yosolo">' + send + '</td></tr></tbody></table>' + neoa;
			}
		}
		else {
			neoa = neoa + '</div>';
			var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page) + '-stop.txt');
			if(exists) {
				neoa = '<table id="toron"><tbody><td id="yosolo">관리자만 편집 가능한 문서 입니다.</td></tr></tbody></table>' + neoa;
			}
			res.status(200).render('history2', { title: req.params.page, dis2:dis2, title2:title2, content: neoa, License: licen ,wikiname: name});
			break;
			res.end()
			return;
		}
	}
});

module.exports = router;