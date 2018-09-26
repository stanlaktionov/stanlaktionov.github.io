(function ($, window, document, undefined) {
  var hoverScrollCarousel = 'hoverScrollCarousel';

  function HoverScrollCarousel(element, options) {
    this.defaultOptions = {
      acceleration: 2,
      rotationStartPoint: 25,
      vertRotationStartPoint: 25,
    };
    this.horSpeed = 0;
    this.vertSpeed = 0;
    this.horScroll = 0;
    this.vertScroll = 0;
    this.$container = $(element);
    this.options = options || this.defaultOptions;
    this.$carousel = this.$container.find('.js-hover-carousel-list');
    this.$carouselItems = this.$carousel.find('.js-hover-carousel-item');
    this.prevFrame = new Date().getTime();
    this.leftThreshold = this.options.rotationStartPoint || this.defaultOptions.rotationStartPoint;
    this.rightThreshold = 100 - this.leftThreshold;
    this.topThreshold = this.options.vertRotationStartPoint || this.defaultOptions.vertRotationStartPoint;
    this.bottomThreshold = 100 - this.topThreshold;
    this.init();
  }

  HoverScrollCarousel.prototype = {
    _calculateMaxScroll: function () {
      var self = this;

      var listWidth = Array.prototype.reduce.call(self.$carouselItems, function (width, item) {
        width += $(item).outerWidth(true);
        return width;
      }, 0);
      var itemsHeight = Array.prototype.map.call(this.$carouselItems, function(item){
        var height = 0;
        var children = $(item).children();

        children.each(function(idx, child) {
          height += $(child).outerHeight();
        });

        return height;
      });

      self.containerWidth = self.$container.width();
      self.containerHeight = self.$container.height();
      self.maxHorScroll = listWidth - self.$container.outerWidth();
      self.maxVertScroll = Math.max.apply(null, itemsHeight) - self.$container.outerHeight() + parseInt(self.$container.css('marginBottom'));
    },
    _attachEventListeners: function () {
      var self = this;
      self.$container
        .on('mousemove', function (e) {
          var mouse_x = e.pageX - self.$container.offset().left;
          var mouse_y = e.pageY - self.$container.offset().top;

          self._updateXSpeed(self, mouse_x);
          self._updateYSpeed(self, mouse_y);
        })
        .on('mouseleave', function () {
          self.vertSpeed = 0;
          self.horSpeed = 0;
        });
      $(window).on('resize', function () {
        self._calculateMaxScroll();
      });
    },
    _removeEventListeners: function () {
      var self = this;
      self.$container.off('mousemove').off('mouseleave');
    },
    _updateXSpeed: function (self, mouseX) {
      var mouseperc = 100 * mouseX / self.containerWidth;
      if (mouseperc > self.rightThreshold || mouseperc < self.leftThreshold) {
        if (mouseperc < self.leftThreshold) {
          self.horSpeed = (mouseperc - self.leftThreshold) * self.options.acceleration;
        }

        if (mouseperc > self.rightThreshold) {
          self.horSpeed = (mouseperc - self.rightThreshold) * self.options.acceleration;
        }
      } else {
        self.horSpeed = 0;
      }
    },
    _updateYSpeed: function (self, mouseY) {
      var mouseperc = 100 * mouseY / self.containerHeight;

      if (mouseperc > self.bottomThreshold || mouseperc < self.topThreshold) {
        if (mouseperc < self.topThreshold) {
          self.vertSpeed = (mouseperc - self.topThreshold) * self.options.acceleration;
        }

        if (mouseperc > self.bottomThreshold) {
          self.vertSpeed = (mouseperc - self.bottomThreshold) * self.options.acceleration;
        }
      } else {
        self.vertSpeed = 0;
      }
    },
    _updateScroll: function () {
      var self = this;
      var curFrame = new Date().getTime();
      var timeElapsed = curFrame - self.prevFrame;

      self.prevFrame = curFrame;

      if (self.horSpeed !== 0 || self.vertSpeed !== 0) {
        self.horScroll += self.horSpeed * timeElapsed / 50;
        self.vertScroll += self.vertSpeed * timeElapsed / 50;

        if (self.horScroll < 0) {
          self.horScroll = 0;
        }

        if (self.vertScroll < 0) {
          self.vertScroll = 0;
        }

        if (self.horScroll > self.maxHorScroll) {
          self.horScroll = self.maxHorScroll;
        }
        if (self.vertScroll > self.maxVertScroll) {
          self.vertScroll = self.maxVertScroll;
        }
        var translate = 'translate(' + (-self.horScroll) + 'px,' + (-self.vertScroll) + 'px)';
        self.$carousel.css({ 'transform': translate });
      }

      window.requestAnimationFrame(self._updateScroll.bind(self));
    },
    _resetScroll: function () {
      var self = this;
      self.$carousel.css({ 'transform': '' });
    },
    _animate: function () {
      var animationDuration = this.options.animation.animationDuration;
      var animationDelay = this.options.animation.animationDelay;
      var animationDurationInc = this.options.animation.animationDurationInc;
      var animationDelayInc = this.options.animation.animationDelayInc;
      var animationClassName = this.options.animation.animationClassName;

      this.$carouselItems.each(function (idx, item) {
        $(item)
          .css({ 'animation-duration': animationDuration + 's', 'animation-delay': animationDelay + 's' })
          .addClass(animationClassName)
          .on('animationend', function () {
            $(item).css({ 'opacity': 1 });
          });

        animationDuration += animationDurationInc;
        animationDelay += animationDelayInc;
      });
    },
    init: function () {
      this._calculateMaxScroll();
      this._attachEventListeners();
      window.requestAnimationFrame(this._updateScroll.bind(this));

      if (this.options.animation) {
        this._animate();
      }
    },
    destroy: function () {
      this._removeEventListeners();
      this._resetScroll();
      this.$container.removeData();
    },
  };

  $.fn[ hoverScrollCarousel ] = function (options) {
    if (!$(this).length) {
      console.warn('Slide Menu: Unable to find menu DOM element. Maybe a typo?');
      return;
    }

    var instance = new HoverScrollCarousel($(this), options);

    $(this).data(hoverScrollCarousel, instance);

    return instance;
  };
})($, window, document);