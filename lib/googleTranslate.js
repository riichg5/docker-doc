/*
破解原理来源于网址网址：
https://www.52pojie.cn/thread-707169-1-1.html

根据自己的测试的实际情况总结出来的此代码文件：
1.调用翻译接口的时候，严格参考https://translate.google.cn网站上面请求的http header，做到一字不差.
	必须设置cookie这些，不然会302
*/

const rp = require('request-promise');


let group1 = {
	TTK: '429290.2124212286',
	headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
		'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
		'Host': 'translate.google.com.hk',
		'cache-control': 'no-cache',
		'accept-language': 'zh-CN,zh',
		// 'accept-encoding': 'gzip, deflate, br',
		'accept': '*/*',
		dnt: 1,
		pragma: 'no-cache',
		referer: 'https://translate.google.com.hk/',
		'cookie': '_ga=GA1.4.1276975893.1544868633; SID=1wZxeT82TNj2odZlM7eeX1Fa6t6i5vfT3rG_bbJ6t1vQ0Cx1Hs65jeAjdGNhSi7gt-Jk8A.; HSID=AuiEK-BZ5BXYKeEnB; SSID=ALqhO3-RFq1OjPity; APISID=s2RSr2c1dLxRNN-j/AZB9WJpNlg_GfgIRd; SAPISID=Ovt_4yJ9-DEh-CG1/AcHq3u3o-QaPOTl8k; NID=152=QRjxbx5MaKdcbRRaAX-i0j5BJe3N8cozIx-hvviowyaOsm5Z1zUDAkmiSNNkfPVcAzvOrCydPIHCSJvOGtG_AXUD9uwuVrX-7GYC0EzzPuV2dC84zyWJAY3yNc4SejS3I1gh_Tt6a2PfGK-RCraLPOMFbW9TgE32Zzs3wfsyoww1tmqlkt3oMjlBxFODJ5Vt2NX7FJ1eYsxG8DGzxawflS63e9dU0E1o_xfIBFLQOG2QOMKGxJ-y8M4ZBg9vdz-XDKupTl_DN3_Aa247vUz-qu-VnCekDILreKfK8ZresKs; _gid=GA1.4.1805126869.1545445070; 1P_JAR=2018-12-22-2',
		'x-client-data': 'CI22yQEIpLbJAQjEtskBCKmdygEIu53KAQignsoBCKijygEIv6fKAQjOp8oBCOKoygEY+aXKAQ=='
	}
};

let group2 = {
	TTK: "429323.3227851052",
	headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
		'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
		'Host': 'translate.google.com.hk',
		'cache-control': 'no-cache',
		'accept-language': 'zh-CN,zh',
		// 'accept-encoding': 'gzip, deflate, br',
		'accept': '*/*',
		dnt: 1,
		pragma: 'no-cache',
		referer: 'https://translate.google.com.hk/',
		'cookie': '_ga=GA1.3.479479230.1536129664; SID=1wZxeT82TNj2odZlM7eeX1Fa6t6i5vfT3rG_bbJ6t1vQ0Cx1Hs65jeAjdGNhSi7gt-Jk8A.; HSID=ANnt4Th549YEwK1bj; SSID=A4hvynWdqFcYhLAfX; APISID=s2RSr2c1dLxRNN-j/AZB9WJpNlg_GfgIRd; SAPISID=Ovt_4yJ9-DEh-CG1/AcHq3u3o-QaPOTl8k; _gid=GA1.3.2054620996.1545529001; S=antipasti_server_prod=x84D4jh8-YqNLYxpRRtamTdHvwJi8ZjN:adsense3-ui=q2xcQ9PrsnbndY3MMb2hBvCG989j99-x:billing-ui-v3=rJyq9kLZ4fQ8nSX8l-p5ZZmXlRMWfUXE:billing-ui-v3-efe=rJyq9kLZ4fQ8nSX8l-p5ZZmXlRMWfUXE; NID=152=mt2__ZpI5UANkffoZvOzAQ5QK6FNNrp0lNIymJW4AEsAcrWZ6YGMdYaNQ9HA51qd_Jvjp85DXvTxWA1lhxa95lGw7nejgJRHv3xP0E7u4vDIY84iptdA5Th25RnquULh-fWNcEidMrLk0UNMXphYjQWdcgaL3lCup37JGfzDaJre3ibpnIxvIyeomyuavctB0-vfoLgJ0D9pEqDE_29iEYaNBg_9Z-2K7YvFSLNc; 1P_JAR=2018-12-23-11; SIDCC=ABtHo-FzcX19iT65Ka5WylFpEOhttXqgN71z3MkaNLW5OBM3m1Cll4eCHm72897fZ8jCnbOh4Y0',
		'x-client-data': 'CI22yQEIpLbJAQjEtskBCKmdygEIqKPKAQi/p8oBCOynygEI4qjKARj5pcoB',
	}
};


