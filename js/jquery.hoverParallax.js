(function ($, window, document, undefined) {
  var hoverParallax = 'hoverParallax';

  function HoverParallax(element, options) {
    if (!d3) {
      console.warn('Hover Parallax has dependency on d3. Please add it to your project - https://d3js.org/');
      return
    }
    this.defaults = {
      speed: 3500,
      resetOnMouseLeave: false,
    };
    this.options = $.extend({}, this.defaults, options);
    this.$el = $(element);
    this.$scene = $(element).find('.js-scene');
    this.scene = d3.select('.js-scene');
    this.$w = $(window);
    this.init();
  }

  HoverParallax.prototype = {
    init: function () {
      this._getElementSizes();
      this._attachEventListeners();
    },
    destroy: function () {
      this._removeEventListeners();
      this._resetStyles();
    },

    _attachEventListeners: function () {
      var self = this;

      self.$el
        .on('mousemove.hoverParallax', function (e) {
          var tile = $(e.target).parents('.js-hover-carousel-tile');
          if(tile.length) {
            var coordinates = self._getTranslateCoordinates2(self, tile);

            self._updateTranslate(self, coordinates);
          }
        })
        .on('mouseout.hoverParallax', function () {
          if (self.options.resetOnMouseLeave) {
            self._updateTranslate(self);
          }
        });

      self.$w.on('resize.hoverParallax', function () {
        self._getElementSizes();
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
    _getElementSizes: function () {
      var self = this;

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
    _getTranslateCoordinates2: function (self, target) {
      var mouseX = target.offset().left - self.$scene.offset().left;
      var mouseY = target.offset().top - self.$scene.offset().top;
      var mouseXPercent = mouseX * 100 / self.elementWidth;
      var mouseYPercent = mouseY * 100 / self.elementHeight;

      var sceneX = self.sceneWidth * mouseXPercent / 100;
      var sceneY = self.sceneHeight * mouseYPercent / 100;

      if (mouseX > self.maxTranslateX) {
        mouseX = self.maxTranslateX;
      }

      if (mouseY > self.maxTranslateY) {
        mouseY = self.maxTranslateY;
      }

      return {
        x: -mouseX,
        y: -mouseY,
      }
    },
    _getTranslateCoordinates: function (self, mouseEvent) {
      var mouseX = mouseEvent.pageX - self.$el.offset().left;
      var mouseY = mouseEvent.pageY - self.$el.offset().top;
      var mouseXPercent = mouseX * 100 / self.elementWidth;
      var mouseYPercent = mouseY * 100 / self.elementHeight;

      var sceneX = self.sceneWidth * mouseXPercent / 100;
      var sceneY = self.sceneHeight * mouseYPercent / 100;

      if (sceneX > self.maxTranslateX) {
        sceneX = self.maxTranslateX;
      }

      if (sceneY > self.maxTranslateY) {
        sceneY = self.maxTranslateY;
      }

      return {
        x: -sceneX,
        y: -sceneY,
      }
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
      })

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