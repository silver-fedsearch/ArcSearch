/*
 * The MIT License
 * 
 * Copyright (c) 2012 MetaBroadcast
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software 
 * is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */
var rest = require('restler');
var util = require('util');
var SearchResults = require('../modules/SearchResults');
var SearchResult = require('../modules/SearchResult');

var ArcSearch = function(q, config, fn) {
	this.q = q;
	this.fn = fn; // callback function
	this.config = config;
};

ArcSearch.prototype.run = function() {
	var options = {"username" : this.config.username, "password": this.config.password};
	var url = "http://dlfsearch.arcstaging.co.uk/DLFSearch.svc/SearchBooks?q=" + this.q;

	var o = this;
	var request;
	
	request = rest.get(url, options);
	
	var arc_timeout = setTimeout(function () {
		request.abort("timeout");
	}, this.config.timeout);
	
	request.on('complete', function(data) {
		clearTimeout(arc_timeout);
		var resultnum = 0;
		if (data.results) {
			for ( var i in data.results) {
				var content = data.results[i];
				var result = new SearchResult();
				result.addId(content.ids[0].scheme, content.ids[0].key);
				result.title = content.title;
				result.thumbnail_url = content.thumbnail_url ? content.thumbnail_url : "";
				result.source = "arc";
				result.type = content.type;
				o.fn(result, false);
				resultnum++;
				if (resultnum > o.config.limit) {
					break;
				}
			}
		} else {
			util.log("arc: Cannot understand response");
			util.log(data);
			util.log("=====");
		}
		o.fn("arc", true);
	});
};

module.exports = ArcSearch;