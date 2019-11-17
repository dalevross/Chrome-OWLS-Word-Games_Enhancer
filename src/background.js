//Copyright (c) 2011 The Chromium Authors. All rights reserved.
//Use of this source code is governed by a BSD-style license that can be
//found in the LICENSE file.

var currentUrl = "about:blank";
var updateAvailable = false;
var updateVersion = ""; 
//Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
	// If the letter 'g' is found in the tab's URL...
	if (((tab.url.indexOf('lexulous') > -1 && tab.url.indexOf('gid') > -1 )||(tab.url.indexOf('wordscraper') > -1  && tab.url.indexOf('gid') > -1)|| (tab.url.indexOf('ea_scrabble_closed') > -1)|| (tab.url.indexOf('livescrabble') > -1))&&(tab.url.indexOf('apps.facebook.com') > -1)) {
		// ... show the page action.
		if(tab.url.indexOf('scrabble') == -1)
		{
			var game = tab.url.match(/(lexulous|wordscraper)/g);
			var gid = /gid=(\d+)/g.exec(tab.url);

			oWLStorage.openDB(function(result){
				if(result)
				{
					setTimeout(function(){
						oWLStorage.getNoteByGameAndId(game[0],gid[1],function(note){
							var icon;
							if($.trim(note)!="")
							{
								icon = "icon-19-notes.png";

							}
							else
							{
								icon = "icon-19.png";									
							}

							chrome.pageAction.setIcon({tabId: tabId, path:icon});
							chrome.pageAction.show(tabId);


						});
					},100);				

				}
				else
				{
					chrome.pageAction.setIcon({tabId: tabId, path:"icon-19.png"});	
					chrome.pageAction.show(tabId);				

				}
			});		

		}
		else
		{
			chrome.pageAction.show(tabId);		
		}

	}
	else
	{
		chrome.pageAction.hide(tabId);
	}
};

chrome.pageAction.onClicked.addListener(function(tab) {
	currentUrl = tab.url;
});



//Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);

