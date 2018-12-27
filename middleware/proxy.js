const proxy = require('koa-better-http-proxy');
const cheerio = require('cheerio');
const translate = require(_base + 'lib/googleTranslate');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mkdirp = _util.promisify(require('mkdirp'));

//code和script的text节点不处理
const notTranslateTagNames = ['code', 'script', 'link', 'meta', 'style', 'base'];

async function setNodeValue ($node, ctx) {
	let domObj = $node[0];

	// console.log(`domObj.nodeType: ${domObj.nodeType}, tagName: ${domObj.tagName}`);
	if(domObj.nodeType == 3) {
		if(domObj.nodeValue.trim().length > 0
			&& notTranslateTagNames.indexOf(domObj.parent.tagName) === -1) {

			// let translateResult = await translate.getText(domObj.nodeValue, {to: 'zh-CN'});
			// console.log(`tagName: ${domObj.parent.tagName}, nodeValue: ${domObj.nodeValue} -> ${translateResult.text}`);
			// domObj.nodeValue = translateResult.text.trim();

			let translateItemInfo = setTranslate(ctx, domObj.nodeValue);
			domObj.nodeValue = translateItemInfo.flagStr;
			// domObj.nodeValue = "test";
		}
	} else if(domObj.nodeType == 1) {
		let $children = $node.contents();
		for(let i=0; i<$children.length; i++) {
			setNodeValue($children.eq(i), ctx);
		}
	}
}

async function getTranslateResult (text, ctx) {
	// let translateResult = await translate(text, {from: 'en', to: 'zh-CN'});

	let translateResult;
	let isOk = false;
	let wait = 5;
	let counter = 0;

	while(!isOk) {
		try {
			if(counter > 0) {
				ctx.logger.warn(`Try again a ${counter} time!`);
			}

			translateResult = await translate({
				text: text,
				ctx: ctx,
				needSwitch: (counter + 1) % 3 === 0
			});
			isOk = true;
		} catch (error) {
			counter += 1;
			wait += 5;
			ctx.logger.error(` ---> system will waiting ${wait} seconds. <---- \r\n error message: ${error.message}, stack: ${error.stack}`);
			await _utils.randomIntervalWait({wait: wait});
		}
	}

	return translateResult || "";
}

async function translateHtml ($, ctx) {
	let translateInfo = getTranslateInfo(ctx);
	let wordsLength = translateInfo.wordsInfos.length;
	let counter = 0;

	await _utils.coEach({
		collection: translateInfo.wordsInfos,
		limit: 20,
		func: async (item) => {
			try {
				counter++;
				let waitSecond = await _utils.randomIntervalWait();
				ctx.logger.info(`translate ${counter}/${wordsLength}, waited ${waitSecond} seconds.`);
				ctx.logger.info(`-> translate: ${item.words}`);
				item.translatedWords = await getTranslateResult(item.words, ctx);
				ctx.logger.info(`-> translated: ${item.translatedWords}`);
			} catch (error){
				item.translatedWords = item.words;
				ctx.logger.error(`translate '${item.words}' erorred., error: ${error.message}, stack: ${error.stack}`);
			}

		}
	});

	let html = $("*").html();
	//替换html标记
	for(let item of translateInfo.wordsInfos) {
		html = html.replace(item.flagStr, item.translatedWords);
	}

	return html;
}

function initTranslate (ctx) {
	let obj = Object.create(null);

	obj.max = 0;
	obj.wordsInfos = [];

	ctx.setData({key: 'translate', data: obj});
}

function setTranslate (ctx, words) {
	let translateInfo = ctx.getData('translate');

	let mapItem = Object.create(null);
	mapItem.index = translateInfo.max;
	mapItem.words = words.replace(/\n/gi, '');
	mapItem.translatedWords = "";
	mapItem.flagStr = `{{${mapItem.index}}}`;

	translateInfo.max += 1;

	translateInfo.wordsInfos.push(mapItem);

	return mapItem;
}

function getTranslateInfo (ctx) {
	return ctx.getData('translate');
}

async function procHtmlText (opts) {
	let proxyRes = opts.proxyRes;
	let proxyResData = opts.proxyResData;
	let ctx = opts.ctx;

	ctx.logger.info(`url: ${proxyRes.url}, ${ctx.url}`);

	const $ = cheerio.load(proxyResData);

	//提取bottom_footer
	$("#ratings-div").html("");
	let $bottomFooter = $("div.bottom_footer");
	$bottomFooter.find("p.copyright").html("本文翻译自Docker官方文档，原文链接<a target=\"_blank\" href=\"https://docs.docker.com"+`${ctx.request.url}`+"\">点击这里</a>");
	$bottomFooter.find("div.footer_social_nav").html('');

	let $children = $("body").contents();

	for(let i=0; i<$children.length; i++) {
		await setNodeValue($children.eq(i), ctx);
	}

	proxyResData = await translateHtml($, ctx);

	return proxyResData;
}

function isHtmlContent (proxyRes) {
	return proxyRes.headers['content-type'] === 'text/html';
}

function isMetaDataJs (ctx) {
	let requestUrl = ctx.request.url;
	let urlInfo = url.parse(requestUrl);
	let pathInfo = path.parse(urlInfo.pathname);

	if(`${pathInfo.name}${pathInfo.ext}` === 'metadata.js') {
		return true;
	}

	return false;
}

function isTocJs (ctx) {
	let requestUrl = ctx.request.url;
	let urlInfo = url.parse(requestUrl);
	let pathInfo = path.parse(urlInfo.pathname);

	if(`${pathInfo.name}${pathInfo.ext}` === 'toc.js') {
		return true;
	}

	return false;
}

