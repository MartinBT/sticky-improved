// StickyJS Plugin for jQuery
// =============
// Author: Sebastian Dawidziak <sebastian@dawidziak.eu>
// Created: 6/20/2014

(function($) {
	"use strict";

	var defaults = {
			zIndex: null,
			stopper: '.sticky-stopper',
			topSpacing: 0,
			bottomSpacing: 0,
			className: 'is-sticky',
			wrapperClassName: 'sticky-wrapper',
			center: false,
			getWidthFrom: null,
			minWidthToStick: 640,
			checkHeight: false,
			disableInitWidth: false
		},
		$window = $(window),
		$document = $(document),
		sticked = [],
		windowHeight = $window.height(),
		scroller = function() {
			placer();
		},
		
		placer = function() {
			
			var scrollTop = $window.scrollTop(),
				documentHeight = $document.height(),
				dwh = documentHeight - windowHeight,
				extra = (scrollTop > dwh) ? dwh - scrollTop : 0,
				o = $.extend(defaults);

			for (var i = 0; i < sticked.length; i++) {
				var s = sticked[i],
					elementTop = s.stickyWrapper.offset().top,
					etse = elementTop - s.topSpacing - extra,
					newStop = s.stopper != null ? $(s.stopper).position().top + $(s.stopper).height() : null,
					newBottom = s.stickyElement.offset().top - s.stickyElement.height(),
					isStop = s.stopper != null ? ((scrollTop - newStop) + (scrollTop - newBottom) + s.topSpacing > 0) : false;
					
					var innerWidth = $('body').innerWidth();
					
				if (scrollTop <= etse || innerWidth < s.minWidthToStick) {
					if (s.currentTop !== null) {
						s.stickyElement
							.css('position', '')
							.css('top', '');
						s.stickyElement.parent().css('height','').css('width','').removeClass(s.className);
						s.currentTop = null;
						if (s.checkHeight === true)
						{
							s.stickyElement.css('width', '');
						}
					} else if (s.currentTop === null && s.checkHeight === true) {
						s.stickyElement
							.css('position', '')
							.css('top', '');
						s.stickyElement.parent().css('height','').css('width','').removeClass(s.className);
					}
				} else {
					
					if (s.checkHeight === false){
						var newTop = documentHeight - s.stickyElement.outerHeight() - s.topSpacing - s.bottomSpacing - scrollTop - extra;
						if (newTop == 0) {
							newTop = newTop + s.topSpacing;
						} else if (isStop) {
							newTop = (newStop - scrollTop) - s.stickyElement.height() + s.topSpacing;
						} else {
							newTop = s.topSpacing;
						}
						if (s.currentTop != newTop) {
							if (typeof s.getWidthFrom !== 'undefined') {
								s.stickyElement.css('width', $(s.getWidthFrom).width());
							}

							s.stickyElement
								.css('position', 'fixed')
								.css('top', newTop);

							s.stickyElement.parent().addClass(s.className);
							s.currentTop = newTop;
							
							scroller();
						}
					} else if (s.checkHeight === true && $(s.stopper).height() > s.stickyElement.height()){
						var newTop = documentHeight - s.stickyElement.outerHeight() - s.topSpacing - s.bottomSpacing - scrollTop - extra;
						if (newTop == 0) {
							newTop = newTop + s.topSpacing;
						} else if (isStop) {
							newTop = (newStop - scrollTop) - s.stickyElement.height() + s.topSpacing;
						} else {
							newTop = s.topSpacing;
						}
						if (s.currentTop != newTop) {
							if (typeof s.getWidthFrom !== 'undefined') {
								s.stickyElement.css('width', $(s.getWidthFrom).width());
							}

							s.stickyElement
								.css('position', 'fixed')
								.css('top', newTop);

							s.stickyElement.parent().addClass(s.className);
							s.currentTop = newTop;
							
							scroller();
						}
					}
				}
			}
		},
		resizer = function() {
			windowHeight = $window.height();
			placer();
		},
		methods = {
			init: function(options) {
				var o = $.extend(defaults, options);
				return this.each(function() {
					var stickyElement = $(this);

					var stickyId = stickyElement.attr('id');
					var wrapper = $('<div></div>')
						.attr('id', stickyId + '-sticky-wrapper')
						.addClass(o.wrapperClassName);
					stickyElement.wrapAll(wrapper);

					if (o.center) {
						stickyElement.parent().css({
							width: wrapper.outerWidth(),
							marginLeft: "auto",
							marginRight: "auto"
						});
					}
					
					if (!o.disableInitWidth){
						stickyElement.parent().css({
							width: stickyElement.outerWidth(),
						});
					}

					if (stickyElement.css("float") == "right") {
						stickyElement.css({
							"float": "none"
						}).parent().css({
							"float": "right"
						});
					}

					var stickyWrapper = stickyElement.parent();
					stickyWrapper.css('height', stickyElement.outerHeight());
					sticked.push({
						zIndex: o.zIndex,
						stopper: o.stopper,
						topSpacing: o.topSpacing,
						bottomSpacing: o.bottomSpacing,
						stickyElement: stickyElement,
						currentTop: null,
						stickyWrapper: stickyWrapper,
						className: o.className,
						getWidthFrom: o.getWidthFrom,
						minWidthToStick: o.minWidthToStick,
						checkHeight: o.checkHeight,
						disableInitWidth: o.disableInitWidth
					});
				});
			},
			update: scroller,
			unstick: function(options) {
				return this.each(function() {
					var unstickyElement = $(this);

					var removeIdx = -1;
					for (var i = 0; i < sticked.length; i++) {
						if (sticked[i].stickyElement.get(0) == unstickyElement.get(0)) {
							removeIdx = i;
						}
					}
					if (removeIdx != -1) {
						sticked.splice(removeIdx, 1);
						unstickyElement.unwrap();
						unstickyElement.removeAttr('style');
					}
				});
			}
		};



	if (window.addEventListener) {
		window.addEventListener('scroll', scroller, false);
		window.addEventListener('resize', resizer, false);
	} else if (window.attachEvent) {
		window.attachEvent('onscroll', scroller);
		window.attachEvent('onresize', resizer);
	}

	$.fn.sticky = function(method) {
		if (methods[method]) return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		else if (typeof method === 'object' || !method) return methods.init.apply(this, arguments);
		else $.error('Method ' + method + ' does not exist on StickyJS');
	};

	$.fn.unstick = function(method) {
		if (methods[method]) return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		else if (typeof method === 'object' || !method) return methods.unstick.apply(this, arguments);
		else $.error('Method ' + method + ' does not exist on StickyJS');
	};
	$(function() {
		setTimeout(scroller, 0);
	});
})(jQuery);