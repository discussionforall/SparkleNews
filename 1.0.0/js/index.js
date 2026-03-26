if (navigator.onLine == false) {
	location.href = 'noInternet.html';
}
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-198011-5']);
_gaq.push(['_trackPageview', '/SparkleNews/News']);

/** Show Sparkle News instead of Economic Times–branded source names from the feed. */
function displayNewsSource(source) {
	if (source == null || source === '') return 'Sparkle News';
	var s = String(source);
	if (/economic\s*times|etmarkets|\bet\s+online\b|\bet\s+bureau\b|etnow/i.test(s)) return 'Sparkle News';
	if (/^et\b/i.test(s.trim()) && !/^etf\b/i.test(s.trim())) return 'Sparkle News';
	return s;
}

var fadeTime = 300;
var counter = 0;
function removeBadge() {
	objChromeStorage.saveStorage('badgeCountN', 0, function (data) { })
	chrome.runtime.sendMessage({ "message": "check_site", "data": Number(0) });
}
function ajaxCall(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			callback(xhr.response);
		}
	}
	xhr.send();
}
function getTimeInMins(date) {

	var d = new Date(date).getTime();
	var diff = (Date.now() - d) / 1000;
	var interval = Math.floor(diff / 60);
	if (interval < 60) {
		return interval + ' minutes ago';
	}
	interval = Math.floor(interval / 60);
	if (interval < 24) {
		return interval + ' hours ago'
	}

}

