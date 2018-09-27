ACC.global = {
  adjustPage: function (callback) {
    $('body').addClass('js-hover-carousel-page');
    if (callback) {
      callback()
    }
  }
};
ACC.hoverCarousel = {
  _autoload: [
    [ 'initHoverCarousel', $('.js-hover-carousel').length > 0 ]
  ],
  hoverCarouselConfig: {
    animation: {
      animationDuration: 0.25,
      animationDurationInc: 0.1,
      animationDelay: 0,
      animationDelayInc: 0.2,
      animationClassName: 'carousel-item-fade-in'
    },
    acceleration: 2,
  },
  initHoverCarousel: function () {
    var $hoverCarousel = $('.js-hover-carousel');
    var tiles = $('.hover-carousel__tile');
    var $list = $('.js-hover-carousel-list');
    var $items = $list.find('>li');

    ACC.global.adjustPage(function () {
      var distanceFromTop = $hoverCarousel.offset().top;
      $hoverCarousel.css({ 'height': 'calc(100vh)' });

      var body = $("html, body");
      $('.js-hover-carousel-list').on('mouseenter.car-list', function() {
        body.stop().animate({ scrollTop: distanceFromTop }, 500, 'swing');
        $('.js-hover-carousel-list').off('mouseenter.car-list');
      });

      tiles.hoverIntent({
        over: function (e) {
          tiles.filter(function (idx, item) {
            return item !== e.currentTarget
          }).addClass('hover-carousel__tile--hovered');

        },
        out: function () {
          tiles.removeClass('hover-carousel__tile--hovered');
        },
        interval: 0,
      });

      enquire.register('screen and (min-width: 1023px)', {
        match: function () {
          $hoverCarousel.hoverScrollCarousel(ACC.hoverCarousel.hoverCarouselConfig);

        },
        unmatch: function () {
          if ($hoverCarousel.data('hoverScrollCarousel')) {
            $hoverCarousel.data('hoverScrollCarousel').destroy();
          }
        }
      });
    });
  },
};

ACC.stickyImagePage = {
  _autoload: [
    [ 'animate', $('.js-animate-item').length > 0 ],
    [ 'initStickyPage', $('.js-sticky-wrapper').length > 0 ],
    [ 'bindOnBeforeUnloadAnimation', $('.js-sticky-wrapper').length > 0 ]
  ],
  stickyImageConfig: {
    endStickyScrollAt: $('.js-end-scroll'),
    onScrolled: function () {
      ACC.stickyImagePage.animate();
    }
  },
  animate: function () {
    var $animateItems = $('.js-animate-item');

    $animateItems.each(function (index, item) {
      var $it = $(item);
      if ($it.visible(true)) {
        $it.addClass('fade-in');
        $it.on('animationend', function () {
          $it.css({ opacity: 1 });
        })
      }
    });
  },
  initStickyPage: function () {
    var $stickyWrapper = $('.js-sticky-wrapper');

    ACC.stickyImagePage.binBackTopTop();
    ACC.global.adjustPage(function () {
      enquire.register('screen and (min-width: 1023px)', {
        match: function () {
          $stickyWrapper.stickyImage(ACC.stickyImagePage.stickyImageConfig);
        },
        unmatch: function () {
          if ($stickyWrapper.data('stickyImage')) {
            $stickyWrapper.data('stickyImage').destroy();
          }
        }
      });
    });
  },
  binBackTopTop: function () {
    $('.js-back-to-top').on('click', function () {
      $(window).scrollTop(0);
      $(window).trigger('scroll');
    });
  },
  bindOnBeforeUnloadAnimation: function () {
    $(document).on('click', '.js-back-to-home', function (e) {
      var href = $(this).attr('href');
      e.preventDefault();

      $('.collection-details__slot.left').removeClass('slide-left1').addClass('slide-right1');
      $('.collection-details__slot.right').removeClass('slide-left2').addClass('slide-right2');
      setTimeout(function () {
        window.location = href;
      }, 200);
    })
  }
};