//firefox
let group3 = {
	TTK: "429323.3227851052",
	headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:64.0) Gecko/20100101 Firefox/64.0',
		'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
		'Host': 'translate.google.com.hk',
		'cache-control': 'no-cache',
		'accept-language': 'zh-CN,zh',
		// 'accept-encoding': 'gzip, deflate, br',
		'accept': '*/*',
		dnt: 1,
		pragma: 'no-cache',
		referer: 'https://translate.google.com.hk/',
		'cookie': 'NID=152=zenEXi3YgDQ88GYDA7oKBd4UcAPSk8UipD9RS3Xn3emOVoBqYuqeu9Q5d9pidcoejqNbCPpdyDzEJ4DxuhftE-vufJEpHMbGtwXI2mpdj1x_ryuHaoqhzlRGfPnL68FlfCqMXfm_Qgc-EyD6LzCdQvBNk65QXSNYIp-NrkC_J-w; _ga=GA1.4.1534426199.1545565300; _gid=GA1.4.1157170379.1545565300; 1P_JAR=2018-12-23-11'
	}
};

let clients = [group1, group2, group3];
let currentClientIndex = 0;

function getClientInfo (needSwitch) {
	if(!needSwitch) {
		return clients[currentClientIndex];
	}

	currentClientIndex ++;

	if(currentClientIndex >= clients.length) {
		currentClientIndex = 0;
	}

	return clients[currentClientIndex];
}

let window = Object.create(null);
// window.TTK = '429290.2124212286';

// a:你要翻译的内容
// uq:tkk的值
function vq(a, uq) {
	if (null !== uq)
		var b = uq;
	else {
		b = sq('T');
		var c = sq('K');
		b = [b(), c()];
		b = (uq = window[b.join(c())] || "") || "";
	}
	var d = sq('t');
	c = sq('k');
	d = [d(), c()];
	c = "&" + d.join("") + "=";
	d = b.split(".");
	b = Number(d[0]) || 0;
	for (var e = [], f = 0, g = 0; g < a.length; g++) {
		var l = a.charCodeAt(g);
		128 > l ? e[f++] = l : (2048 > l ? e[f++] = l >> 6 | 192 : (55296 == (l & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023),
		e[f++] = l >> 18 | 240,
		e[f++] = l >> 12 & 63 | 128) : e[f++] = l >> 12 | 224,
		e[f++] = l >> 6 & 63 | 128),
		e[f++] = l & 63 | 128);
	}
	a = b;
	for (f = 0; f < e.length; f++)
		a += e[f],
		a = tq(a, "+-a^+6");
	a = tq(a, "+-3^+b+-f");
	a ^= Number(d[1]) || 0;
	0 > a && (a = (a & 2147483647) + 2147483648);
	a %= 1000000;
	return c + (a.toString() + "." + (a ^ b));
}

/*--------------------------------------------------------------------------------
参数：a 为你要翻译的原文
其他外部函数：
--------------------------------------------------------------------------------*/
function sq(a) {
	return function() {
		return a;
	};
}

function tq(a, b) {
	for (var c = 0; c < b.length - 2; c += 3) {
		var d = b.charAt(c + 2);
		d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
		d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
		a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d;
	}
	return a;
}

async function translate (opts) {
	let text = opts.text;
	let ctx = opts.ctx;
	let needSwitch = opts.needSwitch || false;

	let clientInfo = getClientInfo(needSwitch);
	window.TTK = clientInfo.TTK;

	let tk = vq(text, window.TTK).replace('&tk=', '');

	let requestOpts = {
		method: 'POST',
		uri: "https://translate.google.com.hk/translate_a/single",
		headers: clientInfo.headers,
		json: true,
		form: {
			client: 'webapp',
			sl: 'en',
			tl: 'zh-CN',
			hl: 'en',
			dt: 'at',
			dt: 'bd',
			dt: 'ex',
			dt: 'ld',
			dt: 'md',
			dt: 'qca',
			dt: 'rw',
			dt: 'rm',
			dt: 'ss',
			dt: 't',
			ie: 'UTF-8',
			oe: 'UTF-8',
			pc: 1,
			otf: 1,
			ssel: 0,
			tsel: 0,
			kc: 1,
			tk: tk,
			q: text
		}
	};

	let responseBody = await rp(requestOpts);

	ctx.logger.debug(`google translate response body: ${_utils.inspect({obj: responseBody})}`);
	// ctx.logger.debug(`responseBody2: ${responseBody[0][0][0]}`);

	if(responseBody && responseBody[0]) {
		let str = '';

		for(let item of responseBody[0]) {
			str += item[0];
		}

		return str;
	} else {
		return text;
	}
}

module.exports = translate;