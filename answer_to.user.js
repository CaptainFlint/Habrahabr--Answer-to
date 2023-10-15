// Habr: Answer to...
// Forked by CaptainFlint and adapted to the new Habr interface
// Original repository:
// https://github.com/Inversion-des/Habrahabr--Answer-to

// ==UserScript==
// @name            Habr: Answer to...
// @description     Shows the comment for which this comment is an answer
// @namespace       Habrahabr
// @version         1.4.0
// @include         https://habr.com/*
// @require         https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @grant           none
// @updateURL       https://github.com/CaptainFlint/Habrahabr--Answer-to/raw/master/answer_to.meta.js
// @downloadURL     https://github.com/CaptainFlint/Habrahabr--Answer-to/raw/master/answer_to.user.js
// @supportURL      https://github.com/CaptainFlint/Habrahabr--Answer-to/issues
// ==/UserScript==


'use strict';

!function(win) {

this.$ = this.jQuery = jQuery.noConflict(true);

if (window != window.top) {
	return;
}
var doc = win.document;

win.addEventListener('load', function() {
	var comments_cont = (doc.getElementsByClassName('tm-article-comments'))[0];
	if (comments_cont) {
		var msgStyle = "\
			background-color: white;\
			padding: 3px 2px 0 5px;\
			position: absolute;\
			z-index: 1;\
			overflow-y: auto;\
			-webkit-box-shadow: 0px 3px 12px 3px rgba(0, 0, 0, 0.3);\
			-moz-box-shadow: 0px 3px 12px 3px rgba(0, 0, 0, 0.3);\
			box-shadow: 0px 3px 12px 3px rgba(0, 0, 0, 0.3);";

		// готовим контейнер для просмотра
		win.msgContainer_cont = doc.createElement('article');
		win.msgContainer_cont.className = 'tm-comment-thread__comment';
		win.msgContainer_cont.innerHTML = '<div class="comment" style="' + msgStyle + '"></div>';
		win.msgContainer_cont.style.cssText = 'position: fixed; top: 0px; left: 0px; display: none; z-index: 199; margin: 0 !important; padding: 0 !important; overflow: visible; text-align: left;';
		doc.body.appendChild(win.msgContainer_cont);
		win.msgContainer = win.msgContainer_cont.firstChild;

 		// прописываем ховер стрелочкам всех комментов
		var arrows = comments_cont.getElementsByClassName('tm-comment__icon');
		$.each(arrows, activateArrow);

		// таймер для активации новых комментариев
//		setInterval(function() {
//			var $ = win.jQuery;
//			if ($) {
//				var newComments = $('.comment .is_new .to_parent');
//				for (var i = 0, li = newComments.length; i < li; i++) {
//					var link = newComments[i];
//					if (link.getAttribute('oninit') != 'activaded') {
//						activateArrow(link);
//						link.setAttribute('oninit', 'activaded');
//					}
//				}
//			}
//		}, 2000);

		// на клик — прячем коммент
		win.addEventListener('mousedown', hideTargetComment, false);

	}   // if comments_cont

}, false);

function activateArrow(index, arrEl) {
	// Get the parent comment
	// First, go up to the current comment's root
	var parents = $(arrEl).parentsUntil('section.tm-comment-thread');
	// Now up to the parent comment's root:
	// section.tm-comment-thread (this element's tree) -> div.tm-comment-thread__children (parent element's children) -> section.tm-comment-thread (parent element's tree)
	var parent_comment = $(parents[parents.length - 1]).parent().parent().parent();
	// Extract the anchor of the parent comment:
	// -> article.tm-comment-thread__comment -> a.tm-comment-thread__target[name="comment_26058422"]
	var anchor = (parent_comment.find('a.tm-comment-thread__target'))[0].getAttribute('name');
	arrEl.addEventListener('mouseover', function(){
		showTargetComment(anchor, arrEl);
	}, false);
	arrEl.addEventListener('mouseout', hideTargetComment, false);
}

function showTargetComment(anchor, arrEl) {
	var target = doc.getElementsByName(anchor)[0].parentNode;

	// чистим контейнер
	while (win.msgContainer.childNodes.length) {
		win.msgContainer.removeChild(win.msgContainer.childNodes[0]);
	}

	// заполняем контейнер новым комментом
	if (target) {
		for (var i = 0, l = target.childNodes.length; i < l; i++) {
			var tmp = target.childNodes[i];
			if (tmp.tagName == 'DIV') {
				var tmpCopy = tmp.cloneNode(true);
				// Hack to get rid of the horizontal scrollbar in the popup
				$(tmpCopy).find('header').css('margin-right', '0');
				win.msgContainer.appendChild(tmpCopy);
			}
		}
	}

	// подгоняем ширину под блок комментариев
	var pageComments_cont = (doc.getElementsByClassName('tm-article-comments'))[0];
	win.msgContainer_cont.style.width = (pageComments_cont.offsetWidth + absLeft(pageComments_cont) + 2) + 'px';


	var targetTop = absTop(target);
	var windowScrollPos = doc.documentElement.scrollTop || doc.body.scrollTop;

	// inline highlight
	win.msgContainer.style.top = (targetTop>windowScrollPos ? (targetTop - windowScrollPos - 3) + 'px' : 0);

	// height auto adjustment
	if (targetTop < windowScrollPos) {
		var currentCommentTop = absTop(arrEl.parentNode.parentNode);
		var targetCommentHeight = target.offsetHeight;
		var delta = (windowScrollPos + targetCommentHeight) - (currentCommentTop - 10);
		win.msgContainer.style.maxHeight = (delta > 0 ? (targetCommentHeight - delta + 'px') : '');
	}
	else {
		win.msgContainer.style.maxHeight = '';
	}

	// показываем
	win.msgContainer.parentNode.style.display = 'block';

	// отступы
	win.msgContainer.style.marginLeft = (absLeft(target) - 5) + 'px';
	win.msgContainer.style.width = (win.msgContainer.parentNode.offsetWidth - parseInt(win.msgContainer.style.marginLeft)) + 'px';
}   // showTargetComment

function hideTargetComment() {
	win.msgContainer.parentNode.style.display = 'none';
}

function absLeft(o) {
	var l = 0;
	do {
		if (o.offsetLeft) {
			l += o.offsetLeft - o.scrollLeft;
		}
	} while (o = o.offsetParent);
	return l;
}
function absTop(o) {
	var l = 0;
	do {
		if (o.offsetTop) {
			l += o.offsetTop - o.scrollTop;
		}
	} while (o = o.offsetParent);
	return l;
}

}((typeof unsafeWindow == 'undefined') ? window : unsafeWindow);
