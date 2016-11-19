var Stimeout, Itimeout; // таймеры для обновления времени и изображения
var Rtimeout, Etimeout; // таймер запросов, таймаут сообщ. об ошибке
const  Stimeout_rate = 500, Itimeout_rate = 30000, Rtimeout_rate = 5000;
var ImageSrc = []; // адрес изображения
var oldDate = 0; // дата/время на момент последнего обновления (в мс)
var MskTime, SidTime; // московское и звездное время
var PanelType;

const paramsURL = ["http://tb.sao.ru/cgi-bin/eddy/bta_print.cgi",
				"http://ishtar.sao.ru/cgi-bin/bta_print.cgi"];
const MeteoURL = [ "http://tb.sao.ru/cgi-bin/eddy/tempmon",
				"http://ishtar.sao.ru/cgi-bin/tempmon"];
var URLcntr = 0;
const windURL = "http://ztcs.sao.ru/meteo/wind.png";
const BTAURL = "http://tb.sao.ru/tcs/ctrl/bta_img.cgi?size=150&mode=";
const GuideURL = "http://n2.sao.ru/webcam/webcam_n2_0.jpeg";
const USNOURL = "http://n2.sao.ru/ua2/gd15_ua2_jpeg.cgi?size=384&coord=cur";

const TEST = false; // set to false in release
function tlog__(msg){console.log(msg);}
var tlog;
if(TEST) tlog = tlog__;
else tlog = function(msg){};

var Storage = null;

localCookies = function(){
function get(nm){
	tlog("get " + nm);
	var name = nm + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i < ca.length; i++){
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) != -1)
			return c.substring(name.length,c.length);
	}
	return "";
}
function set(nm, val){
	tlog("set "+ nm + " to " + val);
	document.cookie = nm + "=" + val + ";";
	tlog(document.cookie);
}
return{
    getItem : get,
    setItem : set
    };
}();


function checkStorage(){
	if(Storage) return;
	var ret;
	try{
		ret = localStorage;
	} catch(e){
		console.log("Can't get localstorage! " + e);
		ret = localCookies;
	}
	Storage = ret;
}

/*
 * Load object nm from local storage
 * if it's absent set it to defval or return null if devfal undefined
 */
function LoadObject(nm, defval){
	checkStorage();
	var val = null;
	try{
		var X = Storage.getItem(nm);
		tlog("Storage:" + X);
		val = JSON.parse(X);
	}catch(e){
		console.log("Nothing in storage! " +e);
	}
	if(val == null && typeof(defval) != "undefined"){
		tlog("Can't load object, try to use defaults");
		val = defval;
	}else
		tlog("load object " + nm + " with value " + val);
	return val;
}
/*
 * Save object obj in local storage as nm
 */
function SaveObject(obj, nm){
	checkStorage();
	tlog("save " + obj);
	Storage.setItem(nm, JSON.stringify(obj));
}

var Isrc = 0; // number of image source

function $(Id){
	return document.getElementById(Id);
}

function _(Name){
	return document.getElementsByTagName(Name);
}

function chBigImg(){
    var l = ImageSrc.length;
    if(++Isrc >= l) Isrc = 0;
	$('BigIMG').src = ImageSrc[Isrc] + "?" + Math.random();
	SaveObject(Isrc, "ImageSrc");
}

function init(panelName){
	$('reqmsgs').innerHTML = "Loading...";
	MskTime = new Date();
	SidTime = new Date();
	make_menu(panelName);
	PanelType = panelName;
	if(panelName == "BTA")
		ImageSrc.push("http://tb.sao.ru/webcam/webcam_sky_1_maxi.jpeg");
	else if(panelName == "meteo"){
        ImageSrc.push("http://zserv.sao.ru/webcam/webcam_zserv_3_maxi.jpeg");
		ImageSrc.push("http://zserv.sao.ru/webcam/webcam_zserv_2_maxi.jpeg");
		ImageSrc.push("http://tb.sao.ru/~eddy/allsky.jpg");
		$('BigIMG').onclick = chBigImg;
		$('BigIMGlabel').onclick = chBigImg;
		Isrc = LoadObject("ImageSrc", 0); // номер адреса изображения
	}
	startTimers();
}

function make_menu(panelName){
	var chooserTimeout;
	var names = [ "BTA", "meteo" ];
	var URLS = [ "BTA.html", "weather.html" ];
	var itemstext = [ "Bta info", "meteo info" ];
	var l = names.length, i;
	var menu = $('menu');
	menu.innerHTML = "Choose panel's info";
	var chooser = document.createElement("div");
	chooser.className = "chooser";
	chooser.id = "chooser";
	chooser.onmouseout = function(){
		chooserTimeout=setTimeout("$('chooser').style.display='none';",2000);};
	chooser.onmouseover = function(){ clearTimeout(chooserTimeout); };
	menu.appendChild(chooser);
	menu.onclick = function(){ showhide('chooser'); };
	for(i = 0; i < l; i++){
		if(names[i] == panelName) continue;
		var item = document.createElement("div");
		item.innerHTML = "<a href=\""+URLS[i]+"\">"+itemstext[i]+"</a>";
		chooser.appendChild(item);
	}
}

