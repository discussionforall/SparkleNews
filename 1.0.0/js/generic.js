function getCompanyId (name,callback,source){
	if(source == 'kotaksecurities' || source== 'zerodha' || source == 'hdfc'){
		data = name.name;
	}else{
	data = name;
	}
          var url = "https://etsearch.indiatimes.com/etspeeds/ethome.ep?matchCompanyName=true&dvr=true&idr=true&mcx=true&pagesize=6&language=&outputtype=json&ticker="+data;
          $.ajax(url).success(function(result){
          	if(result){
          		var b = JSON.parse(result);
          		if(b.length!=0){
					var companyData2;
          			var companyData;
          			var checkInsert = true;
          			var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
					if(source =='kotaksecurities' || source == 'zerodha' || source == 'hdfc'){
						callback(b);
						}else{
          			chrome.storage.local.get("companyData2",function(result){
						var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
          				if(result['companyData2']!=undefined){
          					companyData = JSON.parse(result.companyData2);
          					
          					for(let i=0;i<companyData.length;i++){
          						if(companyData[i].companyId == b[0].tagId ){
          							checkInsert = false;
          							return callback(b);

          						}
          					}
          					if(checkInsert){
          					var items =[];
							var date = new Date();
							dateStr = date.getHours()+':'+date.getMinutes()+' IST '+ date.getDate() + " "+month[date.getMonth()];
		          			items = {name:b[0].tagName,companyId:b[0].tagId,date : dateStr}; 
		          			
                    		companyData.unshift(items);
                      		  companyData2 = JSON.stringify(companyData);
                      		}
		          			

		          		}
		          		else
		          		{
		          			checkInsert = true;
		          			//var items =[];
							var date = new Date();
							dateStr = date.getHours()+':'+date.getMinutes()+' IST '+ date.getDate() + " "+month[date.getMonth()];
		          			var items = [{name:b[0].tagName,companyId:b[0].tagId,date : dateStr}]; 
		          			companyData2 = JSON.stringify(items);
		          		}
		          		if(checkInsert){
		          			chrome.storage.local.set({"companyData2":companyData2},function(items){
		          	     				return callback(b);
		          		
          			})
		          		}
          				
});
					}
    }      			
          	
          		
          	}
	
          });
}

function getCompanyDetails (companyId,callback){
	var url = "https://pflivefeeds.indiatimes.com/ET_Portfolio/multicompany?companies="+companyId;
      var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				etmarketdata = xhr.response;
			   etmarketdata = etmarketdata.slice(17);
			   etmarketdata = JSON.parse(etmarketdata);
			   callback(etmarketdata.NewDataSet);	
		  }
		}
		xhr.send();
}


objChromeStorage = {
	getStorage : function(key,callback){
		chrome.storage.local.get(key,function(result){
			return callback(result)		
		})
	},
	saveStorage : function (key,data,callback){
		var dataNew = JSON.stringify(data);
		var dataObj = {};
		dataObj[key] = dataNew;
		chrome.storage.local.set({[key]:dataNew},function(items){
			return callback();
		})
	},
	creteNewStorage : function (key){
		var item = "[]";
		chrome.storage.local.set({[key]:item},function(items){
			return items;
		})
	}

}
objDefault = {
	setInitialSetting : function (){
		objChromeStorage.saveStorage('check_pfAssist',false,function(data){});
		objChromeStorage.saveStorage('check_kotak',false,function(data){});
		objChromeStorage.saveStorage('check_zerodha',false,function(data){});
	}
}
objChromeStorage.getStorage('check_pfAssist',function(data){
	if(data['check_pfAssist'] == undefined){
		objDefault.setInitialSetting();
	}
})
objSetting = {
	checkNotification : function (key){
		objChromeStorage.getStorage(key,function(data){
			if(!data[key]){
				return false;
			}else{
				return true;
			}
		})
	},
	checkIframeNotification : function(compId,callback){
		objChromeStorage.getStorage('companyList',function(data1){
			if(data1['companyList']!=undefined){
				var data = JSON.parse(data1['companyList']);
			var date = new Date();
			check = false;
				var newDate = date.getDate() +'-'+(date.getMonth()+1)+'-'+date.getFullYear();
			if(data.length > 0){
				var a = data;
				for(var i=0;i<a.length;	i++){

					if(a[i].companyId == compId){
						check=false;
						if(a[i].addedDate == newDate){

							return callback(false);
						}
						else{
							var showIframe  = true;
							delete a[i];
							//set New Date
							objSetting.addDataToCompanyListFrame(compId,a);
							return callback(true);
						}
						
					}else{
						//add New Date and company and show iframe
						check = true;
					}
				}
				if(check = true){
					var data = [];

					objSetting.addDataToCompanyListFrame(compId,data);
						return callback(true);
				}
			}else{
				var data = [];

				objSetting.addDataToCompanyListFrame(compId,data);
						return callback(true);
			}
			}else{
				var data = [];

				objSetting.addDataToCompanyListFrame(compId,data);
						return callback(true);
			}
			
		})
	},
	addDataToCompanyListFrame : function (compId,dataSet){
				var data = [];
				var newData = [];
				var date = new Date();
				var newDate = date.getDate() +'-'+(date.getMonth()+1)+'-'+date.getFullYear();
				var companyId = compId;
				var addedDate = newDate;
				var arr = {};
				arr.companyId = compId;
				arr.addedDate = newDate;
				if(dataSet.length > 0){
					newData.push(dataSet);
					newData.push(arr);
					//dataSet.push(arr);
				}else{
					dataSet = arr;
					newData.push(dataSet);
					//dataSet.companyList.push(arr);
				}
				var saveData = newData;
				//chrome.storage.local.set({'companyList':dataSet},function(){})
				saveData = JSON.stringify(saveData);
				var newL = {"companyList":saveData}

				chrome.storage.local.set({"companyList":saveData},function(data){})

				objChromeStorage.getStorage('companyList',function(data){})
				
	}
}
objData = {
	ajaxCall : function(url,callback){
		$.ajax(url).success(function(data){
			return callback(data);
		})
	}
}
function getCookies(domain, callback) {
    chrome.cookies.getAll({"url": domain}, function(cookie) {
        if(callback) {
            callback(cookie);
        }
    });
}