var oWLStorage =  {

		DB_NAME : 'owlswgedb',
		DB_VERSION : 3,
		DB_NOTES_STORE_NAME : 'notes',
		DB_GCG_STORE_NAME : 'gcg',
		db : {},


		openDB : function(callback)  {
			var req = indexedDB.open(oWLStorage.DB_NAME, oWLStorage.DB_VERSION);
			req.onsuccess = function (evt) {

				oWLStorage.db = this.result;
				//console.log("Open Succeeded");
				callback(true);

			};
			req.onerror = function (evt) {
				console.error("openDb:", evt.target.errorCode);
				callback(false);
			};

			req.onupgradeneeded = function (evt) {
				//console.log("openDb.onupgradeneeded");
				oWLStorage.db = evt.currentTarget.result;

				if (evt.oldVersion < 1) {
					var notes_store = evt.currentTarget.result.createObjectStore(

							oWLStorage.DB_NOTES_STORE_NAME, { keyPath: 'id', autoIncrement: true });

					notes_store.createIndex('recordid', 'recordid', { unique: true });
					notes_store.createIndex('profileid', 'profileid', { unique: false});
					notes_store.createIndex('game', 'game', { unique: false});
					notes_store.createIndex('gameid', 'gameid', { unique: false });
					notes_store.createIndex('opponent', 'opponent', { unique: false });
					notes_store.createIndex('savedDate', 'savedDate', { unique: false });

					var gcg_store = evt.currentTarget.result.createObjectStore(
							oWLStorage.DB_GCG_STORE_NAME, { keyPath: 'id', autoIncrement: true });

					gcg_store.createIndex('recordid', 'recordid', { unique: true });
					gcg_store.createIndex('profileid', 'profileid', { unique: false});
					gcg_store.createIndex('game', 'game', { unique: false});
					gcg_store.createIndex('gameid', 'gameid', { unique: false });
					gcg_store.createIndex('opponent', 'opponent', { unique: false });
					gcg_store.createIndex('savedDate', 'savedDate', { unique: false });
				}
				if (evt.oldVersion < 2) {
					// Version 2 introduces a new index of notes by year.
					var notes_store = req.transaction.objectStore(oWLStorage.DB_NOTES_STORE_NAME);
					notes_store.createIndex("game_gid", ["game","gameid"],{ unique: false });
				}
				if (evt.oldVersion < 3) {
					// Version 3 removes the need for a separate datastore from game info.
					evt.currentTarget.result.deleteObjectStore(oWLStorage.DB_GCG_STORE_NAME);					
				}

				callback(true);

			};
		},

		/**
		 * @param {string}
		 *            store_name
		 * @param {string}
		 *            mode either "readonly" or "readwrite"
		 */
		getObjectStore : function (store_name, mode) {
			var tx = oWLStorage.db.transaction(store_name, mode);
			return tx.objectStore(store_name);
		},

		clearObjectStore: function (store_name,callback) {
			var store = oWLStorage.getObjectStore(store_name, 'readwrite');
			var req = store.clear();
			req.onsuccess = function(evt) {
				callback(true);      
			};
			req.onerror = function (evt) {
				console.error("clearObjectStore:", evt.target.errorCode);
				callback(false);
			};
		},
		
		deletAllNotes:function(callback){
			oWLStorage.clearObjectStore(oWLStorage.DB_NOTES_STORE_NAME,function(result){
				callback(result);		
			});			
		},

		getNote: function (key, store, success_callback) {
			var req = store.get(key);
			req.onsuccess = function(evt) {
				var value = evt.target.result;
				if (value)
					success_callback(value.note);
			};
		},

		

		/**
		 * @param {string}
		 *            recordid
		 * @param {string}
		 *            profileid
		 * @param {string}
		 *            game
		 * @param {string}
		 *            gameid
		 * @param {string}
		 *            note
		 * @param {string}
		 *            opponent
		 * @param {function}
		 *            callback
		 */
		addNote: function (recordid, profile, game, gameid,note,opponent, callback) {

			var now = new Date();

			var obj = {recordid:recordid, profile:profile, game:game, gameid:gameid,note:note,opponent:opponent,savedDate:now};

			var store = oWLStorage.getObjectStore(oWLStorage.DB_NOTES_STORE_NAME, 'readwrite');
			var req = store.index('recordid');
			var getReq = req.get(recordid);
			getReq.onsuccess = function(evt) {
				var record = evt.target.result;
				var putReq;
				try {
					if (typeof evt.target.result == 'undefined') {
						if((note!="")&&(note!="<br>"))
						{
							putReq = store.put(obj);	
						}
					}
					else
					{
						if((note!="")&&(note!="<br>"))
						{
							record.note = note;	
							record.savedDate = now;
							putReq = store.put(record);	
						}
						else
						{							
							putReq = store.delete(record.id);							
						}
					}

				} catch (e) {
					callback(false);					
				}
				putReq.onsuccess = function (evt) {
					callback(true);

				};
				putReq.onerror = function() {
					console.error("addNote error", this.error);
					callback(false);
				};
			};
			getReq.onerror = function() {
				console.error("addNote error", this.error);
				callback(false);
			};

		},


	
		/**
		 * @param {string}
		 *            recordid
		 * @param {string}
		 *            store_name
		 */
		deleteRecordFromStore: function (recordid,store_name) {
			var store = oWLStorage.getObjectStore(store_name, 'readwrite');
			var req = store.index('recordid');
			req.get(recordid).onsuccess = function(evt) {
				if (typeof evt.target.result == 'undefined') {
					oWLStorage.displayActionFailure("No matching record found");
					return;
				}
				deleteRecord(evt.target.result.id, store,store_name);
			};
			req.onerror = function (evt) {
				oWLStorage.displayActionFailure("Error Code: " + evt.target.errorCode);
			};
		},



		/**
		 * @param {number}
		 *            key
		 * @param {IDBObjectStore=}
		 *            store
		 * @param {string}
		 *            store_name
		 */
		deleteRecord : function (key, store,store_name) {
			//console.log("deletePublication:", arguments);

			if (typeof store == 'undefined')
				store = oWLStoragegetObjectStore(store_name, 'readwrite');

			// As per spec
			// http://www.w3.org/TR/IndexedDB/#object-store-deletion-operation
			// the result of the Object Store Deletion Operation algorithm is
			// undefined, so it's not possible to know if some records were
			// actually
			// deleted by looking at the request result.
			var req = store.get(key);
			req.onsuccess = function(evt) {
				var record = evt.target.result;
				//console.log("record:", record);
				if (typeof record == 'undefined') {
					oWLStorage.displayActionFailure("No matching record found");
					return;
				}
				// Warning: The exact same key used for creation needs to be
				// passed for
				// the deletion. If the key was a Number for creation, then it
				// needs to
				// be a Number for deletion.
				req = store.delete(key);
				req.onsuccess = function(evt) {
					oWLStorage.displayActionSuccess("Deletion successful");					
				};
				req.onerror = function (evt) {
					console.error("deleteRecord:", evt.target.errorCode);
				};
			};
			req.onerror = function (evt) {
				console.error("deleteRecord:", evt.target.errorCode);
			};
		},

		/**
		 * @param {string}
		 *            recordid
		 */
		getNoteByRecordId : function (recordid,callback) {
			var store = oWLStorage.getObjectStore(oWLStorage.DB_NOTES_STORE_NAME, 'readwrite');
			var req = store.index('recordid');
			var getReq = req.get(recordid);
			getReq.onsuccess = function(evt) {
				if (typeof evt.target.result == 'undefined') {
					oWLStorage.displayActionFailure("No matching record found");
					callback("");
					return;
				}
				else
				{
					var note = evt.target.result.note;
					callback(note);
				}

			};
			getReq.onerror = function (evt) {
				console.error("getNoteByRecordId:", evt.target.errorCode);
				callback("");
			};
		},
		
		getAllNotes : function (callback) {
			var store = oWLStorage.getObjectStore(oWLStorage.DB_NOTES_STORE_NAME, 'readwrite');
			var allrecords = new Array();
			var getReq = store.openCursor();
			
			getReq.onsuccess = function(evt) {
				
				var cursor = evt.target.result;
				if(cursor)
				{
					
					req = store.get(cursor.key);
			        req.onsuccess = function (evt) {
			          var record = evt.target.result;
			          allrecords.push({recordid:record.recordid,profile:record.profile,opponent:record.opponent,
			        	  game:record.game,gameid:record.gameid,savedDate:record.savedDate,note:record.note});
			          
			        };
			        
			        cursor.continue();
				}
				else 
				{
					callback(allrecords);
					return;
			    }
			};
			getReq.onerror = function (evt) {
				callback(allrecords);
			};
		},

		getNoteByGameAndId : function (game,gameid,callback) {
			var store = oWLStorage.getObjectStore(oWLStorage.DB_NOTES_STORE_NAME, 'readwrite');
			var req = store.index('game_gid');
			var getReq = req.get([game,gameid]);
			getReq.onsuccess = function(evt) {
				if (typeof evt.target.result == 'undefined') {
					oWLStorage.displayActionFailure("No matching record found");
					callback("");
					return;
				}
				else
				{
					var note = evt.target.result.note;
					callback(note);
				}

			};
			getReq.onerror = function (evt) {
				console.error("getNoteByGameAndId:", evt.target.errorCode);
				callback("");
			};
		},
		
		updateNoteIndicatorByGameAndId : function (game,gameid,tabId) {
			oWLStorage.openDB(function(result){
				if(result)
				{
					setTimeout(function(){
						oWLStorage.getNoteByGameAndId(game,gameid,function(note){
							var icon;
							if($.trim(note)!="")
							{
								icon = "icon-19-notes.png";

							}
							else
							{
								icon = "icon-19.png";									
							}

							chrome.pageAction.setIcon({tabId: tabId, path:icon});
							
						});
					},100);				

				}
				else
				{
					chrome.pageAction.setIcon({tabId: tabId, path:"icon-19.png"});	
					
				}
			});		

		},


		displayActionSuccess: function (msg) {
			msg = typeof msg != 'undefined' ? "Success: " + msg : "Success";
			// $('#msg').html('<span class="action-success">' + msg +
			// '</span>');
			//console.log(msg);
		},

		displayActionFailure: function (msg) {
			msg = typeof msg != 'undefined' ? "Failure: " + msg : "Failure";
			// $('#msg').html('<span class="action-failure">' + msg +
			// '</span>');
			//console.log(msg);
		}		
}

