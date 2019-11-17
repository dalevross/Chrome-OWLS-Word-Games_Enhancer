

var trackingGenerator = {

		g_playerid:'',
		g_game:'',
		g_gameid:'',
		g_opponentId:'',
		g_screenshot:'',

		processLexWSResponse: function($dialog,data,game,gid,playerNum,lang,callback){
			oppNum = (playerNum%2)+ 1;

			var lexdist = {
					"US":"A,8|B,2|C,2|D,3|E,11|F,2|G,2|H,2|I,8|J,1|K,1|L,3|M,2|N,5|O,7|P,2|Q,1|R,5|S,3|T,5|U,3|V,2|W,2|X,1|Y,3|Z,1|blank,2",
					"EN":"A,8|B,2|C,2|D,3|E,11|F,2|G,2|H,2|I,8|J,1|K,1|L,3|M,2|N,5|O,7|P,2|Q,1|R,5|S,3|T,5|U,3|V,2|W,2|X,1|Y,3|Z,1|blank,2",
					"UK" :"A,8|B,2|C,2|D,3|E,11|F,2|G,2|H,2|I,8|J,1|K,1|L,3|M,2|N,5|O,7|P,2|Q,1|R,5|S,3|T,5|U,3|V,2|W,2|X,1|Y,3|Z,1|blank,2",
					"FR" :"A,9|B,2|C,2|D,3|E,15|F,2|G,2|H,2|I,8|J,1|K,1|L,5|M,3|N,6|O,6|P,2|Q,1|R,6|S,6|T,6|U,6|V,2|W,1|X,1|Y,1|Z,1|blank,2",
					"IT": "A,14|B,3|C,6|D,3|E,11|F,3|G,2|H,2|I,12|L,5|M,5|N,5|O,15|P,3|Q,1|R,6|S,6|T,6|U,5|V,3|Z,2|blank,2"
			};

			var wsdist = {
					"US": "A,11|B,2|C,2|D,3|E,9|F,2|G,2|H,2|I,8|J,1|K,1|L,3|M,2|N,5|O,9|P,2|Q,1|R,5|S,5|T,5|U,3|V,2|W,2|X,1|Y,3|Z,1|blank,2",
					"UK" :"A,11|B,2|C,2|D,3|E,9|F,2|G,2|H,2|I,8|J,1|K,1|L,3|M,2|N,5|O,9|P,2|Q,1|R,5|S,5|T,5|U,3|V,2|W,2|X,1|Y,3|Z,1|blank,2",
					"EN" :"A,11|B,2|C,2|D,3|E,9|F,2|G,2|H,2|I,8|J,1|K,1|L,3|M,2|N,5|O,9|P,2|Q,1|R,5|S,5|T,5|U,3|V,2|W,2|X,1|Y,3|Z,1|blank,2",
					"FR": "A,11|B,2|C,2|D,3|E,9|F,2|G,2|H,2|I,8|J,1|K,1|L,3|M,2|N,5|O,9|P,2|Q,1|R,5|S,5|T,5|U,3|V,2|W,2|X,1|Y,3|Z,1|blank,2",
					"IT" :"A,11|B,2|C,2|D,3|E,9|F,2|G,2|H,2|I,8|J,1|K,1|L,3|M,2|N,5|O,9|P,2|Q,1|R,5|S,5|T,5|U,3|V,2|W,2|X,1|Y,3|Z,1|blank,2"

			};

			var alllexvals = {
					"US":{"E":1,"A":1,"I":1,"O":1,"N":1,"R":1,"T":2,"L":1,"S":1,"U":1,"D":2,"G":2,"B":4,"C":4,"M":4,"P":4,"F":5,"H":5,"V":5,"W":5,"Y":5,"K":6,"J":10,"X":10,"Q":12,"Z":12,"blank":0},
					"UK":{"E":1,"A":1,"I":1,"O":1,"N":1,"R":1,"T":2,"L":1,"S":1,"U":1,"D":2,"G":2,"B":4,"C":4,"M":4,"P":4,"F":5,"H":5,"V":5,"W":5,"Y":5,"K":6,"J":10,"X":10,"Q":12,"Z":12,"blank":0},
					"EN":{"E":1,"A":1,"I":1,"O":1,"N":1,"R":1,"T":2,"L":1,"S":1,"U":1,"D":2,"G":2,"B":4,"C":4,"M":4,"P":4,"F":5,"H":5,"V":5,"W":5,"Y":5,"K":6,"J":10,"X":10,"Q":12,"Z":12,"blank":0},
					"FR":{"O":1,"A":1,"I":1,"E":1,"C":4,"R":1,"S":1,"T":1,"L":1,"M":2,"N":1,"U":1,"B":4,"D":2,"F":5,"P":3,"V":5,"G":2,"H":5,"Q":8,"J":10,"K":12,"W":12,"X":12,"Y":12,"Z":12,"blank":0},
					"IT":{"O":1,"A":1,"I":1,"E":1,"C":4,"R":1,"S":1,"T":1,"L":1,"M":2,"N":1,"U":1,"B":4,"D":2,"F":5,"P":3,"V":5,"G":2,"H":5,"Q":8,"J":10,"K":12,"W":12,"X":12,"Y":12,"Z":12,"blank":0}
			};

			var allwsvals = {
					"US":{"E":1,"A":1,"I":1,"O":1,"N":1,"R":1,"T":2,"L":1,"S":1,"U":1,"D":2,"G":2,"B":4,"C":4,"M":4,"P":4,"F":5,"H":5,"V":5,"W":5,"Y":5,"K":6,"J":10,"X":10,"Q":12,"Z":12,"blank":0},
					"UK":{"E":1,"A":1,"I":1,"O":1,"N":1,"R":1,"T":2,"L":1,"S":1,"U":1,"D":2,"G":2,"B":4,"C":4,"M":4,"P":4,"F":5,"H":5,"V":5,"W":5,"Y":5,"K":6,"J":10,"X":10,"Q":12,"Z":12,"blank":0},
					"EN":{"E":1,"A":1,"I":1,"O":1,"N":1,"R":1,"T":2,"L":1,"S":1,"U":1,"D":2,"G":2,"B":4,"C":4,"M":4,"P":4,"F":5,"H":5,"V":5,"W":5,"Y":5,"K":6,"J":10,"X":10,"Q":12,"Z":12,"blank":0},
					"FR":{"E":1,"A":1,"I":1,"O":1,"N":1,"R":1,"T":2,"L":1,"S":1,"U":1,"D":2,"G":2,"B":4,"C":4,"M":4,"P":4,"F":5,"H":5,"V":5,"W":5,"Y":5,"K":6,"J":10,"X":10,"Q":12,"Z":12,"blank":0},
					"IT":{"E":1,"A":1,"I":1,"O":1,"N":1,"R":1,"T":2,"L":1,"S":1,"U":1,"D":2,"G":2,"B":4,"C":4,"M":4,"P":4,"F":5,"H":5,"V":5,"W":5,"Y":5,"K":6,"J":10,"X":10,"Q":12,"Z":12,"blank":0}					
			};


			if(game=="lexulous")
			{
				distribution = lexdist[lang.toUpperCase()];
				letvals =  alllexvals[lang.toUpperCase()];
			}
			else
			{
				distribution = wsdist[lang.toUpperCase()];
				letvals =  allwsvals[lang.toUpperCase()];
				//distribution = $(data).find('tile_count').text();

			}

			//var letvals =  allvals[lang.toUpperCase()];

			var dist = {};
			var used = {};
			var letters = distribution.split("|");
			$.each(letters, function(i,pair){
				let_count = pair.split(",");
				dist[let_count[0]]=let_count[1];
				used[let_count[0]]= 0;
			});

			nodeval = $(data).find('nodeval').text();
			var usedletters = nodeval.split("|");
			$.each(usedletters, function(i,pair){
				cell_info = pair.split(",");
				letter = (cell_info[0]===cell_info[0].toUpperCase())?cell_info[0]:"blank";
				used[letter]++;
			});

			numPlayers = $(data).find('playersNo').text();

			if($.trim(numPlayers)=="")
			{
				for (var i=1;i<=4;i++)
				{
					if($.trim($(data).find('p'+i+'email').text()) != "")
					{
						numPlayers = i;

					}				

				}				
			}

			var rack=new Array();
			myrack = $(data).find('myrack').text();
			usedletters = myrack.split('');
			$.each(usedletters, function(i,let){
				letter = (let==='*')?"blank":let;
				used[letter]++;
				rack.push((letter==="blank")?"?":letter);

			});

			rack.sort();
			var rackstring = rack.join('');

			var response = {};
			response.dist = dist;
			response.used = used;
			response.name = $(data).find('p'+oppNum).text();
			response.ID = $(data).find('p'+oppNum + 'email').text();
			response.player = $(data).find('p'+playerNum + 'email').text();
			response.scoreP = $(data).find('p' +playerNum + 'score').text();
			response.scoreO = $(data).find('p'+oppNum + 'score').text();
			response.rack = rackstring;
			response.dictionary = $(data).find('dictionary').text();
			response.gid = gid;
			response.letvals = letvals;
			response.numPlayers = numPlayers;
			status =  $(data).find('status').text().toUpperCase();
			myturn = $(data).find('myturn').text().toUpperCase();

			response.status = (status==="F")?'Game completed':((myturn==="Y")?'<span style="font-weight:bold">It\'s now your turn!</span>':'Opponent\'s turn.');
			response.finished = (status==="F");

			count = +($(data).find('movesnode').find('cnt').text());
			for (var i=1;i<=count;i++)
			{
				var move = $(data).find('movesnode').find('m'+i).text();
				var blocks = move.split(',');
				if((blocks[4]==='r'))
				{	
					response.first = blocks[2].toUpperCase();
					break;
				}			

			}

			trackingGenerator.loadToDialog($dialog,response,game);
			callback();
		},

		loadToDialog: function($dialog,response,game){

			var used = response.used;
			var dist = response.dist;
			var oppoName = response.name;
			var oppoID= response.ID;
			var word=response.first;
			var dictionary=response.dictionary;
			var playerId=response.player;
			var playerScore=response.scoreP;
			var oppoScore=response.scoreO;
			var finished = response.finished;
			var rack = response.rack;
			var gameid = response.gid;
			var letvals = response.letvals;
			var numOpponents = response.numPlayers-1;

			trackingGenerator.g_playerid = response.player;			
			trackingGenerator.g_gameid = response.gid;
			trackingGenerator.g_game = game;
			trackingGenerator.g_opponentId = response.ID;
			trackingGenerator.g_screenshot = response.board;
			var bkg = chrome.extension.getBackgroundPage();

			var left = {};
			var tilecount = 0;
			var vowels = "AEIOU";
			var vcnt=0;var ccnt=0;var bcnt=0;

			if(!word) {word=response.second;}

			for(var letter in used){
				if((dist[letter]-used[letter])>0)
				{
					left[letter] = dist[letter]-used[letter];
					tilecount+=dist[letter]-used[letter];
				}
			}

			var index = 0;
			var html = '';

			var heading='Your game with '+oppoName+' <div class="profile"><a href="http://facebook.com/'+oppoID+'" target="_blank"><img src="FB-f-Logo__blue_29.png" style="width:11px"/>&nbsp;View Facebook Profile</a></div>';
			$('div#heading').html(heading);

			if(bkg.updateAvailable)
			{
				$('div#updateAvailable').html('<a>Update to version "'+ bkg.updateVersion +'!"</a>').on('click','a',function(){
					chrome.runtime.reload();
				});
			}

			var rackLength = (game=="scrabble")?7:8;

			var inbag = (tilecount>(rackLength*numOpponents))?tilecount-(rackLength*numOpponents):0;
			html = html + '<span style="font-weight:bold;">Tile Count: ' + tilecount + '</span><span> ('+ inbag + ' in bag)</span><br/>';

			var showAllTiles = $("div#settings input[name=allTiles]").prop('checked');
			var showTotals = $("div#settings input[name=showTotals]").prop('checked');
			var distinguishVowels = $("div#settings input[name=distinguishVowels]").prop('checked');
			var useAllTilesLimit = $("div#settings input[name=useAllTilesLimit]").prop('checked');
			var allTilesLimit = $("div#settings input[name=allTilesLimit]").val();
			var showValues = $("div#settings input[name=showValues]").prop('checked');

			if(showAllTiles && useAllTilesLimit)
			{
				showAllTiles = 	(tilecount > allTilesLimit);			
			}

			var numTiles = (showAllTiles)?Object.keys(dist).length:Object.keys(left).length;


			for (var letter in dist) {
				if(!showAllTiles && !(left[letter]))
					continue;


				if(left[letter])
				{
					if(vowels.indexOf(letter)>-1) 
					{
						vcnt=vcnt+left[letter];
					}
					else if(letter!="blank")
					{
						ccnt=ccnt+left[letter];
					}
					else
					{
						bcnt=left[letter];
					}
				}

				if((index % 8)===0)
				{
					html = html + '<div style="float:left;padding:10px;padding-left:5px">';
				}
				html = html + '<div class="wrapper' + ((showAllTiles && !(left[letter]))?' depleted':'') +'"><div   class="letter' + ((vowels.indexOf(letter)>-1)?' vowel':'') +'" title="Total: ' + dist[letter] +  '">' + letter + '<span class="value"><sub>'+ letvals[letter] +'</sub></span></div><div class="count' + ((vowels.indexOf(letter)>-1)?' vowel':'') + '">' + (left[letter] || '0') + ((showTotals)?('/' + dist[letter].toString()):'') + '</div></div>';
				index++;
				if(((index)%8===0 && index!==0)|| index === numTiles)
				{
					html = html + '</div>';
				}
			}



			html = html + '<div style="clear:both"/><div class="vccnt">Vowels: '+vcnt+', Consonants: '+ccnt+', Blanks: '+bcnt+'.<BR>Your sorted rack: <b>'+rack+'</b></div>';

			if(response.status)
			{
				html = html + '<br/><span id="trackerstat">' + response.status + '</span><br/>';

			}

			var d = new Date();

			var suffix = '<span style="font-size:10px"> Retrieved at ' + d.toLocaleString() + '</span>';

			html = html + suffix;

			/*
			 chrome.tabs.captureVisibleTab( function (dataURL){
				html = html + '<br/>' + '<a href="' + dataURL  + '" target="_blank">Download Screen Shot</a>' + '<br/>';
			}
			);*/

			if(playerId=='593170373'||playerId=='712117020') {
				if(finished) {
					html=html + '<div class="sendScore"><form action="http://moltengold.com/cgi-bin/scrabble/extn.pl" method="post" target="scoring"> <input name="playerScore" value="'+ playerScore +'" type="hidden" > <input name="oppoScore" value="'+ oppoScore +'" type="hidden" >  <input name="playerId" value="'+playerId+'" type="hidden"> <input name="oppoId" value="'+oppoID+'" type="hidden">  <input name="dictionary" value="'+dictionary+'" type="hidden"> <input name="word" value="'+ word +'" type="hidden" > <input name="app" value="Scrabble" type="hidden"> Save final scores in Facebook Scrabble League <input type="submit" value="Save"></form></div>';
				}
				else if(word) {

					html=html + '<div class="sendWord"><form action="http://moltengold.com/cgi-bin/scrabble/extn.pl" method="post" target="scoring"> <input name="word" value="'+ word +'" type="hidden" > <input name="playerId" value="'+playerId+'" type="hidden"> <input name="oppoId" value="'+oppoID+'" type="hidden">  <input name="dictionary" value="'+dictionary+'" type="hidden"> <input name="app" value="Scrabble" type="hidden"> Record first word ('+word+') in Facebook Scrabble League <input type="submit" value="Send"></form></div>';
				}


				$dialog.html(html);
				$("input[type=submit]").button();
				var $ajaxresult;
				if (!$('#ajaxresult').is(':data(dialog)')) {

					$ajaxresult = $('<div id="ajaxresult" ></div>').html('').dialog({autoOpen : false,title : 'Score Manager',
						width : 250,
						modal:true
					});

				} else {
					$ajaxresult = $('#ajaxresult');
				}

				var params;

				var uGame = game.substring(0,1).toUpperCase() + game.substring(1);
				//Override click for send event.				
				$("div[class^=send] input[type=submit]").on('click',function(evt){				
					evt.preventDefault();
					if(finished)
					{
						params = {playerScore:playerScore,oppoScore:oppoScore,playerId:playerId,oppoId:oppoID,dictionary:dictionary,word:word,app:uGame,gameid:gameid};

					}
					else
					{
						params = {word:word,playerId:playerId,oppoId:oppoID,dictionary:dictionary,app:uGame,gameid:gameid};
					}

					var loadinghtml = '<div><span>Loading...</span><br/><img src="trackerloading.gif" /></div>';

					if ($ajaxresult.dialog('isOpen')) {

						$ajaxresult.html(loadinghtml);

					} else {

						$ajaxresult.html(loadinghtml).dialog('open');

					}
					var url = 'http://moltengold.com/cgi-bin/scrabble/extn.pl';

					$.ajax({url : url,//+ '?callback=?',
						context : this,
						data : (params),
						dataType : "html",
						type:"POST",
						success : function(data) {		
							$ajaxresult.html(data);							
							return true;
						},
						failure : function(jqXHR, textStatus, errorThrown) {
							$ajaxresult.html(textStatus);
							return false;

						}
					});

				});
			}
			else
			{
				$dialog.html(html);

			}			

			if($('input[name=distinguishVowels]').prop('checked'))
			{
				$("div.vowel").css({'color':'blue','font-weight': 'bold'});
			}
			else
			{
				$("div.vowel").css({'color':'darkgreen','font-weight': 'normal'});
			}

			if($('input[name=showValues]').prop('checked'))
			{
				$("span.value").css({'display':'inline'});
			}
			else
			{
				$("span.value").css({'display':'none'});
			}

		},
		getTilesLeft: function(applink,callback) {

			var html = '';

			var $dialog;

			$dialog = $('#lexwstracker');

			var dist = {"A":9,"B":2,"C":2,"D":4,"E":12,"F":2,"G":3,"H":2,"I":9,"J":1,"K":1,"L":4,"M":2,"N":6,"O":8,"P":2,"Q":1,"R":6,"S":4,"T":6,"U":4,"V":2,"W":2,"X":1,"Y":2,"Z":1,"blank":2};

			// var applink = chrome.extension.getBackgroundPage().currentUrl;
			var game = applink.match(/(lexulous|wordscraper|ea_scrabble_closed|livescrabble)/g);

			if (game === null) {

				$dialog.html('Invalid link,' + applink +',found in address bar!');		

				return false;

			}
			var loadinghtml = '<div><span>Loading...</span><br/><img src="trackerloading.gif" /></div>';

			if((game[0]=="ea_scrabble_closed")||(game[0]=="livescrabble"))
			{
				game = 'scrabble';

				$dialog.html(loadinghtml);
				chrome.tabs.query({'active': true, 'currentWindow':true,windowType:"normal"}, function (tabs) {
					chrome.tabs.sendMessage(tabs[0].id, {command: "sendresults"}, function(response) {
						var used = response.used;
						var dist = response.dist;
						trackingGenerator.loadToDialog($dialog,response,game);
						callback();
					});
				});

			}
			else
			{


				var gid = /gid=(\d+)/g.exec(applink);
				var lang = /lang=(\w+)/g.exec(applink);

				trackingGenerator.g_game = game[0];
				trackingGenerator.g_gameid = gid[1];




				if ((gid === null)||(lang===null)) {

					$dialog.html('Invalid game link!');		

					return false;
				}



				var showGameOver = /showGameOver=(\d)/g.exec(applink);




				var pid = /pid=(\d)/g.exec(applink);
				var password = /password=(\w+)/g.exec(applink);

				if ((pid === null) || (password === null)) {

					params = {gid : gid[1],pid : 1,action:'gameinfo'};

				} else {

					params = {gid : gid[1],game : game[0],pid : pid[1],password : password[1],action:'gameinfo'};

				}

				if (showGameOver !== null) {
					params["showGameOver"]=showGameOver[1];
				}		



				$dialog.html(loadinghtml);

				var url = "https://aws.rjs.in/" + ((game=="lexulous")?"fblexulous":"wordscraper") + "/engine/xmlv3.php";

				$.ajax({url : url,	
					context : this,	
					data : (params),	
					dataType : "xml",	
					success : function(data) {					
						//Response was successful but empty, try again with gameOver
						if(($.trim($(data).find('p1score').text())===""))
						{
							if(params.showGameOver == null)
							{
								params.showGameOver = '1';
								$.ajax({url : url,	
									context : this,	
									data : (params),	
									dataType : "xml",	
									success : function(data) {

										if(($.trim($(data).find('p1score').text())===""))
										{
											$dialog.html('An error was encountered retrieving the game information.<br/>Please try again');												
										}
										else
										{
											trackingGenerator.processLexWSResponse($dialog,data,game[0],gid[1],pid[1],lang[1],callback);												
										}

									},
									failure: function(jqXHR, textStatus, errorThrown) {
										$dialog.html(textStatus);											
										return false;
									}
								});

							}
							else
							{
								$dialog.html('An error was encountered retrieving the game information.<br/>Please try again');									
							}							

						}
						else
						{
							trackingGenerator.processLexWSResponse($dialog,data,game[0],gid[1],pid[1],lang[1],callback);

						}				

					},

					failure : function(jqXHR, textStatus, errorThrown) {

						$dialog.html(textStatus);

						return false;

					}

				});
			}
			return true;

		},

		getStorageRecordId : function (userid,game,gameid)
		{
			return userid + '_' + game + '_'+ gameid;

		}
};


