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
  initializeTilesHover: function () {
    var tiles = $('.hover-carousel__tile');

    tiles.hoverIntent({
      over: function (e) {
        tiles.filter(function (idx, item) {
          return item !== e.currentTarget
        }).addClass('hover-carousel__tile--hovered');

      },
      out: function () {
        tiles.removeClass('hover-carousel__tile--hovered');
      },
      interval: 0
    });
  },
  initDesktopHoverCarousel: function ($hoverCarousel) {
    enquire.register('screen and (min-width: 1023px)', {
      match: function () {
        var height = 'calc(100vh - ' + $hoverCarousel.offset().top + 'px)';
        // var height = '100vh';

        $hoverCarousel.css({ 'height': height });
        $hoverCarousel.hoverParallax();
        ACC.hoverCarousel.initializeTilesHover();
      },
      unmatch: function () {
        if ($hoverCarousel.data('hoverParallax')) {
          $hoverCarousel.data('hoverParallax').destroy();
          $hoverCarousel.off('mouseenter.car-list');
        }
        $hoverCarousel.css({ 'height': 'auto' });
      }
    });
  },
  initMobileHoverCarousel: function($hoverCarousel) {
    enquire.register('screen and (max-width: 1023px)', {
      match: function () {
        var top = $hoverCarousel.offset().top;
        var hasScrolledTop = false;
        var hasScrolledBottom = false;
        var initialScroll = 0;
        $hoverCarousel.on('scroll.initMobileHoverCarousel', function () {
          var currentScroll = $hoverCarousel.scrollTop();

          if(currentScroll === 0) {
            hasScrolledTop = false;
          }

          if(currentScroll + $hoverCarousel.height() === $hoverCarousel[ 0 ].scrollHeight) {
            hasScrolledBottom = false;
          }

          if (initialScroll > currentScroll) {
            if(!hasScrolledBottom) {
              $('html, body').animate({ scrollTop: top }, 1500);
              hasScrolledBottom = true;
            }
          } else {
            if (!hasScrolledTop) {
              $('html, body').animate({ scrollTop: top }, 500);
              hasScrolledTop = true;
            }
          }

          initialScroll = currentScroll;
        });
      },
      unmatch: function() {
        $hoverCarousel.off('scroll.initMobileHoverCarousel');
      }
    });
  },
  initHoverCarousel: function () {
    ACC.global.adjustPage(function () {
      var $hoverCarousel = $('.js-hover-carousel');
      ACC.hoverCarousel.initDesktopHoverCarousel($hoverCarousel);
      ACC.hoverCarousel.initMobileHoverCarousel($hoverCarousel);
      ACC.hoverCarousel.animate();
    });
  },
  animate: function () {
    var $carouselItems = $('.js-hover-carousel-item');
    var animationDuration = 0.35;
    var animationDelay = 0.1;
    var animationDurationInc = 0;
    var animationDelayInc = 0.25;

    $carouselItems.each(function (idx, item) {
      $(item)
        .css({ 'animation-duration': animationDuration + 's', 'animation-delay': animationDelay + 's' })
        .addClass('carousel-item-fade-in')
        .on('animationend', function () {
          $(item).css({ 'opacity': 1 });
        });

      animationDuration += animationDurationInc;
      animationDelay += animationDelayInc;
    });
  }
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