if (/http(s)?:\/\/scrabblefb-live2\.sn\.eamobile\.com\/live\/http(s)?\//.test(window.location.href)) {

	var processingNotesList = {};
	var processingUpdateCounts = false;
	var eeloaded = false;
	var storage = chrome.storage.sync;
	var clickToSubmit = false;
	var gamedataObject = {};
	var refreshIntervalId = null;
	var refreshActive = false;

	function updateCounts(){
		if(processingUpdateCounts)
			return;
		processingUpdateCounts = true;
		myTurns=$("div#myTurnGamesList > div.match").size();
		$("div#myTurnGames").find("div").eq(0).find("span").eq(0).text('My Turn ('+myTurns+')');
		theirTurns=$("div#theirTurnGamesList > div.match").size();
		$("div#theirTurnGames").find("div").eq(0).find("span").eq(0).text('Their Turn ('+theirTurns+')');
		processingUpdateCounts = false;
	}

	function injectScript(source,sourceid)
	{
		var elem = document.createElement("script");
		elem.type = "text/javascript";
		elem.id = sourceid;
		elem.innerHTML = source;
		document.head.appendChild(elem);
		setTimeout(function(){$("script#"+sourceid).remove();},1000);

		return true;

	}

	function popInTilesNew() {
		var a = $(".tileRackSpace .tile");
		a.css("top", "-85px");
		a.css("opacity", 0);
		Scrabble.AnimationManager.animateElements(a, {top: "-2px",opacity: 1}, 150, "easeOutQuad", 50);
		var game = Scrabble.GameServerManager.currentGame();
		game.mmatchusers.matchuser.forEach(function(user,index) {
			game.mmatchusers.matchuser[index].facebookid=Scrabble.PlayerManager.getPlayerInfo(user.userid,"fbId");
			});
		
	}

	function addTile(tileId,c)
	{		
		var func = "var k = $('div.tile[data-id="+ tileId +"]');c = \""+ c.toUpperCase() + "\"; Scrabble.TipManager.removeTips(); Scrabble.Board.addTileToCell(k, c);";
		injectScript(func,"owlAddTile");
	}


	function addTile(tileId,c)
	{		
		var func = "var k = $('div.tile[data-id="+ tileId +"]');c = \""+ c.toUpperCase() + "\"; Scrabble.TipManager.removeTips(); Scrabble.Board.addTileToCell(k, c);";
		injectScript(func,"owlAddTile");
	}


	function toggleNoMoreGamesPopup(off,refreshOnce)
	{
		var func;
		if(off)
		{
			func = "if(typeof OWL == \"undefined\"){OWL={};} OWL[\"showSuggestion\"]=Scrabble.SuggestionPopup.show; Scrabble.SuggestionPopup.show = function(){ "+ (refreshOnce?"Scrabble.LeftMenu.refreshGamesList(true);":"") +"};";

		}
		else
		{
			func = "if((typeof OWL != \"undefined\") && (typeof OWL[\"showSuggestion\"] != \"undefined\")){Scrabble.SuggestionPopup.show = OWL[\"showSuggestion\"];}";
		}

		injectScript(func,"owlToggleNoMoreGamesPopup");
	}


	function toggleNoGamesRefresh(on,time)
	{
		if(on)
		{
			var refreshFunc = "Scrabble.LeftMenu.refreshGamesList(true);";
			toggleNoGamesRefresh(false,null);
			refreshIntervalId = setInterval(function(){
				var gameCount = $("div#myTurnGamesList > div.match").size();				
				if(gameCount===0)
				{
					injectScript(refreshFunc,"owlRefresh");
				}
			},time * 1000);
			refreshActive = true;		

		}
		else
		{
			if(refreshActive)
			{
				clearInterval(refreshIntervalId);
				refreshActive = false;
			}			
		}


	}

	function disableBingoPublishing()
	{
		var func = "if(typeof OWL == \"undefined\"){OWL={};} OWL[\"publishBingo\"]=Scrabble[Scrabble.SocialPlatformManager.bridge].publishBingo; Scrabble[Scrabble.SocialPlatformManager.bridge].publishBingo = function(d,b,e){f=undefined;if(e){e(f);}}";
		injectScript(func,"owlDisableBingoPublishing");
	}

	function enableBingoPublishing()
	{
		var func = "if((typeof OWL != \"undefined\") && (typeof OWL[\"publishBingo\"] != \"undefined\")){Scrabble[Scrabble.SocialPlatformManager.bridge].publishBingo = OWL[\"publishBingo\"];}";
		injectScript(func,"owlEnableBingoPublishing");
	}

	function getGameData()
	{		
		var func = "var k = $('div.tile[data-id="+ tileId +"]');c = \""+ c.toUpperCase() + "\"; Scrabble.TipManager.removeTips(); Scrabble.Board.addTileToCell(k, c);";
		injectScript(func,"owlGetGameData");
	}

	function simulateKeyDown(keyCode)
	{		
		var func = "jQuery.event.trigger({ type : 'keydown', which : "+ keyCode +" });";
		injectScript(func,"owlSimulateKeyPress");
	}


	function showWildTilePopup(tileId)
	{		
		var func = "var b = $('div.tile[data-id="+ tileId +"]').get(0); Scrabble.WildTilePopup.show(b);";
		injectScript(func,"owlShowWildTilePopup");
	}	

	function getLastPlay()
	{		
		return $("table#movesList tr:last-child > td:eq(1)").text().match(/\"?\w+\"?/g).slice(-1)[0];
	}

	function getNumberOfPlays()
	{		
		return $("table#movesList tr.even td:first-child p").length;
	}







	function getMoves()
	{
		var moves = {};
		$("table#movesList tr.even > td:nth-child(2)").each(
				function(index, td) {
					$scores = $(td).next();
					$totals = $(td).next().next();
					$(td).find("p").each(function(turnindex,wordp){
						moves[index*2+turnindex+1]={};
						var retrievedId = $('img[class="cardAvatar"]').eq(turnindex).attr('src').split('_')[1];
						moves[index*2+turnindex+1]["player"]= (/^\d+$/).test(retrievedId)?retrievedId:localStorage.cacheUser;
						moves[index*2+turnindex+1]["score"]= $scores.find("p").eq(turnindex).text();
						moves[index*2+turnindex+1]["total"]= $totals.find("p").eq(turnindex).text();
						moves[index*2+turnindex+1]["word"]= $(wordp).text();
					});
				});

		return moves;
	}

	
	function lookUpWord() {

		var $input = $("input#lookupTxt").eq(0);
		if($input.hasClass('greyText'))
			return;
		if($("p#lookupResult span").attr("class")=="typo_lightRed")
		{
			if(!eeloaded)
			{
				var invalidWord = $.trim($input.val()).toUpperCase();
				if(invalidWord === 'FEELTHEEALOVE')
                {
                    var c = 'Scrabble.config.adsEnabled=false;   if(!Scrabble.config.adsEnabled){window.postMessage({ type: "owlhoot-1", text: "LOVEISFELTNOWFLY" }, "*");}';
                    injectScript(c,"owlsrc");			
                    
                }
                return;
			}
		}

		var longdict = $.trim($("span#wordsBtnImage").attr('title'));
		var shortdict = longdict.match(/(Collins|TWL|OSPD4|German|Spanish|Italian|French|Portuguese)/g);

		var langs={
				"Collins":"en",
				"TWL" :"en",
				"OSPD4" : "en",
				"French": "fr",
				"Italian":"it",
				"German": "de",
				"Portuguese":"pt",
				"Spanish": "es"
		};
		var lang=langs[shortdict];

		var validWord="";
		if($("p#lookupResult span").attr("class")=="typo_green") {

			validWord = $.trim($input.val()).toUpperCase();

			if(validWord == "") {
				$("p#lookupResult").html('');
			}
			else if($("p#lookupResult img#owl").length === 0) {

				iconURL =  chrome.extension.getURL("owl-lookup.png");
				$("p#lookupResult").find("span").html('<A href="http://google.com/search?hl='+lang+'&q=define:'+validWord+'" target="define" class="typo_green" style="text-decoration:underline"><img src="'+iconURL+'" align="left">'+validWord+'</a>');

				var longdict = $.trim($("span#wordsBtnImage").attr('title'));
				if(/Collins|TWL|OSPD4/g.test(longdict))
				{
					shortdict = longdict.match(/Collins|TWL|OSPD4/g)[0];
					var definitionLoaded = false;

					var owlServiceUrl = "https://owlsserver.appspot.com/?method=getdef&d="+ shortdict.toLowerCase() +"&word=" + validWord.toLowerCase();

					$lookupSpan = $("p#lookupResult span");
					$lookupSpan.CreateBubblePopup({
						themeName: 'green',
						themePath: 'jquerybubblepopup-themes'						
					});
					$lookupSpan.FreezeBubblePopup();
					bubble_popup_id = $lookupSpan.GetBubblePopupID(); 


					$lookupSpan.click(function(e){

						e.preventDefault();
						///TODO
						var html = '<div style="max-width:200px;max-height:250px;overflow-y:auto">';
						html = html + '<div style="float:right"><p><a href="#null">close</a></p></div>';
						html = html + '<div style="clear:both"/><br/>';
						html = html + '<div>Definition: <span class="define">' + ((definitionLoaded)?$lookupSpan.data('definition'):'Loading...') + '</span></div>';
						html =  html + '<br/><A href="http://google.com/search?hl='+lang+'&q=define:'+validWord+'" target="define" class="typo_green" style="text-decoration:underline"><img src="'+iconURL+'" align="left">Google Search: '+validWord+'</a>';
						html =  html + '</div>';			
						$lookupSpan.ShowBubblePopup({

							position : 'right',
							align	 : 'middle',
							innerHtml: html,
							themeName: 'green',
							themePath: 'jquerybubblepopup-themes',
							alwaysVisible:true,
							selectable:true

						},true);

						$lookupSpan.FreezeBubblePopup();

						$('#'+bubble_popup_id+' a:first').click(function(){
							$lookupSpan.HideBubblePopup();
							$lookupSpan.FreezeBubblePopup();
						});

						if(!definitionLoaded)
						{
							$.getJSON(owlServiceUrl,function(json){
								var definition = (!json.found || json.definition=="")?'No definition found.':json.definition;
								$("p#lookupResult span").data('definition',definition);
								definitionLoaded = true;
								$lookupSpan.SetBubblePopupInnerHtml(html.replace(/Loading\.\.\./,definition));


							})
							.fail(function( jqxhr, textStatus, error ) {
								var definition = 'An error occured while retrieving definition';
								$("p#lookupResult span").data('definition',definition);
								$lookupSpan.SetBubblePopupInnerHtml(html.replace(/Loading\.\.\./,definition));

							}).always(function() { 
								$('#'+bubble_popup_id+' a:first').click(function(){
									$lookupSpan.HideBubblePopup();
									$lookupSpan.FreezeBubblePopup();
								}); 
							});


						}


					});
				}
			}

		}

	}

	function tooWhit(){
		var iconURL =  chrome.extension.getURL("owl-on-coke.png");
		$("p#lookupResult").html("<span style=\"color:#009d07;text-shadow:0+1px 0 rgba(255,255,255,1)\"><img src=\""+ iconURL + "\" style=\"display: inline;vertical-align:middle;\" />Too-Wit-Too-Whoo!</span>");
	}

	function eeTest() {

		name = "owlhoot-1";
		storage.get(name, function(items) {

			if (items[name] && items[name] == 'LOVEISFELTNOWFLY') {
				 var c = 'Scrabble.config.adsEnabled=false;   if(!Scrabble.config.adsEnabled){window.postMessage({ type: "owlhoot-1", text: "LOVEISFELTNOWFLY" }, "*");}';
                 injectScript(c,"owlsrc");			
				 return;
			}
		});
	}


	function removeWildTileValue(f) {
		f.removeAttribute("data-temp_letter");
		f.setAttribute("data-letter", "BLANK");
		$(f).find(".tileLetterRed").attr("class", "tileLetterRed letter_BLANK");
	}


	function loadClickToSubmit($tile) {


		$tile.find("span.tileScore").on("click",function(e){
			if(!($("div#tradeTilesPopup").is(":visible")))
			{
				e.stopImmediatePropagation();
				e.stopPropagation();
			}
		});

		$tile.on('mousedown.owlwge',function(e){	

			if(e.which !=1)
				return;
			$tile.data('p0', { x: e.pageX, y: e.pageY });

		}).on('mouseup.owlwge',function(e){
			if(e.which !=1)
				return;
			$rackSpace = $tile.parent();			
			if(!($rackSpace.is('.tileRackSpace') || $rackSpace.is('div#absoluteTileContainer')))
			{
				unloadClickToSubmit($tile);
				return;
			}			

			var p0 = $tile.data('p0');
			if(typeof p0 === "undefined")
				return;
			p1 = { x: e.pageX, y: e.pageY };
			d = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
			$tile.removeData('p0');

			if(clickToSubmit && !($("div#tradeTilesPopup").is(":visible")))
			{


				//unloadClickToSubmit($tile);
				if (d < 4) {
					if($("div.boardCell div#wordTypeFocus").is(':visible'))
					{
						unloadClickToSubmit($tile); 
						if($tile.data("letter")=="BLANK")
						{

							//setTimeout(function(){
							var tileobserver = new MutationObserver(function(mutations) {
								mutations.forEach(function(mutation) {
									if(/letter_(\w\w?)\b/.test($(mutation.target).attr('class')))
									{
										letter = (/letter_(\w\w?)\b/g.exec($(mutation.target).attr('class')))[1];

										removeWildTileValue($tile.get(0));
										setTimeout(function(){
											addTile($tile.data("id"),letter);
										},50);
										tileobserver.disconnect();
									}
								});    
							});								 

							var config = { attributes: true};							 

							// pass in the target node, as well as the observer options
							tileobserver.observe($tile.find(".tileLetterRed").get(0), config);

							showWildTilePopup($tile.data("id"));


						}
						else
						{							

							setTimeout(function(){


								addTile($tile.data("id"),$tile.data("letter"));

							},50);							
						}

					}				
				}
			}

		});
	}

	function unloadClickToSubmit($tile) {		
		$tile.off('mousedown.owlwge').off('mouseup.owlwge');
	}


	function checkForOWLNotes(callback)
	{


		var playerID=localStorage.cacheUser;

		var gid = $("div[id$='GamesList']  > div[class*=urrentGame]").attr("data-match_id");
		//var gid = $("div[id$='TurnGamesList'] > div.match.lastCurrentGame,div[id$='TurnGamesList']  > div.match.currentGame").attr("data-match_id");
		if(processingNotesList[gid]===true)
		{
			if (typeof(callback) == "function") {
				callback(false);
				return true;
			}

			return;
		}


		if(gid)
		{
			processingNotesList[gid]=true;

			chrome.runtime.sendMessage({command: "checknotes",pid:playerID,game:'scrabble',gameid:gid}, function(response) {
				var gidnote='span#note'+gid;
				var $owleyes = $(gidnote).find("div.match img.owleyes");

				if($owleyes.HasBubblePopup())
				{
					$owleyes.removeData('notes');
					$owleyes.RemoveBubblePopup();
				}

				if(response.hasnotes)
				{
					iconURL = chrome.extension.getURL("icon-19-notes.png"); 
					lookURL = chrome.extension.getURL("look.png");  
					$('#notesOwl').attr('src',iconURL);
					//$("div#notesIndicator").text("YOU HAVE NOTES");	
					if($(gidnote).length==0) {
						$("div[data-match_id=" + gid + "]").find("div.matchElementView").find("span").first().prepend('<span id="note'+gid+'"></span>&nbsp;');
					}
					$(gidnote).html('<img class="noteeyes" src="'+lookURL+'" style="width:29px; height:14px">');
					$(gidnote).find('img').CreateBubblePopup({

						position : 'right',
						align	 : 'middle',
						innerHtml: '<div style="max-width:287px;max-height:250px;overflow-y:auto">' + response.notes + "</div>",
						themeName: 'green',
						themePath: 'jquerybubblepopup-themes',
						alwaysVisible:true,
						selectable:true

					});

				}
				else
				{
					iconURL = chrome.extension.getURL("notes-owl.png");
					$('#notesOwl').attr('src',iconURL);
					$("div#notesIndicator").text("");
					if($(gidnote).length>0)	{
						$(gidnote).html("");
					}
				}
				processingNotesList[gid]=false;
				if (typeof(callback) == "function") {
					callback(true);
					return true;
				}	

			});				
		}

		/*if (typeof(callback) == "function") {
			callback();
			return true;
		}*/
	}	


	$(document).ready(function () {

		var gridleft = chrome.extension.getURL("gridref-left.png");
		var gridtop = chrome.extension.getURL("gridref-top.png");
		$('div#scrabbleGame').prepend('<div id="owl-gridref-top" class="owlgrid" style="position: absolute; left: -18px; top: 28px; z-index:500;opacity:0.8;display:none;pointer-events:none;"><img src="'+ gridtop + '"></img></div>');
		$('div#rightMenu').prepend('<div id="owl-gridref-left" class="owlgrid" style="position: absolute; left: 0px; top: 30px; z-index:500;opacity:0.8;display:none;pointer-events:none;"><img src="'+ gridleft + '"></img></div>');

		var iconURL = chrome.extension.getURL("notes-owl.png"); 
		var icon1URL = chrome.extension.getURL("icon-48.png"); 

		$("#wildTilePopup").on("click", ".wildLetter",function(event){
			event.stopPropagation();
		});

		$('div#headerButtonsContainerMiddle').prepend('<div style="position:relative;top:3px;left:220px;display:inline-block;"><img id="notesOwl" src="'+iconURL+'" width=48 height=48 onmouseover="if(this.src.indexOf(\'icon-19-notes\')==-1){this.src=\''+icon1URL+'\';}" onmouseout="if(this.src.indexOf(\'icon-19-notes\')==-1){this.src=\''+iconURL+'\';}" ></div>');
		$('div.jspPane').first().prepend('<div style="color:white;position:relative;font-weight:bold;font-size:16px;top:5px;left:35px" id="notesIndicator"></div>');

		//fixCheckWord();
		updateCounts();
		eeTest();


		storage.get(["showGrid","clickToSubmit","disableBingoPublishing","disableNoMoreGame","refreshOnce","refreshEvery","refreshInterval"], function(items) {
			if (items["showGrid"]) {

				$("div.owlgrid").show();	
				$("div.topButton[title=Store]").css('left','11px');
			}

			if (items["clickToSubmit"]) {

				clickToSubmit = true;				
			}

			$('div#tileRackContainer div.tile.active.ui-draggable').each(function(){
				loadClickToSubmit($(this));
			});

			if (items["disableBingoPublishing"]) {

				disableBingoPublishing();				
			}

			if (items["storeGameData"]) {

				watchRackMovement();				
			}

			toggleNoMoreGamesPopup(items["disableNoMoreGame"],items["refreshOnce"]);

			toggleNoGamesRefresh(items["refreshEvery"],items["refreshInterval"]||30);

		});




		checkForOWLNotes();

		var dictionaryNode   = $("p#lookupResult");
		var rackNode         = $("div#tileRackContainer");
		var boardNode        = $("div#board");
		var gameNodes        = $("div[id$=TurnGamesList] div.match,div#completedGamesList div.archivedMatch");
		var gamesListNodes   = $("div.jspPane");//$("div[id$=GamesList]");
		//var gameHeadingNodes = $("div.jspPane");

		var MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
		var myObserver          = new MutationObserver (mutationHandler);

		var dictionaryConfig = {subtree:true,childList:true};
		var rackConfig = {subtree:true,childList:true};
		var boardConfig = {subtree:true,childList:true};
		var listConfig = {subtree:true,childList:true};
		var gameConfig  = {attributes: true,attributeOldValue:true,attributeFilter: ["class"]};
		var headingConfig = {subtree:true,childList:true,attributes: true,attributeOldValue:true,characterData: true,characterDataOldValue:true};

		function startObservation(){
			gameNodes.each ( function () {
				myObserver.observe (this, gameConfig);
			} );

			gamesListNodes.each ( function () {
				myObserver.observe (this, listConfig);
			} );


			myObserver.observe (dictionaryNode[0], dictionaryConfig);


			myObserver.observe (rackNode[0], rackConfig);

		}

		startObservation();

		function mutationHandler (mutationRecords) {
			mutationRecords.forEach ( function (mutation) {
				switch(mutation.type)
				{
				case "attributes":
					if((mutation.attributeName ==="class") &&($(mutation.target).attr('class').toLowerCase().indexOf('current') >-1))
					{
						if($("div.match img.owleyes").HasBubblePopup())
						{
							$("div.match img.noteeyes").HideAllBubblePopups();
						}
						checkForOWLNotes();

					}					
					break;
				case "childList":
					if(($(mutation.target).attr('id')) && ($(mutation.target).attr('id').indexOf('GamesList') >-1))
					{
						updateCounts();
						if($("div.match img.owleyes").HasBubblePopup())
						{
							$("div.match img.noteeyes").HideAllBubblePopups();
						}

						if (typeof mutation.addedNodes == "object") 
						{
							if(mutation.addedNodes.length > 0 && $(mutation.addedNodes).eq(0).is("div[id$=TurnGamesList] div.match,div#completedGamesList div.archivedMatch"))
							{

								checkForOWLNotes();
								if($("div.jspPane div#notesIndicator").length == 0)
								{
									$('div.jspPane').first().prepend('<div style="color:white;position:relative;font-weight:bold;font-size:16px;top:5px;left:35px" id="notesIndicator"></div>');

								}
								//Start watching new node
								myObserver.observe($(mutation.addedNodes).eq(0).get(0),gameConfig);
							}
						}


					}
					else if($(mutation.target).attr('id') &&($(mutation.target).attr('id')=="lookupResult"))
					{
						if(mutation.addedNodes.length > 0)
						{
							lookUpWord();							
						}	

					}
					else if($(mutation.target).attr('id') && ($(mutation.target).attr('id').indexOf('tileRackSpace') > -1))
					{
						if(mutation.addedNodes.length > 0)
						{
							loadClickToSubmit($(mutation.addedNodes).eq(0));							
						}
						/*if(mutation.removedNodes.length > 0)
						{
							unloadClickToSubmit($(mutation.removedNodes).eq(0));							
						}*/

					}					
					break;
				default:
					//console.log(JSON.stringify({target:mutation.target.nodeName, _class: $(mutation.target).attr('class'),id:$(mutation.target).attr('id'), type: mutation.type , oldValue: mutation.oldValue}));
					break;		    	
				}

			} );
		}



	});

	chrome.storage.onChanged.addListener(function(changes, namespace) {

		if(typeof changes["clickToSubmit"]!="undefined")
		{
			clickToSubmit = changes["clickToSubmit"].newValue || false;			
		}
		if(typeof changes["showGrid"]!="undefined")
		{
			var gridVisibility = changes["showGrid"].newValue || false;
			$("div.owlgrid").toggle(gridVisibility);
			$("div.topButton[title=Store]").css('left',(gridVisibility)?'11px':'0px');
		}

		if(typeof changes["disableBingoPublishing"]!="undefined")
		{
			var disableBs = changes["disableBingoPublishing"].newValue || false;
			if(disableBs)
			{
				disableBingoPublishing();
			}
			else
			{
				if(typeof changes["disableBingoPublishing"].oldValue !== "undefined")
				{
					enableBingoPublishing();
				}

			}
		}

		if(typeof changes["disableNoMoreGame"]!="undefined")
		{
			var disableBs = changes["disableNoMoreGame"].newValue || false;
			if(disableBs)
			{
				storage.get("refreshOnce", function(items) {					
					toggleNoMoreGamesPopup(true,items["refreshOnce"]);
				});			

			}
			else
			{
				if(typeof changes["disableNoMoreGame"].oldValue !== "undefined")
				{
					toggleNoMoreGamesPopup(false,false);
				}

			}
		}

		if((typeof changes["refreshOnce"]!="undefined")&& (typeof changes["disableNoMoreGame"]=="undefined"))
		{
			//Only process refreshOnce if disableNoMoreGame isn't in this set of changes
			var refresh = changes["refreshOnce"].newValue || false;
			if(refresh)
			{
				storage.get("disableNoMoreGame", function(items) {					
					toggleNoMoreGamesPopup(items["disableNoMoreGame"],true);
				});			

			}

		}

		if(typeof changes["refreshEvery"]!="undefined")
		{
			var startRefreshing = changes["refreshEvery"].newValue || false;
			if(startRefreshing)
			{
				storage.get("refreshInterval", function(items) {					
					toggleNoGamesRefresh(true,items["refreshInterval"]||30);
				});			

			}
			else
			{
				if(typeof changes["refreshEvery"].oldValue !== "undefined")
				{
					toggleNoGamesRefresh(false,null);
				}

			}
		}

		if((typeof changes["refreshInterval"]!="undefined")&& (typeof changes["refreshEvery"]=="undefined"))
		{
			//Only process refreshInterval if refreshEvery isn't in this set of changes
			var interval = changes["refreshInterval"].newValue || 30;
			storage.get("refreshEvery", function(items) {					
				toggleNoGamesRefresh(items["refreshEvery"],interval);
			});		


		}



		if(typeof changes["storeGameData"]!="undefined")
		{
			var bWatch = changes["storeGameData"].newValue || false;
			if(bWatch)
			{
				watchRackMovement();
			}
			else
			{
				if(typeof changes["disableBingoPublishing"].oldValue !== "undefined")
				{
					stopWatchingRackMovement();
				}

			}
		}
	});	

	window.addEventListener("message", function(event) {
		// We only accept messages from ourselves
		if (event.source != window)
			return;

		if (event.data.type && (event.data.type == "owlhoot-1")) {	    	

			var newSetting = {};
			newSetting[event.data.type]=event.data.text;
			storage.set(newSetting,function(){
				var $input = $("input#lookupTxt").eq(0);
				if($input.hasClass('greyText')!==true)
					tooWhit();
				eeloaded = true;
			});	      
		}

		if (event.data.type && (event.data.type == "owlhoot-2")) {	    	
			gamedataObject = event.data.response;
		}
	}, false);

	chrome.runtime.onMessage.addListener(
			function(request, sender, sendResponse) {

				if (request.command == "sendresults")
				{

					//Update counts that might have vanished due to refresh
					updateCounts();

					var numPlayers = $("p.gameCardName").length;

					/*					  
					oppoScores = new Array();
					oppoIds = new Array();
					oppoNames = new Array();

					$("p.gameCardName").each(function(){

						if($(this).text() == "You ")
						{
							var playerScore = $("p.gameCardScore").eq($("p.gameCardName").index(this)).text();

						}
						else
						{

							oppoScores.push($("p.gameCardScore").eq($("p.gameCardName").index(this)).text());
							oppoIds.push($('img[class="cardAvatar"]').eq($("p.gameCardName").index(this)).attr('src').split('_')[1])
						}
					});
					 */

					if($("p.gameCardName").eq(0).text()=="You ") {
						var playerScore = $("p.gameCardScore").eq(0).text();
						var oppoScore = $("p.gameCardScore").eq(1).text(); 	
					}
					else {
						var playerScore = $("p.gameCardScore").eq(1).text();
						var oppoScore = $("p.gameCardScore").eq(0).text(); 		
					}

					if($("p.gameCardName").eq(0).text()=="You ") {
						var oppoName = $.trim($("p.gameCardName").eq(1).text());
						var oppoID=$('img[class="cardAvatar"]').eq(1).attr('src').split('_')[1];
					}
					else {
						var oppoName = $.trim($("p.gameCardName").eq(0).text());
						var oppoID=$('img[class="cardAvatar"]').eq(0).attr('src').split('_')[1];
					}

					var playerID=localStorage.cacheUser;

					var rack=new Array();
					var finished;

					if($("div#eog1Place img").length == 0)
					{
						finished = false;
					}
					else
					{
						var winnerId = $("div#eog1Place img").attr('src').split('_')[1];
						var winnerScore = $("div#eog1Place div.eogTotal div.value").text();
						var loserId = $("div#eog2Place img").attr('src').split('_')[1];
						var loserScore = $("div#eog2Place div.eogTotal div.value").text();

						if(winnerId===playerID)
						{
							finished = ((winnerScore == playerScore) && (loserId == oppoID) && (oppoScore==loserScore));
						}
						else if(winnerId===oppoID)
						{
							finished = ((winnerScore == oppoScore) && (loserId == playerID) && (playerScore==loserScore));
						}		

					}


					var word=$('tr[class="even"]').eq(0).find('td').eq(1).find('p').text().split('\"')[1];
					var word2=$('tr[class="even"]').eq(1).find('td').eq(1).find('p').text().split('\"')[1];

					var used  = {};


					var longdict = $.trim($("span#wordsBtnImage").attr('title'));
					var shortdict = longdict.match(/(Collins|TWL|OSPD4|German|Spanish|Italian|French|Portuguese)/g);

					var langs={
							"Collins":"en",
							"TWL" :"en",
							"OSPD4" : "en",
							"French": "fr",
							"Italian":"it",
							"German": "de",
							"Portuguese":"pt",
							"Spanish": "es"
					};
					var lang=langs[shortdict];


					var alldist = {
							"Collins":{"A":9,"B":2,"C":2,"D":4,"E":12,"F":2,"G":3,"H":2,"I":9,"J":1,"K":1,"L":4,"M":2,"N":6,"O":8,"P":2,"Q":1,"R":6,"S":4,"T":6,"U":4,"V":2,"W":2,"X":1,"Y":2,"Z":1,"blank":2},
							"TWL" :{"A":9,"B":2,"C":2,"D":4,"E":12,"F":2,"G":3,"H":2,"I":9,"J":1,"K":1,"L":4,"M":2,"N":6,"O":8,"P":2,"Q":1,"R":6,"S":4,"T":6,"U":4,"V":2,"W":2,"X":1,"Y":2,"Z":1,"blank":2},
							"OSPD4" :{"A":9,"B":2,"C":2,"D":4,"E":12,"F":2,"G":3,"H":2,"I":9,"J":1,"K":1,"L":4,"M":2,"N":6,"O":8,"P":2,"Q":1,"R":6,"S":4,"T":6,"U":4,"V":2,"W":2,"X":1,"Y":2,"Z":1,"blank":2},
							"French":{"A":9,"B":2,"C":2,"D":3,"E":15,"F":2,"G":2,"H":2,"I":8,"J":1,"K":1,"L":5,"M":3,"N":6,"O":6,"P":2,"Q":1,"R":6,"S":6,"T":6,"U":6,"V":2,"W":1,"X":1,"Y":1,"Z":1,"blank":2},
							"Italian":{"A":14,"B":3,"C":6,"D":3,"E":11,"F":3,"G":2,"H":2,"I":12,"L":5,"M":5,"N":5,"O":15,"P":3,"Q":1,"R":6,"S":6,"T":6,"U":5,"V":3,"Z":2,"blank":2},
							"German": {"A":5,"B":2,"C":2,"D":4,"E":15,"F":2,"G":3,"H":4,"I":6,"J":1,"K":2,"L":3,"M":4,"N":9,"O":3,"P":1,"Q":1,"R":6,"S":7,"T":6,"U":6,"V":1,"W":1,"X":1,"Y":1,"Z":1,"Ä":1,"Ö":1,"Ü":1,"blank":2},
							"Portuguese":{"A":14,"B":3,"C":4,"D":5,"E":11,"F":2,"G":2,"H":2,"I":10,"J":2,"L":5,"M":6,"N":4,"O":10,"P":4,"Q":1,"R":6,"S":8,"T":5,"U":7,"V":2,"X":1,"Z":1,"Ç":2,"blank":3},
							"Spanish": {"A":12,"B":2,"C":4,"D":5,"E":12,"F":1,"G":2,"H":2,"I":6,"J":1,"L":4,"M":2,"N":5,"O":9,"P":2,"Q":1,"R":5,"S":6,"T":4,"U":5,"V":1,"X":1,"Y":1,"Z":1,"CH":1,"LL":1,"Ñ":1,"RR":1,"blank":2}
					};

					var allvals = {
							"Collins":{"E":1,"A":1,"I":1,"O":1,"N":1,"R":1,"T":1,"L":1,"S":1,"U":1,"D":2,"G":2,"B":3,"C":3,"M":3,"P":3,"F":4,"H":4,"V":4,"W":4,"Y":4,"K":5,"J":8,"X":8,"Q":10,"Z":10,"blank":0},
							"TWL":{"E":1,"A":1,"I":1,"O":1,"N":1,"R":1,"T":1,"L":1,"S":1,"U":1,"D":2,"G":2,"B":3,"C":3,"M":3,"P":3,"F":4,"H":4,"V":4,"W":4,"Y":4,"K":5,"J":8,"X":8,"Q":10,"Z":10,"blank":0},
							"OSPD4":{"E":1,"A":1,"I":1,"O":1,"N":1,"R":1,"T":1,"L":1,"S":1,"U":1,"D":2,"G":2,"B":3,"C":3,"M":3,"P":3,"F":4,"H":4,"V":4,"W":4,"Y":4,"K":5,"J":8,"X":8,"Q":10,"Z":10,"blank":0},
							"German":{"E":1,"N":1,"S":1,"I":1,"R":1,"T":1,"U":1,"A":1,"D":1,"H":2,"G":2,"L":2,"O":2,"M":3,"B":3,"W":3,"Z":3,"C":4,"F":4,"K":4,"P":4,"Ä":6,"J":6,"Ü":6,"V":6,"Ö":8,"X":8,"Q":10,"Y":10,"blank":0},
							"Spanish":{"A":1,"E":1,"O":1,"I":1,"S":1,"N":1,"L":1,"R":1,"U":1,"T":1,"D":2,"G":2,"C":3,"B":3,"M":3,"P":3,"H":4,"F":4,"V":4,"Y":4,"CH":5,"Q":5,"J":8,"LL":8,"Ñ":8,"RR":8,"X":8,"Z":10,"blank":0},
							"Italian":{"O":1,"A":1,"I":1,"E":1,"C":2,"R":2,"S":2,"T":2,"L":3,"M":3,"N":3,"U":3,"B":5,"D":5,"F":5,"P":5,"V":5,"G":8,"H":8,"Z":8,"Q":10,"blank":0},
							"French":{"E":1,"A":1,"I":1,"N":1,"O":1,"R":1,"S":1,"T":1,"U":1,"L":1,"D":2,"M":2,"G":2,"B":3,"C":3,"P":3,"F":4,"H":4,"V":4,"J":8,"Q":8,"K":10,"W":10,"X":10,"Y":10,"Z":10,"blank":0},
							"Portuguese":{"A":1,"E":1,"I":1,"O":1,"S":1,"U":1,"M":1,"R":1,"T":1,"D":2,"L":2,"C":2,"P":2,"N":3,"B":3,"Ç":3,"F":4,"G":4,"H":4,"V":4,"J":5,"Q":6,"X":8,"Z":8,"blank":0}
					};

					var dist = alldist[shortdict];

					var letvals = allvals[shortdict];
					$.each( dist, function( key, value ) {
						used[key]=0;
					});



					$("div.tile.inactive").each(function (i) {
						if(($(this).data("id")!="-1")&&($(this).data("id")!="200"))
						{
							if ($(this).find("span.score_0").length > 0) {
								used["blank"]++;
							} else {
								used[$(this).data("letter")]++;
							}


						}
					});

					$("div.tile.active").each(function (i) {
						if (($(this).find("span.score_0").length > 0)&&($(this).data("id")!="-1") &&($(this).data("id")!="200")) {
							used["blank"]++;
							rack.push("?");
						} else {
							used[$(this).data("letter")]++;
							rack.push($(this).data("letter"));
						}
					});

					var gid = $("div[id$='GamesList']  > div[class*=urrentGame]").attr("data-match_id");
					//var gid = $("div[id$='TurnGamesList'] > div.match.lastCurrentGame,div[id$='TurnGamesList']  > div.match.currentGame").attr("data-match_id");

					rack.sort();
					var rackstring="";
					for(var i=0;i<rack.length;i++) {
						rackstring=rackstring+rack[i];
					}

					var boardimg;

					if(finished)
					{
						///TODO Send screen shot and game info

						/*html2canvas($('div#board'), {
							  logging:true,
							  proxy: 'https://scrabtourneyasst.herokuapp.com/scrabtourneyasst/h2cproxy.php',
							  onrendered: function(canvas) {
							    boardimg = canvas.toDataURL();
							    sendResponse({used: used,dist: dist,dictionary:shortdict,name: oppoName, ID:oppoID, first:word, second:word2, player:playerID, scoreP:playerScore, scoreO:oppoScore, finished: finished, rack:rackstring,gid:gid,board:boardimg});
							    return true;
							  }
						});
						 */
						sendResponse({used: used,dist: dist,letvals:letvals,dictionary:shortdict[0],name: oppoName, ID:oppoID, first:word, second:word2, player:playerID, scoreP:playerScore, scoreO:oppoScore, finished: finished, rack:rackstring,gid:gid,board:boardimg,numPlayers:numPlayers});
						return true;
					}
					else
					{
						sendResponse({used: used,dist: dist,letvals:letvals,dictionary:shortdict[0],name: oppoName, ID:oppoID, first:word, second:word2, player:playerID, scoreP:playerScore, scoreO:oppoScore, finished: finished, rack:rackstring,gid:gid,board:boardimg,numPlayers:numPlayers});
						return true;
					}
					//sendResponse({used: used,dist: dist,dictionary:shortdict,name: oppoName, ID:oppoID, first:word, second:word2, player:playerID, scoreP:playerScore, scoreO:oppoScore, finished: finished, rack:rackstring,gid:gid,board:boardimg});
				}
				if (request.command == "updateNotesFlags")
				{

					checkForOWLNotes(function(resp){
						sendResponse({done:resp});
						return true;						
					});	
					return true;
				}
				return true;

			});



}