async function makeFolder (dir) {
	if(dir.trim().length > 0) {
		await mkdirp(dir);
	}
}

async function downloadResource (opts) {
	let ctx = opts.ctx;
	// let proxyRes = opts.proxyRes;
	let proxyResData = opts.proxyResData;

	// let logger = ctx.logger;
	// let urlInfo = url.parse(ctx.request.url);
	// let pathInfo = path.parse(urlInfo.pathname);

	// return path.parse(imgUrl).ext;
	// logger.info(`
	// 	ctx.request.url: ${ctx.request.url},
	// 	url: ${_utils.inspect({obj: urlInfo})},
	// 	pathInfo: ${_utils.inspect({obj: pathInfo})},
	// 	pathInfo.dir: ${pathInfo.dir}
	// `);

	let pathName = _utils.getPathName(ctx.request.url);

	await makeFolder(pathName.substring(0, pathName.lastIndexOf('/')+1));

	let wstream = fs.createWriteStream(pathName);
	wstream.write(proxyResData);
	wstream.end();
}

async function translateTocSection (opts) {
	let section = opts.section;
	let ctx = opts.ctx;
	let maxTranslateNumber = 400;

	for(let sectionItem of section) {
		if(sectionItem.title) {
			sectionItem.title = await getTranslateResult(sectionItem.title, ctx);
			let translatedTocItemCount = ctx.getData('translatedTocItemCount');
			ctx.logger.info(`translatedTocItemCount: ${translatedTocItemCount}`);
			if(translatedTocItemCount === maxTranslateNumber) {
				break;
			}
			ctx.setData({
				key: 'translatedTocItemCount',
				data: translatedTocItemCount + 1
			});
			continue;
		}

		if(sectionItem.sectiontitle) {
			sectionItem.sectiontitle = await getTranslateResult(sectionItem.sectiontitle, ctx);
			if(sectionItem.section && _.isArray(sectionItem.section)) {
				await translateTocSection({
					ctx: ctx,
					section: sectionItem.section
				});
				let translatedTocItemCount = ctx.getData('translatedTocItemCount');
				ctx.logger.info(`translatedTocItemCount: ${translatedTocItemCount}`);
				if(translatedTocItemCount === maxTranslateNumber) {
					break;
				}
				ctx.setData({
					key: 'translatedTocItemCount',
					data: translatedTocItemCount + 1
				});
			}

			continue;
		}
	}
}

async function translateTocJs (opts) {
	let proxyResData = opts.proxyResData;
	let ctx = opts.ctx;

	let tocObj = eval("("+ proxyResData.toString().replace('var docstoc =', '').replace("renderNav(docstoc);", "") +")");
	ctx.setData({
		key: 'translatedTocItemCount',
		data: 0
	});

	for(let key in tocObj) {
		await translateTocSection({
			ctx: ctx,
			section: tocObj[key]
		});
	}

	return `var docstoc = ${JSON.stringify(tocObj)}; renderNav(docstoc);`;
}

async function translateMetaJs (opts) {
	let proxyResData = opts.proxyResData;
	let ctx = opts.ctx;

	let metaArray = eval("("+ proxyResData.toString().replace('var pages =', '') +")");
	let translateArray = [];

	for(let metaItem of metaArray) {
		translateArray.push({
			url: metaItem.url,
			title: metaItem.title,
			description: metaItem.description,
			translatedTitle: metaItem.title,
			translatedDescription: metaItem.description
		});
	}

	// translateArray = translateArray.slice(1, 10);
	let counter = 0;
	let amount = translateArray.length;

	for(let item of translateArray) {
		counter++;
		ctx.logger.info(`translate ${counter}/${amount}`);
		item.translatedTitle = await getTranslateResult(item.title, ctx);
		ctx.logger.info(`->translate title: ${item.title}, translated: ${item.translatedTitle}`);
	}

	let translatedArrayMap = _utils.arrayToMap(translateArray, 'url');

	for(let metaRow of metaArray) {
		let translatedItem = translatedArrayMap[metaRow.url];

		if(translatedItem) {
			metaRow.title = translatedItem.translatedTitle || translatedItem.title;
			console.log(`hit, metaRow.title: ${translatedItem.title} => ${metaRow.title}`);
			// metaRow.description = translatedItem.translatedDescription;
		}
	}

	return `var pages = ${JSON.stringify(metaArray)}`;
}

function middleware () {

	return proxy('docs.docker.com', {
	  	https: true,
	  	timeout: 20000, //20秒
	  	userResDecorator: async (proxyRes, proxyResData, ctx) => {
	  		//proxyRes is the incomingMessage of node http
	  		ctx.logger.info(`ctx.request.url: ${ctx.request.url}, content-type: ${ctx.type}`);

	  		initTranslate(ctx);

	  		if(isHtmlContent(proxyRes)) {
	  			proxyResData = await procHtmlText({
	  				proxyRes: proxyRes,
	  				proxyResData: proxyResData,
	  				ctx: ctx
	  			});

				await downloadResource({
	  				ctx: ctx,
	  				proxyResData: proxyResData
	  			});

	  			return proxyResData;
	  		}

	  		if(isMetaDataJs(ctx)) {
	  			proxyResData = await translateMetaJs({
	  				ctx: ctx,
	  				proxyResData: proxyResData
	  			});
	  		}

	  		if(isTocJs(ctx)) {
	  			proxyResData = await translateTocJs({
	  				ctx: ctx,
	  				proxyResData: proxyResData
	  			});
	  		}

  			await downloadResource({
  				ctx: ctx,
  				proxyResData: proxyResData
  			});

	  		return proxyResData;
	  	}
	});

}

module.exports = middleware;