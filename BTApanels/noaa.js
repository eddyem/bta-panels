// http://www.esrl.noaa.gov/gmd/grad/solcalc/azel.html
(function () { 'use strict';
	var NOAAcalc = {};
	const
	PI    = Math.PI,
	PI_2  = PI/2,
	_2PI  = 2*PI,
	DegToRad = PI/180.,
	RadToDeg = 180./PI,
	J2000 = 2451545.0; // JD of 2000yr
	var
		floor = Math.floor,
		abs   = Math.abs,
		sqrt  = Math.sqrt;
	// all inner angle functions are in degrees!
	function sin(deg){return Math.sin(deg * DegToRad);}
	function cos(deg){return Math.cos(deg * DegToRad);}
	function tan(deg){return Math.tan(deg * DegToRad);}
	function asin(deg){return RadToDeg * Math.asin(deg);}
	function acos(deg){return RadToDeg * Math.acos(deg);}
	function atan(y,x){return RadToDeg * Math.atan2(y,x);}
	function d360(angle){
		return(angle - floor(angle/360.0)*360);
	}
	function d180(angle){
		var a = d360(angle);
		if(a > 180) a -= 360;
		return a;
	}

	function calcJD(d){
		var dayMs = 1000 * 60 * 60 * 24,
		J1970 = 2440588;
		return (d.valueOf()/dayMs - 0.5 + J1970)
	}
	NOAAcalc.calcJD = calcJD;
	function calcTimeJulianCent(jd){
		return ((jd - J2000)/36525.0);
	}
	// argument t in all functions is in Julian cents
	function calcGeomMeanAnomalySun(t){
		return (357.52911 + t * (35999.05029 - 0.0001537 * t));
	}
	function calcSunEqOfCenter(t){
		var m = calcGeomMeanAnomalySun(t);
		var sinm = sin(m);
		var sin2m = sin(2*m);
		var sin3m = sin(3*m);
		return (sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) +
				sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289);
	}
	function calcSunTrueAnomaly(t){
		var m = calcGeomMeanAnomalySun(t);
		var c = calcSunEqOfCenter(t);
		return d360(m + c);
	}
	function calcEccentricityEarthOrbit(t){
		return (0.016708634 - t * (0.000042037 + 0.0000001267 * t));
	}
	function calcSunRadVector(t){
		var v = calcSunTrueAnomaly(t);
		var e = calcEccentricityEarthOrbit(t);
 		var R = (1.000001018 * (1 - e * e)) / (1 + e * cos(v));
		return R;
	}
	function calcMeanObliquityOfEcliptic(t){
		var seconds = 21.448 - t*(46.8150 + t*(0.00059 - t*(0.001813)));
		return (23.0 + (26.0 + (seconds/60.0))/60.0);
	}
	function calcObliquityCorrection(t){
		var e0 = calcMeanObliquityOfEcliptic(t);
		var omega = 125.04 - 1934.136 * t;
		var e = e0 + 0.00256 * cos(omega);
		return d360(e);
	}
	function calcGeomMeanLongSun(t){
		var L0 = 280.46646 + t * (36000.76983 + 0.0003032 * t);
		return d360(L0);
	}
	function calcSunTrueLong(t){
		var l0 = calcGeomMeanLongSun(t);
		var c = calcSunEqOfCenter(t);
		return d360(l0 + c);
	}
	function calcSunApparentLong(t){
		var o = calcSunTrueLong(t);
		var omega = 125.04 - 1934.136 * t;
		return d360(o - (0.00569 - 0.00478 * sin(omega)));
	}
	function calcSunRtAscension(t){
		var e = calcObliquityCorrection(t);
		var lambda = calcSunApparentLong(t);
 		var tananum = cos(e) * sin(lambda);
		var tanadenom = cos(lambda);
		return atan(tananum, tanadenom);
	}
	function calcSunDeclination(t){
		var e = calcObliquityCorrection(t);
		var lambda = calcSunApparentLong(t);
		var sint = sin(e) * sin(lambda);
		return asin(sint);
	}
	function calcEquationOfTime(t){
		var epsilon = calcObliquityCorrection(t);
		var l0 = calcGeomMeanLongSun(t);
		var e = calcEccentricityEarthOrbit(t);
		var m = calcGeomMeanAnomalySun(t);
		var y = tan(epsilon/2.0);
		y *= y;
		var sin2l0 = sin(2.0 * l0);
		var sinm   = sin(m);
		var cos2l0 = cos(2.0 * l0);
		var sin4l0 = sin(4.0 * l0);
		var sin2m  = sin(2.0 * m);
		var Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0
				- 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;
		return Etime*4.0;	// in minutes of time
	}
	function Refract(zenith){
		var refractionCorrection = 0., exoatmElevation = 90. - zenith;
		if(exoatmElevation < 85){
			var te = tan(exoatmElevation);
			if (exoatmElevation > 5){
				refractionCorrection = 58.1 / te - 0.07 / (te*te*te) +
					0.000086 / (te*te*te*te*te);
			} else if (exoatmElevation > -0.575) {
				refractionCorrection = 1735.0 + exoatmElevation *
					(-518.2 + exoatmElevation * (103.4 +
					exoatmElevation * (-12.79 + exoatmElevation * 0.711) ) );
			} else {
				refractionCorrection = -20.774 / te;
			}
			refractionCorrection /= 3600.0;
		}
		return refractionCorrection;
	}
	NOAAcalc.getSunPosition = function(adate, latitude, longitude){
			var JD = calcJD(adate);
			var T = calcTimeJulianCent(JD);
			//var R = calcSunRadVector(T);
			var alpha = calcSunRtAscension(T);
			var solarDec = calcSunDeclination(T);
			var eqTime = calcEquationOfTime(T);

			var solarTimeFix = eqTime + 4.*longitude + adate.getTimezoneOffset();
			var trueSolarTime = adate.getHours() * 60. + adate.getMinutes() +
				adate.getSeconds()/60. + solarTimeFix;
			// in minutes
			trueSolarTime -= floor(trueSolarTime/1440)*1440;

			var hourAngle = d360(trueSolarTime / 4.0 - 180.0);

			var csz = sin(latitude) * sin(solarDec) + cos(latitude) * cos(solarDec) * cos(hourAngle);
			if(csz > 1.0){csz = 1.0;} else if(csz < -1.0){csz = -1.0;}
			var azimuth, zenith = acos(csz);
			var azDenom = cos(latitude) * sin(zenith);
			if(abs(azDenom) > 0.001){
				var azRad = (sin(latitude) * cos(zenith) - sin(solarDec)) / azDenom;
				if(abs(azRad) > 1.0){
					if(azRad < 0){azRad = -1.0;} else {azRad = 1.0;}
				}
				azimuth = acos(azRad);
			}else{
				if(latitude > 0.0){azimuth = 0.;}else{azimuth = 180.;}
			}

			var solarZen = zenith - Refract(zenith);
			return{
				azimuth:  azimuth,
				altitude: 90. - solarZen,
				solarTimeFix: solarTimeFix,
				RA: alpha,
				Dec: solarDec
			};
	};

	function daynumber(adate){
		var Y = adate.getUTCFullYear(), M = adate.getUTCMonth() + 1;
		var d = 367 * Y - floor(7*(Y + floor((M+9)/12))/4) + floor(275*M/9) + adate.getUTCDate() - 730530;
		d += (adate.getUTCHours() + adate.getUTCMinutes()/60. + adate.getUTCSeconds()/3600.)/24.;
		return d;
	}
	// http://www.stjarnhimlen.se/comp/ppcomp.html
	NOAAcalc.getMoonPosition = function(adate, latitude, longitude){
/*
  Primary orbital elements of the Moon:
    N = 125.1228 - 0.0529538083 * d  - longitude of the ascending node
    i = 5.1454 - inclination to the ecliptic (plane of the Earth's orbit)
    w = 318.0634 + 0.1643573223 * d - argument of perihelion
    a = 60.2666  (Earth radii) - semi-major axis, or mean distance from Sun
    e = 0.054900 -  eccentricity (0=circle, 0-1=ellipse, 1=parabola)
    M = 115.3654 + 13.0649929509 * d - mean anomaly (0 at perihelion; increases uniformly with time)
  Related orbital elements are:
    w1 = N + w   - longitude of perihelion
    L  = M + w1  - mean longitude
    q  = a*(1-e) - perihelion distance
    Q  = a*(1+e) - aphelion distance
    P  = a ^ 1.5 - orbital period (years if a is in AU, astronomical units)
    T  = Epoch_of_M - (M(deg)/360_deg) / P  - time of perihelion
    v  - true anomaly (angle between position and perihelion)
    E  - eccentric anomaly

*/
		var d = daynumber(adate);
		var N = d360(125.1228 - 0.0529538083 * d),
			sinN = sin(N), cosN = cos(N),
			i = 5.1454,
			cosi = cos(i), sini = sin(i),
			w = d360(318.0634 + 0.1643573223 * d),
			a = 60.2666,
			e = 0.054900,
			M = d360(115.3654 + 13.0649929509 * d),
			E = d360(M + RadToDeg * e * sin(M) * (1.0 + e*cos(M)));

		// iterative correction of E
		var err = 1, E0=E, iter;
		for(iter = 0; iter < 20 && err > 1e-10; ++iter){
			var E1 = d360(E - (E - RadToDeg * e * sin(E) - M) / (1 - e * cos(E)));
			err = d360(abs(E - E1));
			E = E1;
		}

		var xv = a * (cos(E) - e),
			yv = a * sqrt(1.0 - e*e) * sin(E),
			v = atan(yv, xv),
			r = sqrt(xv*xv + yv*yv);
/*
Compute the planet's position in 3-dimensional space:
    xh = r * ( cos(N) * cos(v+w) - sin(N) * sin(v+w) * cos(i) )
    yh = r * ( sin(N) * cos(v+w) + cos(N) * sin(v+w) * cos(i) )
    zh = r * ( sin(v+w) * sin(i) )
    lonecl = atan2( yh, xh )
    latecl = atan2( zh, sqrt(xh*xh+yh*yh) )
*/
		// calculate sun mean anomaly & longitude; ALL in radians!
		var T = calcTimeJulianCent(calcJD(adate));
		var Ms = calcSunTrueAnomaly(T), // Mean Anomaly of the Sun
			Ls = calcGeomMeanLongSun(T),// Mean Longitude of the Sun
			Mm = M, // Mean Anomaly of the Moon
			Lm = d360(N + w + M), // Mean longitude of the Moon
			D = d360(Lm - Ls), // Mean elongation of the Moon
			F = d360(Lm - N); // Argument of latitude for the Moon
		var cosvw = cos(v + w), sinvw = sin(v + w),
			xh = r * (cosN * cosvw - sinN * sinvw * cosi),
			yh = r * (sinN * cosvw + cosN * sinvw * cosi),
			zh = r * sinvw * sini,
			elon = d360(atan(yh, xh)),
			elat = atan(zh, sqrt(xh*xh + yh*yh));

		var longAdd =
			-1.274 * sin(Mm - 2*D)
			+0.658 * sin(2*D)
			-0.186 * sin(Ms)
			-0.059 * sin(2*Mm - 2*D)
			-0.057 * sin(Mm - 2*D + Ms)
			+0.053 * sin(Mm + 2*D)
			+0.046 * sin(2*D - Ms)
			+0.041 * sin(Mm - Ms)
			-0.035 * sin(D)
			-0.031 * sin(Mm + Ms)
			-0.015 * sin(2*F - 2*D)
			+0.011 * sin(Mm - 4*D);

		var latAdd =
			-0.173 * sin(F - 2*D)
			-0.055 * sin(Mm - F - 2*D)
			-0.046 * sin(Mm + F - 2*D)
			+0.033 * sin(F + 2*D)
			+0.017 * sin(2*Mm + F);
		elon += longAdd;
		elat += latAdd;
		r -= 0.58 * cos(Mm - 2*D) + 0.46 * cos(2*D);
		// Geocentric (Earth-centered) coordinates
		var xh = r * cos(elon) * cos(elat),
			yh = r * sin(elon) * cos(elat),
			zh = r * sin(elat);
		var ecl = calcMeanObliquityOfEcliptic(T);
		// Equatorial coordinates
		var ye = yh * cos(ecl) - zh * sin(ecl),
			ze = yh * sin(ecl) + zh * cos(ecl),
			RA  = d360(atan(ye, xh)),
			Dec = atan(ze, sqrt(xh*xh+ye*ye));
		// Horizontal coords
		var GMST0=(Ls+180),
			UT=d-Math.floor(d),
			LST = GMST0+UT*360+longitude;
		var	HA = LST - RA,
			x = cos(HA) * cos(Dec),
			y = sin(HA) * cos(Dec),
			z = sin(Dec),
			xhor = x * sin(latitude) - z * cos(latitude),
			zhor = x * cos(latitude) + z * sin(latitude),
			az = d180(atan(y, xhor)),
			zd = 90. - asin(zhor);
			var MoonZen = zd - Refract(zd);
			return{
				azimuth:  az,
				zenith: MoonZen,
				altitude: 90. - MoonZen,
				RA:  RA,
				Dec: Dec
			};
	}
	window.NOAAcalc = NOAAcalc;
}());
