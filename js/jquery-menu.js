(function ($) {
	var classes = {
		popup_div: 'menu',
		separator: 'separator',
		hover: 'hover',
		disabled: 'disabled'
	},
		defaults = {
			menu: null,
			mouse_button: 'right',
			is_menu: true,
			min_width: 120,
			max_width: 0,
			delay: 500,
			keyboard: true,
			hover_intent: true,
			on_select: function (item) {
			},
			on_load: function () {
			},
			on_show: function () {
			},
			on_hide: function () {
			}
		},
		menus = [],
		methods = {
			init: function (options) {
				options = $.extend({}, defaults, options);
				if (!options.menu) {
					return false;
				}
				var $menu;
				if ((typeof (options.menu) === 'object') && (options.menu.constructor.toString().match(/array/i) !== null || options.menu.length)) {
					$menu = $('<div/>').append(build(options.menu));
					$('body').append($menu);
					$menu.data('menuDynamic', true);
				} else {
					$menu = $(document.getElementById(options.menu));
					$menu.data('menuDynamic', false);
					$menu.data('menuOriginal', $menu.clone());
				}
				return this.each(function () {
					var $this = $(this);
					var event_namespace;
					if (!$this.data('menu')) {
						event_namespace = "menuContext-" + (new Date().getTime());
						$this.data('menuEventNamespace', event_namespace).data('menuOptions', options).data('menu', $menu).data('menuEnable', true);
						$menu.data('is_menu', options.is_menu);
						if (!$menu.data('menuOwners')) {
							$menu.data('menuOwners', []);
						}
						$menu.data('menuOwners').push($this);
						menus.push($menu);
						if (options.is_menu) {
							methods.refresh.call($this);
						} else {
							$menu.hide();
							$menu.css({
								'position': 'absolute',
								'z-index': 99999
							});
						}
						$this.bind((((options.mouse_button === 'right') ? 'contextmenu' : 'click') + '.' + event_namespace), function (e) {
							if (!$this.data('menuEnable')) {
								return true;
							}
							methods.show.apply($this, [e.pageX, e.pageY, options.show_animation]);
							if (options.is_menu && options.keyboard) {
								$(window).bind('keydown.' + event_namespace, function (even) {
									var $currentItem;
									switch (event.keyCode) {
										case 27:
											$(document).trigger('click.' + event_namespace);
											break;
										case 40:
											if ($menu.find('li.' + classes.hover).length === 0) {
												$menu.find('li:not(.disabled):first').addClass(classes.hover);
											} else {
												$currentItem = $menu.find('li.' + classes.hover + ':last');
												$currentItem.parent().find('li.' + classes.hover).removeClass(classes.hover).nextAll('li:not(.disabled)').eq(0).addClass(classes.hover);
												if ($currentItem.parent().find('li.' + classes.hover).length === 0) {
													$currentItem.parent().find('li:not(.disabled):first').addClass(classes.hover);
												}
											}
											return false;
										case 38:
											if ($menu.find('li.' + classes.hover).length === 0) {
												$menu.find('li:not(.disabled):first').nextAll().eq(-1).addClass(classes.hover);
											} else {
												$currentItem = $menu.find('li.' + classes.hover + ':last');
												$currentItem.parent().find('li.' + classes.hover).removeClass(classes.hover).prevAll('li:not(.disabled)').eq(0).addClass(classes.hover);
												if ($currentItem.parent().find('li.' + classes.hover).length === 0) {
													$currentItem.parent().find('li:first').nextAll().eq(-1).addClass(classes.hover);
												}
											}
											return false;
										case 39:
											if ($menu.find('li.' + classes.hover + ' ul').length > 0) {
												$menu.find('li.' + classes.hover + ':last').find('ul:first').show().offset(force_viewport({
													top: $menu.find('li.' + classes.hover + ':last').offset().top
												}, $menu.find('li.' + classes.hover + ':last').find('ul:first')));
												$menu.find('li.' + classes.hover + ':last ul:first li:not(.disabled):first').addClass(classes.hover);
											}
											return false;
										case 37:
											if (!$menu.find('li.' + classes.hover + ':last').parent().parent().hasClass(classes.popup_div)) {
												$menu.find('li.' + classes.hover + ':last').removeClass(classes.hover).parent().hide();
											}
											return false;
									}
									return true;
								});
							} else {
								if (options.keyboard) {
									$(window).bind('keydown.' + event_namespace, function (even) {
										if (event.keyCode === 27) {
											$(document).trigger('click.' + event_namespace);
										}
									});
								}
							}
							$('li', $menu).each(function () {
								$(this).click(function () {
									if (!$(this).hasClass(classes.disabled)) {
										options.on_select.call(this, {
											id: $(this).attr('id'),
											action: $('a:first', this).attr('href').substr(1)
										});
									}
								});
							});
							$(document).bind('click.' + event_namespace, function (e) {
								$(window).unbind('keydown.' + event_namespace);
								$(document).unbind('click.' + event_namespace);
								$('li', $menu).unbind('click');
								methods.hide.call();
							});
							options.on_show.call(this);
							return false;
						});
					}
					options.on_load.call(this);
				});
			},
			refresh: function (options) {
				var opts;
				return this.each(function () {
					var $this = $(this);
					var $menu = $this.data('menu');
					var calculated_width;
					var $width_test;
					if ($this.data('menu').data('is_menu')) {
						opts = $.extend($this.data('menuOptions'), options);
						if (opts.hover_intent && !$.fn.hoverIntent) {
							opts.hover_intent = false;
						}
						$menu.removeClass(classes.popup_div);
						$('li', $menu).removeClass(classes.hover);
						$('span', $menu).remove();
						$menu.addClass(classes.popup_div);
						$width_test = $('<div/>').addClass(classes.popup_div).appendTo('body');
						$('ul', $menu).each(function () {
							$width_test.html('');
							calculated_width = 0;
							$width_test.html($(this).html());
							calculated_width = $width_test.width() + 16;
							if (calculated_width < opts.min_width) {
								calculated_width = opts.min_width;
							}
							if (calculated_width > opts.max_width && opts.max_width > 0) {
								calculated_width = opts.max_width;
							}
							$(this).width(calculated_width);
							$(this).children('li').children('ul').css('left', calculated_width);
						});
						$width_test.remove();
						$('li:has(ul)', $menu).each(function () {
							if (!$(this).hasClass(classes.disabled)) {
								$('a:first', this).append($('<span/>'));
								if (opts.hover_intent) {
									$(this).hoverIntent({
										over: function () {
											$('ul:first', this).show().offset(force_viewport({
												top: $(this).offset().top
											}, $('ul:first', this)));
										},
										out: function () {
											$('ul:first', this).hide();
										},
										timeout: opts.delay
									});
								} else {
									$(this).hover(function () {
										$('ul:first', this).show().offset(force_viewport({
											top: $(this).offset().top
										}, $(this).find('ul:first')));
									}, function () {
										$('ul:first', this).hide();
									});
								}
							}
						});
						$('li', $menu).each(function () {
							$(this).click(function () {
								if ($('ul', this).length < 1) {
									$('li', $menu).unbind('click');
									$menu.hide();
								}
								return false;
							});
							$(this).hover(function () {
								$(this).parent().find('li.' + classes.hover).removeClass(classes.hover);
								$(this).addClass(classes.hover);
							}, function () {
								$(this).removeClass(classes.hover);
							});
						});
					}
				});
			},
			restore: function () {
				return this.each(function () {
					var $this = $(this), $menu = $this.data('menu');
					$this.unbind('.' + $this.data('menuEventNamespace'));
					$(window).unbind('keydown.' + $this.data('menuEventNamespace'));
					$(document).unbind('click.' + $this.data('menuEventNamespace'));
					$.each($menu.data('menuOwners'), function (index) {
						if ($this[0] === this) {
							$menu.data('menuOwners').splice(index, 1);
						}
					});
					if ($menu.data('menuOwners').length < 1) {
						$.each(menus, function (index) {
							if ($menu[0] === this) {
								menus.splice(index, 1);
							}
						});
						if ($menu.data('menuDynamic')) {
							$menu.remove();
						} else {
							$menu.removeClass(classes.popup_div);
							$menu.replaceWith($menu.data('menuOriginal'));
						}
					}
					$this.removeData('menuEventNamespace');
					$this.removeData('menu');
					$this.removeData('menuOptions');
					$this.removeData('menuEnable');
				});
			},
			show: function (x, y) {
				if (!x || !y) {
					return false;
				}
				var $menu = $(this).first().data('menu');
				methods.hide.apply(this);
				$menu.show();
				$menu.data('menu', $(this));
				$menu.offset(force_viewport({
					top: y,
					left: x
				}, $menu, true));
				return this;
			},
			hide: function () {
				$.each(menus, function () {
					$('.' + classes.hover, this).removeClass(classes.hover);
					$('ul:first ul', this).hide();
					if ($(this).data('menu')) {
						$(this).data('menu').data('menuOptions').on_hide.call($(this).data('menu'));
						$(this).removeData('menu');
					}
					$(this).hide();
				});
				return this;
			},
			disable: function (item) {
				if (item) {
					var $menu = $(this).data('menu');
					if (item.charAt(0) === '#') {
						$('li' + item.replace(/ /g, '_'), $menu).addClass(classes.disabled);
					} else {
						$('a[href="' + item + '"]', $menu).parent().addClass(classes.disabled);
					}
				} else {
					$(this).data('menuEnable', false);
				}
				return this;
			},
			enable: function (item) {
				if (item) {
					var $menu = $(this).data('menu');
					if (item.charAt(0) === '#') {
						$('li' + item.replace(/ /g, '_'), $menu).removeClass(classes.disabled);
					} else {
						$('a[href="' + item + '"]', $menu).parent().removeClass(classes.disabled);
					}
				} else {
					$(this).data('menuEnable', true);
					$('li', this).each(function () {
						$(this).removeClass(classes.disabled);
					});
				}
				return this;
			}
		},
		force_viewport = function (position, o, mouse) {
			if (position.top) {
				if ((position.top + o.height() - $(window).scrollTop()) > $(window).height()) {
					if (mouse) {
						position.top = position.top - o.height();
					} else {
						position.top = $(window).height() + $(window).scrollTop() - o.height();
					}
				}
				if (position.top < $(window).scrollTop()) {
					position.top = $(window).scrollTop();
				}
			}
			if (position.left) {
				if ((position.left + o.width() - $(window).scrollLeft() > $(window).width())) {
					position.left = $(window).width() - o.width() + $(window).scrollLeft();
				}
				if (position.left < $(window).scrollLeft()) {
					position.left = $(window).scrollLeft();
				}
			}
			return position;
		},
		build = function (children) {
			var ul = $('<ul/>'), entry, item, li;
			if (children) {
				for (entry in children) {
					item = children[entry];
					li = $('<li/>').attr('id', item.id.replace(/ /g, '_')).append($('<a/>').attr('href', item.action ? ('#' + item.action) : '#').text(item.text));
					if (item.image) {
						li.prepend($('<img/>').attr('src', item.image));
					}
					if (item.separator) {
						li.addClass(classes.separator);
					}
					ul.append(li);
					if (item.children) {
						li.append(build(item.children));
					}
				}
			}
			return ul;
		};
	$.fn.menu = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			return this;
		}
	};
})(jQuery);


