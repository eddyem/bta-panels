<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<title>Метеорологические данные</title>
<meta http-equiv="content-type" content="text/html; charset=koi8-r">
<meta http-equiv="refresh" content="600">

<!--meta http-equiv="expires" content="Thu, 01 Jan 1970 00:00:01 GMT">
<meta http-equiv="cache-control" content="no-store, no-cache, must-revalidate, post-check=0, pre-check=0">
<meta http-equiv="pragma" content="no-cache"-->

<link href="panels.css" rel="stylesheet" type="text/css">
<script type="text/javascript" src="panels.js" language="javascript"></script>
</head>
<body onload="init('meteo');">
<table width="100%">
<tr>
<th class="border" colspan="3" id="header"><h1>Метеорологические данные</h1><br>
	<div class="topright hand" id="stop"></div>
	<div class="topleft" id="reqmsgs"></div>
	<table width="100%">
	<tr>
		<td>Дата: <span id="Date"></span></td>
		<td>Московское время: <span id="Mtime"></span></td>
		<td>Звездное время: <span id="Stime"></span></td>
	</tr>
	</table>
</th></tr>
<tr>
	<td style="max-width: 800px;" width="45%" class="border">
		<img id="BigIMG" width="100%"><br>
		<img id="GuideIMG" width="49%">
		<img id="CatIMG" width="49%">
	</td>
	<td style="max-width: 50%;" class="border">
		<img width="100%" id="clouds">
		<div class="inline">Температура: внешняя <span id="ValTout"></span><sup>o</sup>C,
			внутренняя <span id="ValTind"></span><sup>o</sup>C,
			зеркала <span id="ValTmir"></span><sup>o</sup>C
		</div>
		<img width="100%" id="temp">
		<img width="100%" id="wind">
		<img width="100%" id="seeing">
	</td>
	<td class="border" width="150px">
		<div class="label">Облачность</div>
		<div id="weather" class="Yellow border">--</div>
		<div class="label">Разность температур</div>
		<div id="tempdiff" class="border"></div>
		<div class="label">Время перепада температуры >10<sup>o</sup>C</div>
		<div id="Blast10" class="border"></div>
		<div class="label">Скорость ветра</div>
		<div id="windspeed" class="border"></div>
		<div class="label">Время последнего порыва >15м/с</div>
		<div id="Blast15" class="border"></div>	
		<div class="label">Направление ветра</div>
		<img width="100%" id="winddir">
		<div class="label">Качество изображения</div>
		<div id="seeingval" class="border">--</div>
	</td>
</tr>
</table>
</body>
</html>