function showhide(id){
	style = $(id).style.display;
	if(style == "block") $(id).style.display = "none";
	else $(id).style.display = "block";
}

function refreshTimer(){
	var d = new Date();
	var diff = d.getTime() - oldDate;
	//oldDate = d.getTime();
	clearTimeout(Stimeout);
	$('Date').innerHTML = formatDate(MskTime);
	if(typeof(M_time) != "undefined"){
		//MskTime.setTime(MskTime.getTime() + diff);
		//$('Mtime').innerHTML = formatTime(MskTime);
		d.setTime(MskTime.getTime() + diff);
		$('Mtime').innerHTML = formatTime(d);
	}
	if(typeof(S_time) != "undefined"){
		//SidTime.setTime(SidTime.getTime() + diff);
		//$('Stime').innerHTML = formatTime(SidTime);
		d.setTime(SidTime.getTime() + diff);
		$('Stime').innerHTML = formatTime(d);
	}
	Stimeout = setTimeout(refreshTimer, Stimeout_rate);
	delete(d);
}

function sendR(){
	var request;
	sendRequest(request, paramsURL[URLcntr], "", parceReqStr);
}

function refreshImage(){
	var yesterday = oldDate/1000 - 86400;
	var imH = (window.innerHeight-$('header').offsetHeight-40)/4-20;
	if(imH < 100) imH = 100;
	function refreshIMG(id, URL){
		/*var oldIMG = $(id);
		var newIMG = document.createElement("img");
		var parent = oldIMG.parentNode;
		newIMG.src = URL;
		parent.insertBefore(newIMG, oldIMG);
		oldIMG.src = null;
		parent.removeChild(oldIMG);
		delete(oldIMG);
		newIMG.id = id;*/
		$(id).src = URL;
	}
	var params = MeteoURL[URLcntr] + "?Tstart=" + yesterday + "&Stat=31&height="+imH + "&Gtype=0&Graph=";
	clearTimeout(Itimeout);
	var rnd = Math.random();
	refreshIMG('BigIMG', ImageSrc[Isrc] + "?" + rnd);
	if(PanelType == "meteo"){
		// временно вместо облаков и качества изображения пишем давление и влажность
		refreshIMG('clouds', params + "16");
		refreshIMG('temp',   params + "7");
		refreshIMG('wind',   params + "8");
		refreshIMG('seeing', params + "32");
		refreshIMG('winddir',windURL+ "?" + rnd);
		refreshIMG('GuideIMG', GuideURL + "?" + rnd);
		refreshIMG('CatIMG', USNOURL + "&" + rnd);
	}
	else if(PanelType == "BTA"){
		refreshIMG('A', BTAURL + "1&" + rnd);
		refreshIMG('Z', BTAURL + "2&" + rnd);
		refreshIMG('P2', BTAURL + "3&" + rnd);
	}
	Itimeout = setTimeout(refreshImage, Itimeout_rate);
}

function handleError(msg) {
	clearTimeout(Etimeout);
	$('reqmsgs').innerHTML = "<b>Ошибка xmlhttprequest:<b>" + msg;
	Etimeout = setTimeout(function(){$('reqmsgs').innerHTML = "";}, 5000);
	URLcntr++; if(URLcntr > 1) URLcntr = 0;
	sendR();
	refreshImage();
	refreshTimer();
}

function sendRequest(request, CGI_PATH, req_STR, fn_OK){
	var timeout_id, str;
	if(window.XMLHttpRequest){
		request = new XMLHttpRequest();
		if(request.overrideMimeType)
			request.overrideMimeType("text/plain;");
	}else{
		 if(window.ActiveXObject){
				var sign_a = ['MSXML2.XMLHTTP.6.0',
					'MSXML2.XMLHTTP.5.0',
					'MSXML2.XMLHTTP.4.0',
					'MSXML2.XMLHTTP.3.0',
					'MSXML2.XMLHTTP',
					'Microsoft.XMLHTTP'];
					for(var i=0, l=sign_a.length; i<l; i++)
						try{
							request = new ActiveXObject(sign_a[i]);
							i = l;
						}catch(e){}
		 }
	}
	if(!request){
		handleError("Your browser doesn't support web requests");
		return;
	}
	request.onreadystatechange=function(){
		if(request.readyState == 4){
			if(request.status == 200){
				clearTimeout(timeout_id);
				fn_OK(request);
			}
			else{
				clearTimeout(timeout_id);
				if(request.status)
					handleError(request.statusText);
				else handleError("Data transfer error");
			}
		}
	}
	request.open("POST", CGI_PATH, true);
	request.send(req_STR);
	timeout_id = setTimeout(function(){
		request.onreadystatechange = null;request.abort();handleError("Time over");}, 5000);
}

