globCalc = function(){
	var SAOlat  = 43.653528; // SAO latitude 43 39 12.7
	var SAOlong = 41.4414375;// SAO longitude 41 26 29.175
	var PI = Math.PI;
	var _2deg = 180/PI;
	var Tmout;
	function $(x){return document.getElementById(x);}
	function init(){
		/*chaddtxt();
		$('timeplus').onchange = chaddtxt;*/
		recalculate();
	}
	function chval(id, val){document.getElementById(id).innerHTML = val;}
	function chcls(id, cls){document.getElementById(id).className = cls;}
	function chvalcls(id, val, cls){chval(id, val); chcls('Sun', cls + " border");}
	function chaddtxt(){
		var v = $('timeplus').value, h = Math.floor(v/60), m = v-h*60;
		chval('addto', _2(h)+":"+_2(m)+":00");
	}
	function recalculate(){
		clearTimeout(Tmout);
		var d = new Date();
/*		d.setTime(d.getTime() + $('timeplus').value*60000);
		chval('Date', formatDate(d));
		chval('Time', formatTime(d));
		chval('JD', Math.round(NOAAcalc.calcJD(d)*100000)/100000);*/
		var SunPos = NOAAcalc.getSunPosition(d, SAOlat, SAOlong);
		var MoonPos = NOAAcalc.getMoonPosition(d, SAOlat, SAOlong);
		delete d;
		var alt = SunPos.altitude, az = SunPos.azimuth;
	//	chval('SunA', formatAngle(az));
		chval('SunH',  Math.round(alt*10)/10 + "&deg;");
		chval('MoonA', Math.round(MoonPos.azimuth) + "&deg;");
		chval('MoonZ', Math.round(MoonPos.zenith) + "&deg;");
		// astronomical twilight
		alt *= _2deg;
		if(alt < -18) chvalcls('daytime', "night", "Black");
		else if(alt < -12) chvalcls('daytime', "astronomical twilight", "Gray");
		else if(alt < -6) chvalcls('daytime', "nautical twilight", "LGray");
		else if(alt < -0.833) chvalcls('daytime', "civil twilight", "Yellow");
		else if(alt < -0.3) chvalcls('daytime', az < 0 ? "sunrise" : "sunset", "Red");
		else chvalcls('daytime', "day", "White");
		//chval('STfix', Math.round(SunPos.solarTimeFix*1000)/1000);
		Tmout = setTimeout(recalculate, 1000);
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
	function formatAngle(ang){
		var neg = ang > 0 ? 0 : 1;
		ang = Math.abs(ang);
		var rnd = Math.floor;
		var deg = rnd(ang), mn = rnd((ang-deg)*60), sc = Math.round((ang-deg-mn/60)*3600);
		return (neg?"-":"")+_2(deg)+":"+_2(mn)+":"+_2(sc);
	}
	return{
		init : init
	};
}();