chrome.commands.onCommand.addListener(function(command) {
	    if (command == 'clear-settings')
	    {
	      //var settings = ["allTiles", "allTilesLimit", "distinguishVowels", "notesFirst", "owlhoot-1", "showTotals", "showValues", "useAllTilesLimit","clickToSubmit","showGrid"];
	      //chrome.storage.sync.remove(settings);
	    	chrome.storage.sync.clear();
	    }
	   
	});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.command == 'checknotes')
	{
		var recid = request.pid + '_' + request.game + '_'+ request.gameid;

		oWLStorage.openDB(function(result){
			if(result)
			{
				setTimeout(function(){
					oWLStorage.getNoteByRecordId(recid,function(note){
						var hasnotes;
						var icon;
						if($.trim(note)!="")
						{
							hasnotes = true;
							icon = "icon-19-notes.png";

						}
						else
						{
							hasnotes = false;
							icon = "icon-19.png";									
						}

						chrome.pageAction.setIcon({tabId: sender.tab.id, path:icon});
						sendResponse({hasnotes:hasnotes,notes:note});
						return true;				

					});
				},100);				

			}
			else
			{
				chrome.pageAction.setIcon({tabId: sender.tab.id, path:"icon-19.png"});
				sendResponse({hasnotes:false});
				return true;
			}



		});	
		
		return true;
		
	}
	return true;
	
});


chrome.runtime.onUpdateAvailable.addListener(function(details) {
	var updateAvailable = true;
	var updateVersion = details.version;
});

chrome.runtime.onInstalled.addListener(function(details) {
	
	chrome.tabs.query({url:"*://apps.facebook.com/*",windowType:"normal"}, function (tabs) {
		$.each(tabs,function(index,tab){
			if (((tab.url.indexOf('lexulous') > -1 && tab.url.indexOf('gid') > -1 )||(tab.url.indexOf('wordscraper') > -1  && tab.url.indexOf('gid') > -1)|| (tab.url.indexOf('ea_scrabble_closed') > -1)|| (tab.url.indexOf('livescrabble') > -1))&&(tab.url.indexOf('apps.facebook.com') > -1)) {
				chrome.tabs.update(tab.id, {url: tab.url});
			}
		});		
	});

});