//Run our tile tracker script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {

	var bkg = chrome.extension.getBackgroundPage();

	var version = chrome.runtime.getManifest().version; 

	$("div#version").html("Version: " + version);

	$("#tabs").tabs();
	$("ul.ui-widget-header").removeClass(' ui-corner-all').css({ 'border' : 'none', 'border-bottom' : '1px solid #d4ccb0'});
	$("#saveButton").button({icons : { primary: "ui-icon-disk" }});
	$("#saveButton").hide();
	$("#deleteButton").button({icons : { primary: "ui-icon-trash" }});
	$("#deleteButton").hide();

	$("div#toolbar img#closeButton").on('click',function(){
		window.close();		
	});

	$("div#toolbar img#refreshButton").on('click',function(){
		window.location.reload();		
	});


	var storage = chrome.storage.sync;

	$chkNotesFirst = $("div#settings input[name=notesFirst]");


	var editor = new TINY.editor.edit('editor', {
		id: 'tinyeditor',
		width: 320,
		height: 250,
		cssclass: 'tinyeditor',
		css:'body{background-color:#ffffff}', 
		controlclass: 'tinyeditor-control',
		rowclass: 'tinyeditor-header',
		dividerclass: 'tinyeditor-divider',
		controls: ['bold', 'italic', 'underline', 'strikethrough',
		           '|', 'outdent', 'indent', '|','undo', 'redo','unformat','n'
		           , 'size', '|', 'image', 'link', 'unlink'],
		           footer: false,
		           xhtml: false,
		           bodyid: 'editor'		
	});	


	var innerbody = editor.i.contentWindow.document.body;

	loadSettings(function(){


		chrome.tabs.query({'active': true,'currentWindow':true,windowType:"normal"}, function (tabs) {
			var applink = tabs[0].url;
			trackingGenerator.getTilesLeft(applink,function(){
				var recid = trackingGenerator.getStorageRecordId(trackingGenerator.g_playerid,trackingGenerator.g_game,trackingGenerator.g_gameid);

				$(innerbody).attr('contenteditable',false);
				$("div#notestatus").html('<span>Loading...</span><br/><img src="note-loading.gif" />');
				unbindNoteChangeEvents();

				bkg.oWLStorage.openDB(function(result){
					if(result)
					{

						setTimeout(function(){
							bkg.oWLStorage.getNoteByRecordId(recid,function(note){		
								if($.trim(note)!="")
								{
									$('#tabs .ui-tabs-nav li:nth-child(2) span').html("<img class='ui-icon ui-icon-comment'/>Notes");
									$(innerbody).html(note);//.append('<img src="' +  trackingGenerator.g_screenshot + '" />');
									editor.post();
									if($chkNotesFirst.prop('checked'))
									{
										$("#tabs" ).tabs( "option", "active", 1 );
									}
									$("#deleteButton").show();
								}
								else
								{
									$('#tabs .ui-tabs-nav li:nth-child(2) span').html("Notes");

								}

								$(innerbody).attr('contenteditable',true);
								$("div#notestatus").html('');
								bindNoteChangeEvents();
							});
						},100);


					}
					else
					{

						$(innerbody).attr('contenteditable',true);
						$("div#notestatus").html('');
						bindNoteChangeEvents();
					}

				});

			});
		});
	});

	$('button#deleteButton').click(function(){
		$(innerbody).fadeOut(500, function() {
			$(innerbody).html("");
			$('button#saveButton').click();
		}).fadeIn(500);

	});

	$('button#saveButton').click(function(){

		teval = $.trim($("#tinyeditor").val());
		if(teval != $(innerbody).html())
		{
			$(innerbody).attr('contenteditable',false);
			$("div#notestatus").html('<span>Saving...</span><br/><img src="note-loading.gif" />');
			unbindNoteChangeEvents();

			editor.post();
			var recid = trackingGenerator.getStorageRecordId(trackingGenerator.g_playerid,trackingGenerator.g_game,trackingGenerator.g_gameid);
			bkg.oWLStorage.addNote(recid, trackingGenerator.g_playerid, trackingGenerator.g_game, trackingGenerator.g_gameid,$.trim($("#tinyeditor").val()),trackingGenerator.g_opponentId,function(result){
				if(result)
				{
					$('#saveButton').hide();
					if(($.trim($("#tinyeditor").val())=="")||($.trim($("#tinyeditor").val())=="<br>"))
					{
						$('#tabs .ui-tabs-nav li:nth-child(2) span').html("Notes");
						$("#deleteButton").hide();
					}
					else{
						$('#tabs .ui-tabs-nav li:nth-child(2) span').html("<img class='ui-icon ui-icon-comment'/>Notes");
						$("#deleteButton").show();
					}

					if(trackingGenerator.g_game==="scrabble")
					{
						chrome.tabs.query({'active': true, 'currentWindow':true,windowType:"normal"}, function (tabs) {
							chrome.tabs.sendMessage(tabs[0].id, {command: "updateNotesFlags"}, function(response) {
							});
						});
					}
					else
					{

						chrome.tabs.query({'active': true, 'currentWindow':true,windowType:"normal"}, function (tabs) {

							bkg.oWLStorage.updateNoteIndicatorByGameAndId(trackingGenerator.g_game,trackingGenerator.g_gameid,tabs[0].id);
							//chrome.tabs.sendMessage(tabs[0].id, {command: "updateNotesFlags"}, function(response) {

						});

					}

					reloadOptions();


				}

				$(innerbody).attr('contenteditable',true);
				$("div#notestatus").html('');
				bindNoteChangeEvents();

			});


		}

	});

	function reloadOptions(){
		var optionstaburl = chrome.extension.getURL("options.html");
		chrome.tabs.query({url:optionstaburl}, function (tabs) {
			if(typeof tabs[0] !== "undefined")
			{
				chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
			}
		});
	}

	var delay = (function(){
		var timer = 0;
		return function(callback, ms){
			clearTimeout (timer);
			timer = setTimeout(callback, ms);
		};
	})();	

	function registerNoteChange()
	{

		delay(function(){
			teval = $.trim($("#tinyeditor").val());
			if(teval != $(innerbody).html())
			{			
				$('#saveButton').show();				
			}	
		}, 500 );
	}	

	function bindNoteChangeEvents(){
		$('div.tinyeditor').on('mouseup',registerNoteChange);
		$(innerbody).on("paste keyup mouseup",registerNoteChange );
	}

	function unbindNoteChangeEvents(){
		$('div.tinyeditor').off('mouseup',registerNoteChange);
		$(innerbody).off("paste keyup mouseup",registerNoteChange );
	}

	function loadSettings(callback)
	{
		var done=false;
		var chkCount = $("div#settings input:checkbox").length;
		var chksLoaded = 0;

		var numCount = $("div#settings input[type=number]").length;
		var numsLoaded = 0;

		$("div#settings input:checkbox").each(function(){
			var $chk = $(this);

			(function($checkbox)
					{

				var name = $checkbox.attr('name');

				//var origVal = (name=="notesFirst")?true:false;
				var origVal = false;

				storage.get(name, function(items) {

					if (typeof items[name] !== "undefined") {
						$checkbox.prop('checked', items[name]);
						if(name=="useAllTilesLimit")
						{
							$("div#settings input[name=allTilesLimit]").prop('disabled', !$("div#settings input[name=useAllTilesLimit]").prop('checked'));
						}
						
						if(name=="refreshEvery")
						{
							var val = items[name];
							$("div#settings input[name=refreshInterval]").prop('disabled', !val);
						}
						if(name=="allTiles")
						{
							$("div#settings input[name=useAllTilesLimit]").prop('disabled', !$("div#settings input[name=allTiles]").prop('checked'));
						}
						
						if(name=="disableNoMoreGame")
						{
							$("div#settings input[name=refreshOnce]").prop('disabled',!$("div#settings input[name=disableNoMoreGame]").prop('checked'));
						}
						

						chksLoaded++;
						if(chksLoaded === chkCount && numsLoaded === numCount && done === false)
						{
							done = true;
							bindSettingsChangeEvents();
							callback();
						}		
					}
					else
					{

						if($.inArray(name,["clickToSubmit","notesFirst"]) > -1)
						{
							$checkbox.prop('checked',true);
							origVal=true;
						}

						var newSetting = {};
						newSetting[name]=origVal;
						storage.set(newSetting, function(){
							if(name=="useAllTilesLimit")
							{
								$("div#settings input[name=allTilesLimit]").prop('disabled', !$("div#settings input[name=useAllTilesLimit]").prop('checked'));
							}
							
							if(name=="refreshEvery")
							{
								var val = items[name];
								$("div#settings input[name=refreshInterval]").prop('disabled',!$("div#settings input[name=refreshEvery]").prop('checked'));
							}
							
							if(name=="allTiles")
							{
								$("div#settings input[name=useAllTilesLimit]").prop('disabled', !$("div#settings input[name=allTiles]").prop('checked'));
							}
							
							if(name=="disableNoMoreGame")
							{
								$("div#settings input[name=refreshOnce]").prop('disabled',!$("div#settings input[name=disableNoMoreGame]").prop('checked'));
							}

							chksLoaded++;
							if(chksLoaded === chkCount && numsLoaded === numCount && done === false)
							{
								done = true;
								bindSettingsChangeEvents();
								callback();
							}				

						});	    		    	

					}

				});
					})($chk);
		});

		$("div#settings input[type=number]").each(function(){
			var $ipt = $(this);

			(function($input){
				var name = $input.attr('name');
				var origVal = $input.val();
				storage.get(name, function(items) {

					if (typeof items[name] !== "undefined") {
						$input.val(items[name]);
						numsLoaded++;
						if(chksLoaded === chkCount && numsLoaded === numCount && done === false)
						{
							done = true;
							bindSettingsChangeEvents();
							callback();
						}			


					}
					else
					{
						var newSetting = {};
						newSetting[name]=origVal;
						storage.set(newSetting,function(){
							numsLoaded++;
							if(chksLoaded === chkCount && numsLoaded === numCount && done === false)
							{
								done = true;
								bindSettingsChangeEvents();
								callback();
							}					

						});	    		    	
					}

				});
			})($ipt);
		});

		function bindSettingsChangeEvents(){
			  
			
			$("div#settings input:checkbox").change(function(){
				
				var name = $(this).attr('name');
				var newSetting = {};
				newSetting[name] = $(this).prop('checked');
				storage.set(newSetting);
				reloadOptions();

			});

			$("div#settings input[type=number]").change(function(){		
				var name = $(this).attr('name');
				var newSetting = {};
				newSetting[name] = $(this).val();
				storage.set(newSetting); 
				reloadOptions();

			});	
		}				

	}

	chrome.storage.onChanged.addListener(function(changes, namespace) {

		var changeLen = Object.keys(changes).length;
		var changeCount = 0 ;
		for (key in changes) {
			var storageChange = changes[key];
			if(typeof storageChange.newValue != "undefined")
				return;

			changeCount++;
			if(changeCount==changeLen)
			{
				window.location.reload();
			}

		}
	});

	chrome.storage.onChanged.addListener(function(changes, namespace) {

		var newVal = false;
		

		if(typeof changes["useAllTilesLimit"]!="undefined")
		{
			var newVal = changes["useAllTilesLimit"].newValue || false;
			$("div#settings input[name=allTilesLimit]").prop('disabled', !newVal);
			if(newVal)
			{
				$("div#settings input[name=allTiles]").prop('checked', true).trigger("change");
			}
			
		}
		
		
		if(typeof changes["refreshOnce"]!="undefined")
		{
			var newVal = changes["refreshOnce"].newValue || false;
			if(newVal)
			{
				$("div#settings input[name=disableNoMoreGame]").prop('checked', true).trigger("change");
			}
			
		}
		
		if(typeof changes["disableNoMoreGame"]!="undefined")
		{
			var newVal = changes["disableNoMoreGame"].newValue || false;
			if(!newVal)
			{
				$("div#settings input[name=refreshOnce]").prop('checked', false).trigger("change");
				$("div#settings input[name=refreshOnce]").prop('disabled', true);
			}
			else
			{
				$("div#settings input[name=refreshOnce]").prop('disabled', false);
			}
		}	
		
		if(typeof changes["allTiles"]!="undefined")
		{
			var newVal = changes["allTiles"].newValue || false;
			if(!newVal)
			{
				$("div#settings input[name=useAllTilesLimit]").prop('checked', false).trigger("change");
				$("div#settings input[name=useAllTilesLimit]").prop('disabled', true);
				$("div#settings input[name=allTilesLimit]").prop('disabled', true);
			}
			else
			{
				$("div#settings input[name=useAllTilesLimit]").prop('disabled', false);
			}
		}
		
		
		
		
		
		if(typeof changes["refreshEvery"]!="undefined")
		{
			var newVal = changes["refreshEvery"].newValue || false;
			$("div#settings input[name=refreshInterval]").prop('disabled', !newVal);
		}
		
		
		
		

		if(typeof changes["distinguishVowels"]!="undefined")
		{
			var newVal = changes["distinguishVowels"].newValue || false;
			if(newVal)
			{
				$("div.vowel").css({'color':'blue','font-weight': 'bold'});
			}
			else
			{
				$("div.vowel").css({'color':'darkgreen','font-weight': 'normal'});
			}
		}

		if(typeof changes["showValues"]!="undefined")
		{
			var newVal = changes["showValues"].newValue || false;			
			if(newVal)
			{
				$("span.value").css({'display':'inline'});
			}
			else
			{
				$("span.value").css({'display':'none'});
			}
		}
		
		
		

	});		

	bindNoteChangeEvents();


});