function getData() {
	var url = "https://economictimes.indiatimes.com/latestnews_chrome.cms?feedtype=sjson";
	objData.ajaxCall(url, function (data) {
		$('#topNews').html('');
		var dt = data.NewsItem;
		for (var i = 0; i < dt.length; i++) {
			var timeShown = "";
			timeShown = getTimeInMins(dt[i].da);
			var link = dt[i].wu + '?utm_source=SparkleNews&utm_medium=Latest_News&utm_campaign=extension'
			var html = '<div class="text1"><h4><a target="_blank" href="' + link + '">' + dt[i].hl + '</a></h4><small> ' + displayNewsSource(dt[i].source) + ' | <span class="minsColor">' + timeShown + '</span></small></div>';
			$('#topNews').append(html);
		}
		objChromeStorage.getStorage('latestNewsCount', function (data) {
			if (isNaN(data['latestNewsCount'])) {
				var total = 10;
				var viewM = 10;
				$('.jsTotalNews').html(total);
				$('.jsViewMoreNews').html(viewM)
				return false;
			}
			else if (Number(data['latestNewsCount']) != undefined) {
				var total = 10 + Number(data['latestNewsCount']);
				var viewM = total - 4;
				$('.jsTotalNews').html(total);
				$('.jsViewMoreNews').html(viewM)
			} else {
				var total = 10;
				var viewM = 10;
				$('.jsTotalNews').html(total);
				$('.jsViewMoreNews').html(viewM)
			}
		})
	})
}
function getStocksInNews() {
	var url = "https://economictimes.indiatimes.com/marketnewslisting.cms?feedtype=sjson";
	objData.ajaxCall(url, function (data) {
		$('#stockInNews').html('');
		var dt = data.NewsItem;
		check = false;
		var compArr = [];
		for (var i = 0; i < dt.length; i++) {
			if (dt[i].NewsLines.CompanyId != '')
				compArr.push(dt[i].NewsLines.CompanyId);
			if (i == dt.length - 1)
				check = true;
		}
		if (check) {
			getCompanyDetails(compArr, function (data) {
				for (var i = 0; i < compArr.length; i++) {
					try {
						if (compArr[i] == data[i].companyid) {
							dt[i].NewsLines.compDetails = data[i];
							dt[i].NewsLines.compLink = "https://economictimes.indiatimes.com/" + data[i].seoname + "/stocks/companyid-" + data[i].companyid + '.cms';
							var link = dt[i].NewsLines.compLink + '?utm_source=SparkleNews&utm_medium=Company_page&utm_campaign=extension'
							var newsLinkHref = dt[i].NewsLines.WebURL + '?utm_source=SparkleNews&utm_medium=Stock_in_news&utm_campaign=extension';
							if (data[i].NetChange < 0) {
								clr = 'red'
								imgSrc = '/img/arrow-down.png';
							} else {
								clr = 'greetext'
								imgSrc = '/img/arrow-up.png';
							}

							var html = '<div class="text1"><div class="Stocktxt"><h4><a target="_blank" href=' + link + '>' + data[i].CompanyName + '</a></h4><div class="txtlable">\
									<i class='+ clr + '>' + data[i].LastTradedPrice + '</i> <i class="arrowicon" ><img src=' + imgSrc + ' width="9" height="10" alt=""/></i>' + Math.abs(data[i].NetChange) + '(' + Math.abs(data[i].PercentChange) + '%)</div>\
					 				<div class="cl"></div><small><a href='+ newsLinkHref + ' target="_blank"><em >News</em>' + dt[i].NewsLines.HeadLine + '</a></small></div><div class="cl"></div></div>'
							$('#stockInNews').append(html);
						}

					} catch (e) {
						continue;
					}
				}
			})
		}
	})
}
function getMarketData() {

	var url = "https://json.bselivefeeds.indiatimes.com/homepagedatanew.json";
	ajaxCall(url, function (data) {
		etmarketdata = data;

		var b = etmarketdata.slice(15);
		var a = b.substr(0, b.length - 3);

		var c = JSON.parse(a);
		data = c
		var dt = c[0];
		if (dt['sensex'].NetChange < 0) {
			clr = 'red';
			sbox = 'sboxred';
			imgSrc = '/img/arrow-down.png'
		} else {
			clr = 'greetext';
			sbox = 'sbox';
			imgSrc = '/img/arrow-up.png'
		}
		$('#sensex').addClass(sbox);
		var link = "https://economictimes.indiatimes.com/indices/sensex_30_companies?utm_source=SparkleNews&utm_medium=Sensex&utm_campaign=extension"
		var html = '<div class="sensex"><a target="_blank" href=' + link + ' >Sensex</a></div>\
					 <small>'+ numberWithCommas(dt['sensex'].CurrentIndexValue) + ' <i class="arrowicon" ><img src=' + imgSrc + ' width="9" height="10" alt=""/></i>\
						 <i class='+ clr + '>' + Math.abs(dt['sensex'].NetChange) + '</i></small>'
		$('#sensex').html(html);
		if (dt['nifty'].NetChange < 0) {
			clr = 'red';
			sbox = 'sboxred';
			imgSrc = '/img/arrow-down.png'
		} else {
			clr = 'greetext';
			sbox = 'sbox';
			imgSrc = '/img/arrow-up.png'
		}
		$('#nifty').addClass(sbox);
		var link = "https://economictimes.indiatimes.com/indices/nifty_50_companies?utm_source=SparkleNews&utm_medium=Nifty&utm_campaign=extension"

		var html = '<div class="sensex"><a target="_blank" href=' + link + ' >Nifty</a></div>\
					 <small>'+ numberWithCommas(dt['nifty'].CurrentIndexValue) + ' <i class="arrowicon" ><img src=' + imgSrc + ' width="9" height="10" alt=""/></i>\
						 <i class='+ clr + '>' + Math.abs(dt['nifty'].NetChange) + '</i></small>';
		$('#nifty').html(html);
	})
}
/*
function getPFDataChrome() {
	objChromeStorage.getStorage('kotaksecurities', function (data) {
		if (typeof data['kotaksecurities'] != 'undefined') {
			if (typeof data['kotaksecurities'] == 'object')
				dataNew = data['kotaksecurities'];
			else
				dataNew = JSON.parse(data['kotaksecurities']);
			$('#transactionData').html('');
			if (dataNew.length > 0) {
				$('.collapse-content').show();
				$('.toggle-icon').show();
				var dt = dataNew;
				var compArr = [];
				$('#numberComp').html(dt.length);
				$('#numberCompBadge').attr('data-badge', dt.length)
				for (var i = 0; i < dt.length; i++) {
					var html = '<div class="grid"><div class="col100">\
							<h4><a href="#">'+ dt[i].name + '</a></h4><small>' + dt[i].date + '| ' + dt[i].source + '</small> </div>\
    						<div class="col200 ">'+ dt[i].qua + '</div><div class="col200 ">' + dt[i].avgCost + '</div><div class="col300 ">' + dt[i].totalAmount + '</div>'
					$('#transactionData').append(html);

				}
				$('.dateAddedPF').html('from ' + dt[0].date + ' to ' + dt[dt.length - 1].date)
			} else {
				$('.collapse-content').hide();
				$('.toggle-icon').hide();
				$('.dateAddedPF').html('')
				$('#transactionData').html('');
				$('#numberComp').html(0);
				$('#numberCompBadge').attr('data-badge', 0)
				var html = '<div class="grid">No Records Found</div>';
				$('#transactionData').append(html);
			}


		} else {
			$('.collapse-content').hide();
			$('.toggle-icon').hide();
			$('.btnarea').hide();
			$('.dateAddedPF').html('')
			$('#transactionData').html('');
			$('#numberComp').html(0);
			$('#numberCompBadge').attr('data-badge', 0)
			var html = '<div class="grid">No Records Found</div>';
			$('#transactionData').append(html);
		}
	})
}
function addManual() {
	objChromeStorage.getStorage('pfId', function (d) {
		if (d['pfId'] != undefined) {
			var a = Number(d['pfId']);

			var b = 'https://etportfolio.indiatimes.com/pw_addtransactions.cms#/addStock/' + a;
			chrome.tabs.create({ active: true, url: b });
		} else {
			var url = 'https://economictimes.indiatimes.com/login.cms';
			chrome.tabs.create({ active: true, url: url });
		}
	})
}
loginPage = "https://etportfolio.indiatimes.com/pw_login.cms";
function updatePortfolioAssistant() {
	_gaq.push(['_trackEvent', 'SparkleNews', 'PortfolioAssistant', 'Update Portfolio']);
	var domainCookie = "https://www.indiatimes.com";
	getCookies(domainCookie, function (data) {
		if (data.length != 0) {
			check = true;
			var userName;
			for (var i = 0; i < data.length; i++) {
				if (data[i].name == 'ssoid') {
					ssoid = data[i].value;
				}
				if (data[i].name == 'MSCSAuthDetails') {
					var a = data[i].value;
					userName = a.slice(9);
				}
				if (data[i].name == 'TicketId') {
					ticketId = data[i].value;
					check = false;
					break;
				}

			}
			for (var i = 0; i < data.length; i++) {

				if (data[i].name == 'MSCSAuthDetails') {
					var a = data[i].value;
					userName = a.slice(9);
					break;
				}
			}
			if (check) {
				chrome.tabs.create({ active: true, url: loginPage });
			}
			if (userName == undefined || userName == '') {

				var url = 'https://jsso.indiatimes.com/sso/crossdomain/getTicket?version=v1';
				$.ajax({
					url: url,
					type: 'GET',
					dataType: "json",
					crossDomain: true,
					xhrFields: {
						withCredentials: true
					},
					success: function (data) {
						var validateTicket = data.ticketId;
						var url1 = 'https://jsso.indiatimes.com/sso/crossdomain/v1validateTicket?channel=et&ticketId=' + validateTicket;
						$.ajax({
							url: url1,
							type: 'GET',
							dataType: "json",
							crossDomain: true,
							xhrFields: {
								withCredentials: true
							},
							success: function (data1) {
								userName = data1.primaryEmailId;
								chrome.storage.local.get("kotaksecurities", function (result) {
									if (result['kotaksecurities'] != undefined) {
										var data = JSON.parse(result.kotaksecurities);
										var companyIdList = [];
										var quaList = [];
										var insertData = false;
										for (let i = 0; i < data.length; i++) {
											companyIdList.push(data[i].companyId);
											quaList.push(data[i].qua)
											//quaList = [10,12,13]
											if (i == (data.length - 1)) {
												insertData = true;
											}
										}
										if (insertData) {
											var url = "https://pffeeds.indiatimes.com/mobileservices/AddTempSmartWatchList.json?source=wap&ticketId=" + ticketId + "&assetId=" + companyIdList + "&quantity=" + quaList + "&themeId=1&userName=" + userName;
											var xhr = new XMLHttpRequest();
											xhr.open("GET", url, true);
											xhr.onreadystatechange = function () {
												if (xhr.readyState == 4) {
													var resp = JSON.parse(xhr.response);
													if (resp.response.status == "SW_2") {
														clearPortfolioAssistantData();
														var urlTemp = "https://etportfolio.indiatimes.com/pw_tempsmartwatchlist.cms";
														chrome.tabs.create({ active: true, url: urlTemp });
													} else if (resp.response.status == "SW_1") {
														var urlTemp = "https://etportfolio.indiatimes.com/pw_tempsmartwatchlist.cms";
														//alert('Transaction already present in your portfolio. \n Login to confirm and edit the transactions');
														var a = "<div class='red' style='    display: inline-block;margin-top: 14px;'>Transaction already present in your portfolio.</div><div><a target='_blank' href=" + urlTemp + ">Click here</a> to confirm and edit the transactions</div>"
														$('#errMsg').html(a);
													}
												}
											}
											xhr.send();

										}
									}
								});
							}, error: function (e) {
								console.log(e);
							}
						})

					}, error: function (e) {
						console.log(e);
					}
				})


			} else {
				chrome.storage.local.get("kotaksecurities", function (result) {
					if (result['kotaksecurities'] != undefined) {
						var data = JSON.parse(result.kotaksecurities);
						var companyIdList = [];
						var quaList = [];
						var insertData = false;
						for (let i = 0; i < data.length; i++) {
							companyIdList.push(data[i].companyId);
							quaList.push(data[i].qua)
							//quaList = [10,12,13]
							if (i == (data.length - 1)) {
								insertData = true;
							}
						}
						if (insertData) {
							var url = "https://pffeeds.indiatimes.com/mobileservices/AddTempSmartWatchList.json?source=wap&ticketId=" + ticketId + "&assetId=" + companyIdList + "&quantity=" + quaList + "&themeId=1&userName=" + userName;
							var xhr = new XMLHttpRequest();
							xhr.open("GET", url, true);
							xhr.onreadystatechange = function () {
								if (xhr.readyState == 4) {
									var resp = JSON.parse(xhr.response);
									if (resp.response.status == "SW_2") {
										clearPortfolioAssistantData();
										var urlTemp = "https://etportfolio.indiatimes.com/pw_tempsmartwatchlist.cms";
										chrome.tabs.create({ active: true, url: urlTemp });
									} else if (resp.response.status == "SW_1") {
										var urlTemp = "https://etportfolio.indiatimes.com/pw_tempsmartwatchlist.cms";
										//alert('Transaction already present in your portfolio. \n Login to confirm and edit the transactions');
										var a = "<div class='red' style='    display: inline-block;margin-top: 14px;'>Transaction already present in your portfolio.</div><div><a target='_blank' href=" + urlTemp + ">Click here</a> to confirm and edit the transactions</div>"
										$('#errMsg').html(a);
									}
								}
							}
							xhr.send();

						}
					}
				});
			}

		} else {
			chrome.tabs.create({ active: true, url: loginPage });
		}
	});





}
function clearPortfolioAssistantData() {
	var item = [];
	var item1 = JSON.stringify(item)
	chrome.storage.local.set({ 'kotaksecurities': item1 }, function (res) {
		//getCompany('kotaksecurities');
	})
}
function bindUpdatePfBtn() {
	$(document).off('click', '.jsUpdatePf').on('click', '.jsUpdatePf', function () {
		updatePortfolioAssistant();
	});
	$(document).off('click', '.jsAddManual').on('click', '.jsAddManual', function () {
		addManual();
	});
}
*/
const numberWithCommas = (x) => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/*
function checkPFData() {

	objChromeStorage.getStorage('check_pfAssist', function (data) {
		if (data['check_pfAssist'] != 'false') {
			$('#jsPfAssist1').hide();
			$('#jspfAssist2').show();

			getPFDataChrome();
			bindUpdatePfBtn();
		} else {
			$('#jsPfAssist1').show();
			$('#jspfAssist2').hide();
			$('#pfFrame').attr('src', 'portfolio-assistant-1.html')
		}
	})
}
function bindViewWatchBtn() {
	$(document).off('click', '.jsViewWatchlist').on('click', '.jsViewWatchlist', function () {
		_gaq.push(['_trackEvent', 'SparkleNews', 'Markets', 'View Watchlist']);
	});
}
function showWatchBtnHome() {
	objChromeStorage.getStorage('showViewWatchBtn', function (d) {
		var a = d['showViewWatchBtn'];
		if (a == true) {
			$('.jsViewMoreHome').show();
			objChromeStorage.getStorage('addedToWatchCount', function (aa) {
				if (aa['addedToWatchCount'] != undefined) {
					var b = Number(aa['addedToWatchCount']);
					$('.badge1').attr('data-badge', b);
				} else {
					var b = 0;
					$('.badge1').attr('data-badge', b);
				}

			})
		} else {
			$('.jsViewMoreHome').hide();
		}
	})
}
*/
$(document).ready(function () {

	removeBadge()
	// Login/profile UI removed from popup header.

	getMarketData()
	getData();
	getStocksInNews();

	(function initHomeFeedTabs() {
		var $tabs = $('.home-feed-tab');
		var $panels = $('.home-feed-panel');
		if (!$tabs.length || !$panels.length) return;
		function activate(idx) {
			$tabs.removeClass('active').attr('aria-selected', 'false');
			$tabs.eq(idx).addClass('active').attr('aria-selected', 'true');
			$panels.removeClass('is-active');
			$panels.eq(idx).addClass('is-active');
		}
		$tabs.on('click', function () {
			activate($tabs.index(this));
		});
		$tabs.on('keydown', function (e) {
			if (e.key !== 'Enter' && e.key !== ' ') return;
			e.preventDefault();
			activate($tabs.index(this));
		});
	})();

	// Keep popup data fresh while it is open.
	setInterval(function () {
		getMarketData();
		getData();
		getStocksInNews();
	}, 60000);


	$('.animsition').animsition();
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-198011-5']);
	_gaq.push(['_trackPageview', '/SparkleNews/News']);
});