function addDatatoServer(key){
	var domainCookie = "https://www.indiatimes.com";
	var cookieSet = {
		'authCookieId' : '',
		'ssoid' : ''
	}
	var authCookieId = '';
	var ssoid = '';
	getCookies(domainCookie, function(data) {
		if(data.length != 0){
			objChromeStorage.getStorage('userLoginState',function(data1){
				if(data1['userLoginState'] == 'false'){
					for(var i =0 ;i<data.length;i++){
		    	
					 if(data[i].name == 'fpid'){
					 		cookieSet.authCookieId = data[i].value;
						}
					}
					addDatatoFollow(cookieSet,key,false)
				}else{
					for(var i =0 ;i<data.length;i++){
		    	
					 if(data[i].name == 'ssoid'){
					 		cookieSet.ssoid = data[i].value;
						}
					if(data[i].name == 'fpid'){
					 		cookieSet.authCookieId = data[i].value;
						}
					}
					addDatatoFollow(cookieSet,key,true)
				}
		    	})
		    
		}
	});
}

function addDatatoFollow(data,key,status){
	var a = {
		"userPrefs": [{
			"stype": "2",
			"prefDataVal": key,
			"userSettingSubType": 11,
			"status": 1,
			"group": "My Watchlist",
		}]
	}
	var headers = {};
	var url = "https://etusers.indiatimes.com/et/savesettings";
	if(status){
			headers = {
				'fpid' : data.authCookieId,
				'Authorization' : data.ssoid,
				'Content-Type':'application/json','Accept':'application/json'
			}
	}else{
			headers = {
			'fpid' : data.authCookieId,
			'Content-Type':'application/json','Accept':'application/json'
		}

	}


	$.ajax({
		url : url,
		headers : headers,
		method : 'POST',
		dataType : "json",
		data : JSON.stringify(a),
		xhrFields: {
           withCredentials: true
        },success: function (data){
        	chrome.storage.local.set({"showViewWatchBtn":true},function(items){
        	});
        	objChromeStorage.getStorage('addedToWatchCount',function(a){
        		if(a['addedToWatchCount']!=undefined){
        			var ab = Number(a['addedToWatchCount']);
        		ab = ab + 1;
        		chrome.storage.local.set({"addedToWatchCount":ab},function(items){
        	});
        	}else{
        		var ab = 0;
        		ab = ab + 1;
        		chrome.storage.local.set({"addedToWatchCount":ab},function(items){
        	});
        	}
        		
        	})
        	
        	objChromeStorage.getStorage('companyData2',function(d){
        		if(d['companyData2']!=undefined){
        			var arr = [];
        			var dt = JSON.parse(d['companyData2']);
        			for(var i=0;i<dt.length;i++){
        				if(dt[i].companyId != key){
        					arr.push(dt[i]);
        				}
        			}
        			chrome.storage.local.set({"companyData2":JSON.stringify(arr)},function(items){
												
								
							})
        		}
        	})
objChromeStorage.getStorage('showViewWatchBtn',function(d){
			var a = d['showViewWatchBtn'];
			if(a == true){
				$('.jsViewMoreMarket').show();
				$('.jsViewMoreHome').show();
				objChromeStorage.getStorage('addedToWatchCount',function(aa){
					if(aa['addedToWatchCount']!=undefined){
						var b = Number(aa['addedToWatchCount']);
						$('.badge1').attr('data-badge',b);
					}else{
						var b = 0;
						$('.badge1').attr('data-badge',b);
					}
					
				})
			}else{
				$('.jsViewMoreMarket').hide();
				$('.jsViewMoreHome').hide();
			}
		})


        },error: function(e){
        	console.log(e);
        }
	})
}
function getUserNameLoggedIn(callback){

	var url = 'https://jsso.indiatimes.com/sso/crossdomain/getTicket?version=v1';
		$.ajax({
			url : url,
			type : 'GET',
			dataType:"json",
			crossDomain : true,
			xhrFields: {
	           withCredentials: true
	        },
	        success: function (data){
	        	var validateTicket = data.ticketId;
	        	var url1 = 'https://jsso.indiatimes.com/sso/crossdomain/v1validateTicket?channel=et&ticketId='+validateTicket;
	        	$.ajax({
					url : url1,
					type : 'GET',
					dataType:"json",
					crossDomain : true,
					xhrFields: {
			           withCredentials: true
			        },
			        success: function (data1){
			        	
			  			callback(data1);
			        },error: function(e){
			        	console.log(e);
			        }
				})
	        	
	        },error: function(e){
	        	console.log(e);
	        }
		})
}