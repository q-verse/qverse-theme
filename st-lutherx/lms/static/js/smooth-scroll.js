$(window).load(function(e) {
    e.preventDefault();
    var navItem = $('.jumto-nav-item');
    if (navItem.length) {
        $('.jumto-nav-item').on('click', function(e) {
            e.preventDefault();
            var scrollElement = $(this).attr('href');
            $('html, body').animate({
                scrollTop: $(scrollElement).offset().top - 100
            }, 1000);
        });
    }
});

if (window.matchMedia('(min-width: 992px)').matches) {
    $(function() {
        var stickySidebar = function() {
            var windowScrollTop = $(window).scrollTop();
            var stickyCallPoint = $('.tabpanel-row');
            if (stickyCallPoint.length) {
                var stickyCallPointTop = stickyCallPoint.offset().top - 40;
                var sidebarNav = $('.jumpto-nav');
                if (windowScrollTop > stickyCallPointTop && sidebarNav.is(':visible')) {
                    sidebarNav.css({ position: 'fixed', top: '100px' });
                } else {
                    sidebarNav.css({ position: 'relative', top: '' });
                }
            }
        };
        $(window).scroll(stickySidebar); stickySidebar();
    });
}
