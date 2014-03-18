<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<title>Информация БТА</title>
<meta http-equiv="content-type" content="text/html; charset=koi8-r">
<meta http-equiv="refresh" content="600">

<!--meta http-equiv="cache-control" content="no-cache">
<meta http-equiv="pragma" content="no-cache"-->

<link href="panels.css" rel="stylesheet" type="text/css">
<script type="text/javascript" src="panels.js" language="javascript"></script>
</head>
<body onload="init('BTA');">
<table width="100%">
<tr>
<th class="border" colspan="3" id="header"><h1>Информация о БТА</h1><br>
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
	<td style="max-width: 800px;" width="50%" class="border">
		<img id="BigIMG" width="100%">
	</td>
	<td style="max-width: 50%;" class="border">
		<table>
			<tr>
				<td width="66%">
					<table>
						<tr>
							<td></td>
							<td>Азимут</td>
							<td>Зенитное расстояние</td>
						</tr>
						<tr>
							<td></td>
							<td><img id="A"></td>
							<td><img id="Z"></td>
						</tr>
						<tr>
							<td class="right">Цель</td>
							<td id="CurAzim"></td>
							<td id="CurZenD"></td>
						</tr>
						<tr>
							<td class="right">Положение</td>
							<td id="ValAzim"></td>
							<td id="ValZenD"></td>
						</tr>
						<tr>
							<td class="right">Разность</td>
							<td id="DiffAzim"></td>
							<td id="DiffZenD"></td>
						</tr>
						<tr>
							<td class="right">Скорость</td>
							<td id="VelAzim"></td>
							<td id="VelZenD"></td>
						</tr>
						<tr>
							<td class="right">Коррекция</td>
							<td id="CorrAzim"></td>
							<td id="CorrZenD"></td>
						</tr>
						<tr>
							<td></td>
							<td>Прямое восхождение</td>
							<td>Склонение</td>
						</tr>
						<tr>
							<td class="right">Текущие</td>
							<td id="CurAlpha"></td>
							<td id="CurDelta"></td>
						</tr>
						<tr>
							<td class="right">Исходные</td>
							<td id="SrcAlpha"></td>
							<td id="SrcDelta"></td>
						</tr>
						<tr>
							<td class="right">Введенные</td>
							<td id="InpAlpha"></td>
							<td id="InpDelta"></td>
						</tr>
						<tr>
							<td class="right">Коррекция</td>
							<td id="CorrAlpha"></td>
							<td id="CorrDelta"></td>
						</tr>
						<tr>
							<td class="right">Положение</td>
							<td id="TelAlpha"></td>
							<td id="TelDelta"></td>
						</tr>
						</table>
				</td>
				<td style="padding-left: 30px;">
					<table>
						<tr>
							<td class="right">Система</td>
							<td id="ACS_BTA" class="border"></td>
						</tr>
						<tr>
							<td class="right">Состояние</td>
							<td id="Tel_Mode" class="border"></td>
						</tr>
						<tr>
							<td class="right">Фокус</td>
							<td id="Tel_Focus" class="border"></td>
						</tr>
					</table>
					<div class="label">Значение фокуса</div>
					<div class="border" id="ValFoc"></div>
					<div class="label">P2</div>
					<img id="P2">
					<div>Цель: <span id="CurPA"></span></div>
					<div>Положение: <span id="ValP2"></span></div>
					<div class="label">Состояние</div>
					<div class="border" id="P2_Mode"></div>
				</td>
			</tr>
		</table>
	</td>
</tr>
</table>
</body>
</html>