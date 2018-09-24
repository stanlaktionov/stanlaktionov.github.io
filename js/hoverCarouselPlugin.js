(function ($, window, document, undefined) {
  var hoverScrollCarousel = 'hoverScrollCarousel';

  function HoverScrollCarousel(element, options) {
    this.defaultOptions = {
      acceleration: 2,
      rotationStartPoint: 25
    };
    this.speed = 0;
    this.scroll = 0;
    this.$container = $(element);
    this.options = options || this.defaultOptions;
    this.$carousel = this.$container.find('.js-hover-carousel-list');
    this.$carouselItems = this.$carousel.find('.js-hover-carousel-item');
    this.prevFrame = new Date().getTime();
    this.init();
  }

  HoverScrollCarousel.prototype = {
    _calculateMaxScroll: function () {
      var self = this;

      var listWidth = Array.prototype.reduce.call(self.$carouselItems, function (width, item) {
        width += $(item).outerWidth(true);
        return width;
      }, 0);

      self.containerWidth = self.$container.width();
      self.maxScroll = listWidth - self.$container.outerWidth();
    },
    _attachEventListeners: function () {
      var self = this;
      var acceleration = self.options.acceleration;
      var rotationStartPoint = self.options.rotationStartPoint || self.defaultOptions.rotationStartPoint;
      var rightTrashold = 100 - rotationStartPoint;
      var leftTrashold = rotationStartPoint;


      self.$container
        .on('mousemove', function (e) {
          var mouse_x = e.pageX - self.$container.offset().left;
          var mouseperc = 100 * mouse_x / self.containerWidth;

          if (mouseperc > rightTrashold || mouseperc < leftTrashold) {
            if (mouseperc < leftTrashold) {
              self.speed = (mouseperc - leftTrashold) * acceleration;
            }

            if (mouseperc > rightTrashold) {
              self.speed = (mouseperc - rightTrashold) * acceleration;
            }
          } else {
            self.speed = 0;
          }

        })
        .on('mouseleave', function () {
          self.speed = 0;
        });
      $(window).on('resize', function () {
          self._calculateMaxScroll();
      });
    },
    _removeEventListeners: function () {
      var self = this;
      self.$container.off('mousemove').off('mouseleave');
    },
    _updateScroll: function () {
      var self = this;
      var curFrame = new Date().getTime();
      var timeElapsed = curFrame - self.prevFrame;

      self.prevFrame = curFrame;

      if (self.speed !== 0) {
        self.scroll += self.speed * timeElapsed / 50;

        if (self.scroll < 0) {
          self.scroll = 0;
        }

        if (self.scroll > self.maxScroll) {
          self.scroll = self.maxScroll;
        }

        self.$carousel.css({ 'transform': 'translateX(' + (-self.scroll) + 'px)' });
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

      this.$carouselItems.each(function (idx, item) {
        $(item)
          .css({ 'animation-duration': animationDuration + 's', 'animation-delay': animationDelay + 's' })
          .addClass('appear')
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