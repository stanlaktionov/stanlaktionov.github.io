(function ($, window, document, undefined) {
  var stickyImage = 'stickyImage';
  function StickyImage(element, options) {
    this.$w = $(window);
    this.windowHeight = this.$w.outerHeight();
    this.$scrollContainer = $(element);
    this.options = options;
    this.$stickyImage = this.$scrollContainer.find('.js-sticky-image');
    this.$endStickyScrollElement = options.endStickyScrollAt;
    this.distanceFromTop = this.$scrollContainer.offset().top;
    this.init();
  }

  StickyImage.prototype = {
    init: function () {
      this._attachEventListeners();
    },
    destroy: function () {
      this._removeEventListeners()
    },
    _attachEventListeners: function () {
      var self = this;
      self._windowScrollEventHandler();
    },
    _removeEventListeners: function () {
      var self = this;

      self.$w.off('scroll.stickyImage');
    },
    _windowScrollEventHandler: function () {
      var self = this;
      function windowScrollHandler() {
        var scrollTop = this.$w.scrollTop();
        var endStickyScrollAt = this.$endStickyScrollElement.offset().top;

        if (scrollTop > this.distanceFromTop) {
          this.$stickyImage.addClass('fixed-image');
          if (scrollTop + this.windowHeight > endStickyScrollAt) {
            this.$stickyImage.removeClass('fixed-image').addClass('bottom-image');
          } else {
            this.$stickyImage.addClass('fixed-image').removeClass('bottom-image');
          }
        } else {
          this.$stickyImage.removeClass('fixed-image bottom-image');
        }

        if (this.options.onScrolled) {
          this.options.onScrolled();
        }
      }

      self.$w.on('scroll.stickyImage', windowScrollHandler.bind(self));
    }
  };

  $.fn[ stickyImage ] = function (options) {
    if (!$(this).length) {
      console.warn('Slide Menu: Unable to find menu DOM element. Maybe a typo?');
      return;
    }

    var instance = new StickyImage($(this), options);

    $(this).data(stickyImage, instance);

    return instance;
  };
})($, window, document);