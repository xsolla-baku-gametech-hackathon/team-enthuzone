mergeInto(LibraryManager.library, {
  IsMobileWebGL: function () {
    var ua = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();

    // iPadOS masaüstü UA düzeltmesi
    var isIPadOS = /macintosh/.test(ua) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;

    var isTablet =
      /ipad|tablet|playbook|silk/.test(ua) ||
      isIPadOS;

    var isPhone =
      /android.+mobile|iphone|ipod|iemobile|blackberry|opera mini|mobile/.test(ua);

    var isMobile = (isPhone || isTablet);

    // Ek sağlamlaştırma: dokunmatik + dar ekran
    if (!isMobile) {
      var touch = !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
      var narrow = Math.min(window.innerWidth, window.innerHeight) <= 600; // Gerekirse ayarla
      if (touch && narrow) isMobile = true;
    }

    return isMobile ? 1 : 0;
  }
});
