ACC.megafeture = {
  _autoload: [
    'init',
    [ 'animate', $('.js-animate-item').length > 0 ],
  ],
  hoverCarouselConfig: {
    animation: {
      animationDuration: 0.35,
      animationDurationInc: 0.1,
      animationDelay: 0,
      animationDelayInc: 0.25,
    },
    acceleration: 3,
    rotationStartPoint: 25,
  },
  tiltConfig: {
    glare: true,
    maxGlare: .5,
    disableAxis: 'x',
    maxTilt: 5,
    speed: 100
  },
  tiltConfigVanilla: {
    glare: true,
    'max-glare': .5,
    axis: 'x',
    max: 5,
    speed: 100,
    reverse: true
  },
  stickyImageConfig: {
    endStickyScrollAt: $('.js-end-scroll'),
    onScrolled: function () {
      ACC.megafeture.animate();
    },
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
  init: function () {
    var $hoverCarousel = $('.js-hover-carousel');
    var $stickyWrapper = $('.js-sticky-wrapper');
    var tilt;

    ACC.megafeture.binBackTopTop();
    ACC.megafeture.adjustPage(function () {
      enquire.register('screen and (min-width: 1023px)',
        {
          match: function () {
            $hoverCarousel.hoverScrollCarousel(ACC.megafeture.hoverCarouselConfig);
            tilt = document.querySelectorAll('.hover-carousel__tile');
            $(".hover-carousel__tile").tilt(ACC.megafeture.tiltConfig);
            $stickyWrapper.stickyImage(ACC.megafeture.stickyImageConfig);
          },
          unmatch: function () {
            if ($hoverCarousel.data('hoverScrollCarousel')) {
              $hoverCarousel.data('hoverScrollCarousel').destroy();
            }
            if ($stickyWrapper.data('stickyImage')) {
              $stickyWrapper.data('stickyImage').destroy();
            }
            tilt.tilt.destroy.call(tilt);
          }
        });
      $('.js-back-to-home').on('click', function (e) {
        var href = $(this).attr('href');
        e.preventDefault();
        $('.collection-details__slot.left').removeClass('slide-left1').addClass('slide-right1');
        $('.collection-details__slot.right').removeClass('slide-left2').addClass('slide-right2');
        setTimeout(function() {
          window.location = href;
        }, 250);
      });
    });
  },
  adjustPage: function (callback) {
    $('body').addClass('js-hover-carousel-page');
    callback()
  },
  binBackTopTop: function () {
    $('.js-back-to-top').on('click', function () {
      $(window).scrollTop(0);
      $(window).trigger('scroll');
    });
  },
};