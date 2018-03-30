/* 项目函数*/

function opennewwindow(url) {
	window.open(url);
}

function htmlspecialchars(string) {
	varcreateDiv = document.createElement("textarea");
	varcreateDiv.innerHTML = string;
	return varcreateDiv.innerHTML;
}

function codereplace(str) {

//	str = str.replace(/\u001b\]m/g, '');
    str = str.replace(/\u001b\[\??\d{0,4}(;\d{0,2}){0,2}(m|H|h|r|l|K|J)/g, '');

    // str = str.replace(/\u001b\[H/g, '');
    // str = str.replace(/\u001b\[2J/g, '');
    // str = str.replace(/\u001b\[K/g, '');
    // str = str.replace(/\u001b\[Kl/g, '');

    str = str.replace(/\u001b\(B/g, '');
    str = str.replace(/\u001b]0;/g, '');
    str = str.replace(/\u001b[\[\](B;0-9]+(B|K|m|;)/g, '');
    str = str.replace(/\u001b(\[|=|>)?/g, '');
    str = str.replace(/\(B/g, '');
    str = str.replace(/\u0007/g, '');
    str = str.replace(/&nbsp;/g, ' ');
    //		str = str.replace(/\n/g, '<br />');
    return str;
}

//function getTermContent(content) {
//	var id = "term-hide-div";
//	Terminal.cursorBlink = false;
//	var term = new Terminal({
//		cols: 80,
//		rows: 5
//	});
//	var sss1 = document.getElementById(id)
//	if(typeof(sss1) == "undefined" || sss1 == null) {
//		$("body").append("<div style=\"display:none;\" id=\"" + id + "\"></div>");
//	}
//	sss1 = document.getElementById(id)
//	$("#" + id).html("");
//	term.open(sss1);
//	term.writeln(content);
//
//	//		console.log(kk[i]);
//
//		return html;
//
//}
//
//function getHtml() {
//	var kk = $("#term-hide-div > .terminal.xterm.xterm-theme-default > .xterm-rows > div");
//	var html = '';
//	for(var i = 0; i < kk.length; i++) {
//		var ggg = $(kk[i]);
//
//		if(ggg.html() == '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;') {
//
//		} else {
//			html += ggg.html() + "\n";
//		}
//
//	}
//	return html;
//}

function getTermContent(content) {
	var id = "term-hide-div";
	Terminal.cursorBlink = false;
	var term = new Terminal({
		cols: 1024,
		rows: 100
	});
	var sss1 = document.getElementById(id)
	if(typeof(sss1) == "undefined" || sss1 == null) {
		$("body").append("<div style=\"display: none;\" id=\"" + id + "\"></div>");
	}
	sss1 = document.getElementById(id)
	$("#" + id).html("");
	term.open(sss1);
	term.writeln(content);
	var kk = $("#" + id + " > .terminal > div").first();
	return($(kk).html())
}