function setDate(date, dateStr){
	var tm = dateStr.split(':');
	if(tm.length != 3) return false;
	date.setSeconds(tm[2]);
	date.setMinutes(tm[1]);
	date.setHours(tm[0]);
	return true
}

function _2(num){
	var A = Math.round(num).toString();
	if(A.length > 1) return A;
	else return ("00" + A).slice(-2);
}

function formatDate(date){
	if(date.toLocaleFormat) return date.toLocaleFormat("%d.%m.%Y");
	else
		return _2(date.getDate())+"."+_2(1+date.getMonth())+"."+date.getFullYear();
}

function formatTime(date){
	if(date.toLocaleFormat) return date.toLocaleFormat("%H:%M:%S");
	else
		return _2(date.getHours())+":"+_2(date.getMinutes())+":"+_2(date.getSeconds());
}

function parceReqStr(request){
	var i, l, lines, pair, parms, el;
	clearTimeout(Stimeout);
	clearTimeout(Rtimeout);
	lines = request.responseText.split('\n');
	for(i=0, l=lines.length; i<l; i++)
		if(lines[i].search('=') != -1){
			eval(lines[i]);
			parms = lines[i].split('=');
			if(el = $(parms[0])) el.innerHTML = eval(parms[0]);
		}
	var d = new Date();
	oldDate = d.getTime();
	delete(d);
	$('Date').innerHTML = formatDate(MskTime);
	if(typeof(M_time) != "undefined"){
		if(setDate(MskTime, M_time))
			$('Mtime').innerHTML = formatTime(MskTime);
	}
	if(typeof(S_time) != "undefined"){
		if(setDate(SidTime, S_time))
			$('Stime').innerHTML = formatTime(SidTime);
	}
	Stimeout = setTimeout(refreshTimer, Stimeout_rate);
	Rtimeout = setTimeout(sendR, Rtimeout_rate);
	function showVal(elId, val, bad, good){
		$(elId).innerHTML = Number(val).toFixed(1);
		var classname = "", absval = Math.abs(val);
		if(absval >= bad) classname = "Red";
		else if(absval < good) classname = "Green";
		else classname = "Yellow";
		 $(elId).className = classname + " border";
	}
	if(PanelType == "meteo"){
		showVal("tempdiff", ValTout - ValTmir, 10, 5);
		showVal("windspeed", ValWind, 15, 10);
		if(Blast15 == " " && Blast10 == " ") $('Gust').innerHTML = "no";
		else showGustTime();
	}
	else if(PanelType == "BTA"){
		$('ACS_BTA').className = "border "+((ACS_BTA!="On")?"Yellow":"Green");
		$('P2_Mode').className = "border "+((P2_Mode=="Stop")?"Yellow":"Green");
		var colr = "Yellow";
		switch(Tel_Mode){
			case "Pointing" : colr = "Blue"; break;
			case "Tracking": colr = "Green"; break;
			case "Seeking" :
			case "Correction" : colr = "Cyan"; break;
			case "Off" : colr = "Red"; break;
			case "Waiting" : colr = "White"; break;
			case "Testing" : colr = "Black"; break;
		}
		$('Tel_Mode').className = "border "+colr;
	}
}

function showGustTime(){
	var Gust = $('Gust');
	var Gtime = Number(Blast15);
	var pref = ">=15 m/s";
	if (Gtime > 60){
		var G10 = Number(Blast10);
		if(G10 < 1440){
			pref = ">=10 m/s";
			Gtime = G10;
		}else{
			Gust.innerHTML = "More than a day ago";
			return;
		}
	}
	var now = new Date();
	var h = Math.floor(Gtime/60);
	now.setTime(MskTime.getTime() - Gtime * 60000);
	var str = (Gtime < 1) ? _2(Gtime*60)+"s" : ((Gtime < 60)? _2(Gtime)+"m" :
			_2(h)+"h "+_2(Gtime%h)+"m");
	Gust.innerHTML = pref+"<br>"+_2(now.getHours())+":"+_2(now.getMinutes())+"<br>("+str+" ago)";
	if(Gtime >= 60) Gust.className = "border";
	else Gust.className = "Yellow border";
	delete(now);
}

function stopTimers(){
	clearTimeout(Stimeout);
	clearTimeout(Itimeout);
	clearTimeout(Rtimeout);
	$('stop').innerHTML="Start refreshing";
	$('stop').onclick=startTimers;
}

function startTimers(){
	sendR();
	$('stop').innerHTML="Stop refreshing";
	$('stop').onclick=stopTimers;
	var d = new Date();
	oldDate = d.getTime();
	delete(d);
	refreshImage();
	clearTimeout(Etimeout);
	Etimeout = setTimeout(function(){$('reqmsgs').innerHTML = "";}, 1000);
}
