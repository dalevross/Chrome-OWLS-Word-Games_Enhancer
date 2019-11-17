document.addEventListener('DOMContentLoaded', function () {

	var bkg = chrome.extension.getBackgroundPage();

	var version = chrome.runtime.getManifest().version;
	var notesTable;

	$("div#options-version").html("Version: " + version);
	$( "#dialog-confirm").dialog({ autoOpen: false });

	$("#accordion").accordion({
		collapsible : true,
		active : false,
		heightStyle:"content"
	});

	$("div#toolbar div#refreshButton").on('click',function(){
		window.location.reload();		
	});


	$("button#deleteAll,button#deleteSelected").button({icons : { primary: "ui-icon-trash" }}).css('display','none');

	$("button#deleteSelected").click(function(){		
		var button = this;
		var $dialog = $( "#dialog-confirm" );
		$( "#dialog-confirm" ).eq(0).html("<img src='owl-on-coke.png' style='display: inline;vertical-align:middle;'/><span>Deleted notes cannot be recovered. Are you sure?</span>").dialog({
			resizable: false,
			draggable:false,
			height:'auto',
			modal: true,
			position: { my: "bottom center", at: "top center", of: button },
			buttons: {
				"Yes": function() {
					var lastindex = $("div#notesContainer .selectrecord:checked").length - 1; 
					$(".selectrecord:checked",notesTable.fnGetNodes() ).each(function(index){
						var noteid = $(this).data('id');
						var nRow = $(this).parents('tr').get(0);
						bkg.oWLStorage.addNote(noteid, null, null, null,"",null,function(result){
							if(result)
							{								
								notesTable.fnDeleteRow( nRow );							
							}

							if(index===lastindex)
							{
								chrome.tabs.query({url:"*://apps.facebook.com/*",windowType:"normal"}, function (tabs) {
									$.each(tabs,function(index,tab){																	
										if (((tab.url.indexOf('lexulous') > -1 && tab.url.indexOf('gid') > -1 )||(tab.url.indexOf('wordscraper') > -1  && tab.url.indexOf('gid') > -1)|| (tab.url.indexOf('ea_scrabble_closed') > -1)|| (tab.url.indexOf('livescrabble') > -1))&&(tab.url.indexOf('apps.facebook.com') > -1)) {
											chrome.tabs.update(tab.id, {url: tab.url});
										}
									});
									$dialog.dialog("close");

								});
							}


						});			
					});


				},
				"No": function() {
					$dialog.dialog( "close" );
				}
			}

		}).dialog("open");



	});


	$("button#deleteAll").click(function(){		
		var button = this;
		var $dialog = $( "#dialog-confirm" );
		$( "#dialog-confirm" ).eq(0).html("<img src='owl-on-coke.png' style='display: inline;vertical-align:middle;'/><span>Deleted notes cannot be recovered. Are you sure?</span>").dialog({
			resizable: false,
			draggable:false,
			height:'auto',
			modal: true,
			position: { my: "bottom center", at: "top center", of: button },
			buttons: {
				"Yes": function() {
					bkg.oWLStorage.deletAllNotes(function(result){
						if(result)
						{

							chrome.tabs.query({url:"*://apps.facebook.com/*",windowType:"normal"}, function (tabs) {
								$.each(tabs,function(index,tab){																	
									if (((tab.url.indexOf('lexulous') > -1 && tab.url.indexOf('gid') > -1 )||(tab.url.indexOf('wordscraper') > -1  && tab.url.indexOf('gid') > -1)|| (tab.url.indexOf('ea_scrabble_closed') > -1)|| (tab.url.indexOf('livescrabble') > -1))&&(tab.url.indexOf('apps.facebook.com') > -1)) {
										chrome.tabs.update(tab.id, {url: tab.url});
									}
								});								
								window.location.reload();
							});		

						}								       			

					});		
				},
				"No": function() {
					$dialog.dialog( "close" );
				}
			}

		}).dialog("open");	
	});

	var storage = chrome.storage.sync;

	$chkNotesFirst = $("div#settings input[name=notesFirst]");

	loadSettings(function(){
		
		bkg.oWLStorage.openDB(function(result){
			if(result)
			{

				setTimeout(function(){
					bkg.oWLStorage.getAllNotes(function(notes){
						if(notes.length)
						{


							var notesObj = {};
							var aaData = new Array();
							$.each(notes,function(){
								var record = this;
								select = "<input class='selectrecord' type='checkbox' data-id='"+ record.recordid +"'/>";
								game = record.game.substring(0,1).toUpperCase() + record.game.substring(1);
								if(/(lexulous|wordscraper)/.test(record.game.toLowerCase()))
								{
									gameM = /(lexulous|wordscraper)/g.exec(record.game.toLowerCase());
									gameid = "<a href='https://apps.facebook.com/"+ gameM[0]+ "/?action=viewboard&gid="+ record.gameid + "&pid=2&showGameOver=' target='_blank'>" + record.gameid + "</a>";
								}
								else
								{

									gameid = "<span title='"+ record.gameid +"'>" + ((record.gameid.length > 10)?(record.gameid.substring(0,9)+ "..."): record.gameid) + "</span>";

								}

								notesObj[record.recordid]= record.note;

								opponent = "<a style=\"white-space: nowrap;\" class=\"profile\" data-id=\""+ record.opponent+ "\" href=\"https://www.facebook.com/"+ record.opponent+ "\" target=\"_blank\"><img src=\"https://graph.facebook.com/"+ record.opponent+"/picture?type=small\"/></a>";
								showNote = "<span class=\"showNote\"><img data-id=\""+  record.recordid +"\"  class=\"ui-icon ui-icon-circle-triangle-e\"/></span>";
								dateSaved = record.savedDate.toUTCString();
								deleteNote = "<button class=\"deleteNote\" data-id=\""+ record.recordid +"\">Delete</button>";
								aaData.push([select,game,gameid,opponent,showNote,dateSaved,deleteNote]);
							});
							//console.debug(JSON.stringify(notesObj));
							$('#notesContainer').html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="notesTable" width="100%"></table>' );
							notesTable = $('#notesTable').dataTable( {
								"aaData": aaData,
								"aoColumnDefs": [{ "bSortable": false, "aTargets": [ 0,4,6 ] }],
								"aaSorting": [[ 5, "desc" ]],
								"fnRowCallback": function( nRow, aData, iDisplayIndex ) {									/* Append the grade to the default row class name */

									$('input.selectrecord',nRow).on('change',function(){
										
										numChecked = $(".selectrecord:checked",notesTable.fnGetNodes()).length;
										someChecked = numChecked > 0;
										$("button#deleteSelected .ui-button-text").text("Delete Selected Notes (" +  numChecked + ")");
										$("button#deleteSelected").css('display',(someChecked)?'block':'none');										
									});



									$('button.deleteNote', nRow).button({icons : { primary: "ui-icon-trash" }}).on('click',function(event){

										var noteid = $(this).data('id');
										var button = this;
										var $dialog = $( "#dialog-confirm" );
										$( "#dialog-confirm" ).eq(0).html("<img src='owl-on-coke.png' style='display: inline;vertical-align:middle;'/><span>Deleted notes cannot be recovered. Are you sure?</span>").dialog({
											resizable: false,
											draggable:false,
											height:'auto',
											modal: true,
											position: { my: "left center", at: "right center", of: button },
											buttons: {
												"Yes": function() {
													bkg.oWLStorage.addNote(noteid, null, null, null,"",null,function(result){
														if(result)
														{

															notesTable.fnDeleteRow( nRow );
															chrome.tabs.query({url:"*://apps.facebook.com/*",windowType:"normal"}, function (tabs) {
																$.each(tabs,function(index,tab){																	
																	if (((tab.url.indexOf('lexulous') > -1 && tab.url.indexOf('gid') > -1 )||(tab.url.indexOf('wordscraper') > -1  && tab.url.indexOf('gid') > -1)|| (tab.url.indexOf('ea_scrabble_closed') > -1)|| (tab.url.indexOf('livescrabble') > -1))&&(tab.url.indexOf('apps.facebook.com') > -1)) {
																		chrome.tabs.update(tab.id, {url: tab.url});
																	}
																});
																$dialog.dialog("close");

															});						


														}								       			

													});		
												},
												"No": function() {
													$dialog.dialog( "close" );
												}
											}

										}).dialog("open");


									});


								},
								"aoColumns": [
								              { "sTitle": "Select" },          
								              { "sTitle": "Game" },
								              { "sTitle": "GameId" },            
								              { "sTitle": "Opponent" },		            
								              { "sTitle": "View Note" },
								              { "sTitle": "Date Saved" },
								              { "sTitle": "Delete" }	
								              ],
								              "bJQueryUI": true,
								              "sPaginationType": "full_numbers"

							} );

							$('span.showNote img',notesTable.fnGetNodes()).each(function(){														
								$(this).data('note',notesObj[$(this).data('id')]);
							});

							$('span.showNote img',notesTable.fnGetNodes()).on('click', function () {
								var nTr = $(this).parents('tr')[0];
								if (notesTable.fnIsOpen(nTr) )
								{
									/* This row is already open - close it */
									$(this).removeClass("ui-icon-circle-triangle-s").addClass("ui-icon-circle-triangle-e");
									notesTable.fnClose( nTr );
									
									
								}
								else
								{
									/* Open this row */
									$(this).removeClass("ui-icon-circle-triangle-e").addClass("ui-icon-circle-triangle-s");
									notesTable.fnOpen( nTr, fnFormatDetails(notesTable, nTr), 'details' );
								}
							} );

							currentContent = {};
							$('a.profile',notesTable.fnGetNodes()).each(function(){
								var $link = $(this);
								
								td = $(this).closest('td').get(0);							
								var pos = notesTable.fnGetPosition(td);
								currentContent[pos[0]] = $('<div>').append($link.clone()).html();    
								var graphUrl = "https://graph.facebook.com/" + $link.data('id');
								$.getJSON(graphUrl,function(json){
									notesTable.fnUpdate(currentContent[pos[0]].slice(0,currentContent[pos[0]].length-4) + '<br/><span class="fbname">' + json.name+'</span>' + currentContent[pos[0]].slice(currentContent[pos[0]].length-4),pos[0],3);
								});									
							});

							$("button#deleteAll").show();

						}
						else
						{
							$('#notesContainer').html( 'You have no saved notes' );

						}

					});




				},100);


			}
			else
			{

				$('#notesContainer').html( 'Error retrieving notes' );
			}

		});	
		
	});


	/* Formating function for row details */
	function fnFormatDetails ( oTable, nTr )
	{
		//var aData = oTable.fnGetData( nTr );
		var sOut = '<div style="padding:10px">' + $(nTr).find('span.showNote img').data('note') + '</div>';	     
		return sOut;
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

			});

			$("div#settings input[type=number]").change(function(){		
				var name = $(this).attr('name');
				var newSetting = {};
				newSetting[name] = $(this).val();
				storage.set(newSetting); 

			});	
		}				

	}


	chrome.storage.onChanged.addListener(function(changes, namespace) {

		//Check if settings were deleted and reload if that occurs
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
		
		
		
		


	});
	
	


});
