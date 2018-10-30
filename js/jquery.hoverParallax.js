(function ($, window, document, undefined) {
  var hoverParallax = 'hoverParallax';

  function HoverParallax(element, options) {
    if (!d3) {
      console.warn('Hover Parallax has dependency on d3. Please add it to your project - https://d3js.org/');
      return;
    }
    this.defaults = {
      speed: 3500,
      resetOnMouseLeave: false,
      scrollPercentageFromEdge: 15,
    };
    this.options = $.extend({}, this.defaults, options);
    this.$el = $(element);
    this.$scene = $(element).find('.js-scene');
    this.scene = d3.select('.js-scene');
    this.$w = $(window);
    this.init();
    this.scrolledX = 0;
    this.scrolledY = 0;
  }

  HoverParallax.prototype = {
    init: function () {
      this._getElementSizes();
      this._defineScrollOffsets();
      this._defineScrollZones();
      this._attachEventListeners();
    },
    destroy: function () {
      this._removeEventListeners();
      this._resetStyles();
    },
    _getOnElemCoordinates: function (elem, e) {
      var y = e.pageY - elem.offset().top;
      var x = e.pageX - elem.offset().left;

      return {
        y: y,
        x: x,
      };
    },
    _countScrolledPercentage: function (mouse, self, axis) {
      var param = axis === 'x' ? 'elementWidth' : 'elementHeight';
      var restWithoutOffset = self[ param ] - self.scrollOffset[ axis ];

      return (mouse[ axis ] - restWithoutOffset) * 100 / self.scrollOffset[ axis ];
    },
    _countScrolledPercentageReversed: function (mouse, self, axis) {
      return (100 * mouse[ axis ]) / self.scrollOffset[ axis ];
    },
    _updateScrollElements: function (self, e, scrollZone, mouseDirection, mouseCoords) {
      var scrolledX = self.scrolledX;
      var scrolledY = self.scrolledY;

      if (scrollZone.horizontalZone === 'left' && /left/g.test(mouseDirection)) {
        scrolledX = self._countScrolledPercentageReversed(mouseCoords, self, 'x');

        if (scrolledX < self.scrolledX) {
          self.scrolledX = scrolledX;
        }
      }

      if (scrollZone.verticalZone === 'top' && /top/g.test(mouseDirection)) {
        scrolledY = self._countScrolledPercentageReversed(mouseCoords, self, 'y');

        if (scrolledY < self.scrolledY) {
          self.scrolledY = scrolledY;
        }
      }

      if (scrollZone.horizontalZone === 'right' && /right/g.test(mouseDirection)) {
        scrolledX = self._countScrolledPercentage(mouseCoords, self, 'x');

        if (scrolledX > self.scrolledX) {
          self.scrolledX = scrolledX;
        }
      }

      if (scrollZone.verticalZone === 'bottom' && /bottom/g.test(mouseDirection)) {
        scrolledY = self._countScrolledPercentage(mouseCoords, self, 'y');

        if (scrolledY > self.scrolledY) {
          self.scrolledY = scrolledY;
        }
      }

      var coordinates = self._getTranslateCoordinatesRev(self, {
        mouseXPercent: self.scrolledX,
        mouseYPercent: self.scrolledY
      });
      self._updateTranslate(self, coordinates);
    },
    _preventPageFromScrolling: function (e, self, preventScrolling) {
      var deltaY = e.originalEvent.deltaY;
      var deltaX = e.originalEvent.deltaX;

      if(preventScrolling) {
        var direction;
        if(deltaY !== 0) {
          direction = deltaY > 0 ? 'bottom' : 'top';
        }

        if(deltaX !== 0) {
          direction = deltaX > 0 ? 'right' : 'left';
        }

        if(direction === 'bottom' && self.scrolledY <= 99 && self.$w.scrollTop() > self.$el.offset().top) {
          e.originalEvent.preventDefault();
        } else if(direction === 'top' && self.scrolledY >= 1 && self.$w.scrollTop() < self.$el.offset().top) {
          e.originalEvent.preventDefault();
        }

        if(direction === 'left' && self.scrolledX >= 1 ) {
          e.originalEvent.preventDefault();
        } else if(direction === 'right' && self.scrolledX <= 99) {
          e.originalEvent.preventDefault();
        }
      }
    },
    _attachEventListeners: function () {
      var self = this;
      var detecMouseDirection = self._detectMouseDirection();
      var detecScrollZones = self._detectScrollZones();
      var preventScrolling = false;
      self.$el
        .on('mouseenter.hoverParallax', function () {
          preventScrolling = true;
        })
        .on('mousemove.hoverParallax', function (e) {
          var mouseCoords = self._getOnElemCoordinates(self.$el, e);
          var mouseDirection = detecMouseDirection(e);
          var scrollZone = detecScrollZones(mouseCoords);
          preventScrolling = true;
          //TODO: Refactor this switch case
          self._updateScrollElements(self, e, scrollZone, mouseDirection, mouseCoords);
        })
        .on('mouseout.hoverParallax', function () {
          preventScrolling = false;
          if (self.options.resetOnMouseLeave) {
            self._updateTranslate(self);
          }
        });
      self.$w.on('wheel.hoverParallax', function (e) {
        self._preventPageFromScrolling(e, self, preventScrolling);
        self._updateScrollOnWheel(e, self);

        var coordinates = self._getTranslateCoordinatesRev(self, {
          mouseXPercent: self.scrolledX,
          mouseYPercent: self.scrolledY
        });

        self._updateTranslate(self, coordinates);
      });

      self.$w.on('resize.hoverParallax', function () {
        self._getElementSizes();
        self._defineScrollOffsets();
        self._defineScrollZones();
      });
      this._onVideoLoaded(self._getElementSizes.bind(self));
      this._onImagesLoaded(self._getElementSizes.bind(self));

    },

    _removeEventListeners: function () {
      var self = this;

      self.$el
        .off('mousemove.hoverParallax')
        .off('mouseout.hoverParallax');
      self.$w.off('resize.hoverParallax');
    },
    _detectMouseDirection: function () {
      var oldX = 0;
      var oldY = 0;

      return function (mouseEvent) {
        var directionX = '';
        var directionY = '';
        var diffX = 0;
        var diffY = 0;

        if (mouseEvent.pageX < oldX) {
          directionX = 'left';
          diffX = oldX - mouseEvent.pageX;
        } else if (mouseEvent.pageX > oldX) {
          directionX = 'right';
          diffX = mouseEvent.pageX - oldX;
        }

        if (mouseEvent.pageY < oldY) {
          directionY = 'top';
          diffY = oldY - mouseEvent.pageY;
        } else if (mouseEvent.pageY > oldY) {
          directionY = 'bottom';
          diffY = mouseEvent.pageY - oldY;
        }

        oldX = mouseEvent.pageX;
        oldY = mouseEvent.pageY;

        return directionX + directionY;
      };
    },
    _defineScrollZones: function () {
      var self = this;
      var topScrollZone = self.elementHeight / 100 * self.options.scrollPercentageFromEdge;
      var bottomScrollZone = self.elementHeight - topScrollZone;
      var leftScrollZone = self.elementWidth / 100 * self.options.scrollPercentageFromEdge;
      var rightScrollZone = self.elementWidth - leftScrollZone;

      self.scrollZones = {
        topScrollZone: topScrollZone,
        bottomScrollZone: bottomScrollZone,
        leftScrollZone: leftScrollZone,
        rightScrollZone: rightScrollZone
      };
    },
    _defineScrollOffsets: function () {
      var self = this;

      self.scrollOffset = {};

      self.scrollOffset.y = self.elementHeight / 100 * self.options.scrollPercentageFromEdge;
      self.scrollOffset.x = self.elementWidth / 100 * self.options.scrollPercentageFromEdge;
    },
    _detectScrollZones: function () {
      var self = this;
      var scrollZones = self.scrollZones;

      return function (mouse) {
        var horizontalZone;
        var verticalZone;

        if (mouse.y < scrollZones.topScrollZone) {
          verticalZone = 'top';
        }

        if (mouse.y > scrollZones.bottomScrollZone) {
          verticalZone = 'bottom';
        }

        if (mouse.x < scrollZones.leftScrollZone) {
          horizontalZone = 'left';
        }

        if (mouse.x > scrollZones.rightScrollZone) {
          horizontalZone = 'right';
        }

        return {
          horizontalZone: horizontalZone,
          verticalZone: verticalZone,
        };
      };
    },
    _getElementSizes: function () {
      var self = this;

      self.elementTop = self.$el.offset().top;
      self.elementWidth = self.$el.width();
      self.elementHeight = self.$el.height();
      self.sceneWidth = self.$scene[ 0 ].scrollWidth;
      self.sceneHeight = self.$scene.height();
      self.maxTranslateX = self.sceneWidth - self.elementWidth;
      self.maxTranslateY = self.sceneHeight - self.elementHeight;

    },
    _updateTranslate: function (self, coordinates) {
      var defaults = {
        x: 0,
        y: 0
      };
      var updateValues = coordinates || defaults;
      var translate = 'translate(' + updateValues.x + 'px, ' + updateValues.y + 'px)';

      self.scene
        .transition()
        .ease(d3.easePolyOut)
        .duration(self.options.speed)
        .style('transform', translate);
    },
    _updateScrollOnWheel: function (e, self) {
      var deltaY = e.originalEvent.deltaY;
      var deltaX = e.originalEvent.deltaX;

      if (deltaY > 5) {
        if (self.scrolledY >= 100) {
          self.scrolledY = 100;
        } else {
          self.scrolledY += 2;
        }
      } else if (deltaY < -5) {
        if (self.scrolledY <= 0) {
          self.scrolledY = 0;
        } else {
          self.scrolledY -= 2;
        }
      }

      if (deltaX > 5) {
        if (self.scrolledX > 100) {
          self.scrolledX = 100;
        } else {
          self.scrolledX += 2;
        }
      } else if (deltaX < -5) {
        if (self.scrolledX <= 0) {
          self.scrolledX = 0;
        } else {
          self.scrolledX -= 2;
        }
      }
    },
    _getTranslateCoordinatesRev: function (self, mouseValues) {
      var sceneX = self.maxTranslateX * mouseValues.mouseXPercent / 100;
      var sceneY = self.maxTranslateY * mouseValues.mouseYPercent / 100;

      return {
        x: -sceneX,
        y: -sceneY,
      };
    },
    _resetStyles: function () {
      var self = this;
      self.$scene.css({ 'transform': '' });
    },
    _onVideoLoaded: function (cb) {
      var self = this;
      var videos = self.$el.find('video');

      videos.one('loadedmetadata', function () {
        if (cb) {
          cb();
        }
      });

    },
    _onImagesLoaded: function (cb) {
      var self = this;
      var img = self.$el.find('img');
      img.one('load', function () {
        if (cb) {
          cb();
        }
      });
    }
  };

  $.fn[ hoverParallax ] = function (options) {
    if (!$(this).length) {
      console.warn('Hover Parallax: Unable to find menu DOM element. Maybe a typo?');
      return;
    }

    var instance = new HoverParallax($(this), options);

    $(this).data(hoverParallax, instance);

    return instance;
  };
})($, window, document);