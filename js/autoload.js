function autoload() {
  $.each(ACC, function (section, obj) {
    if ($.isArray(obj._autoload)) {
      $.each(obj._autoload, function (key, value) {
        if ($.isArray(value)) {
          if (value[1]) {
            ACC[section][value[0]]();
          } else {
            if (value[2]) {
              ACC[section][value[2]]();
            }
          }
        } else {
          ACC[section][value]();
        }
      });
    }
  });
}

$(function () {
  autoload();
});
