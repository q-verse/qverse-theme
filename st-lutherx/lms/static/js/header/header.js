/**
 * Ensuring collapsible and accessible components on multiple
 * screen sizes for the responsive lms header.
*/

$(window).on('load', function () {
    // show preloader until page content is loaded
    $('#window-wrap').fadeIn(function() {
        $('#preload').fadeOut();
    });

    // Reset nav menu cookie on login
    $(document).find('.login-button').on('click', function () {
        edlyUpdateWpMenuCookie();
    });

    $(document).find('.edx-link li').find('a').click(function() {
        if (this.href.indexOf('logout') !== -1) {
            edlyUpdateWpMenuCookie();
        }
    });

    // hide the notification and set the id in cookie.
    $(document).on('click', '.close_services_notification', function(event) {
        $(this).parent().hide();
        // eslint-disable-next-line camelcase
        let notificationId = $(this).data('notification-id');
        let notifications = getCookie('services_notifications_status') || {};

        if ($.isEmptyObject(notifications) === false) {
            notifications = JSON.parse(notifications);
        }

        notifications = Object.assign(notifications, { [notificationId]: false });
        setServicesNotificationsCookie('services_notifications_status', JSON.stringify(notifications));
    });
    let navURL = $('body').attr('data-services-notifications-url');
    if (navURL !== '' && navURL !== '#' && navURL !== undefined) {
        edlySetupServicesNotifications();
    }
    edlySetupZendeskWidget();
    edlySetupWPFooter();
});

function getCookie(name) {
    /**
     * Get cookie by name.
     */
    let cookieName = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return cookieName ? cookieName[2] : null;
}

function setServicesNotificationsCookie(name, value, targetDate) {
    /**
     * Clear or Update Edly Services Notifications Cookie
     */
    let expires = '';

    if (targetDate !== undefined) {
        expires = 'expires=' + targetDate;
    }

    let servicesCookieDomain = $('body').attr('data-session-cookie-domain');
    document.cookie = name + '=' + value + '; ' + expires + '; domain=' + servicesCookieDomain + '; path=/;';
}

function edlySetupServicesNotifications() {
    /**
    * Set Edly Services Notifications
    */

    let notifications = getCookie('services_notifications');
    let notificationsStatus = getCookie('services_notifications_status') || {};
    let notificationsDailyStatus = getCookie('services_notifications_daily_status');
    if ($.isEmptyObject(notificationsStatus) === false) {
        notificationsStatus = JSON.parse(notificationsStatus);
    }

    if (notifications && notificationsDailyStatus) {
        notifications = JSON.parse(notifications);

        let notificationsHTML = '';
        $.each(notifications, function(index, notification) {
            if (notification.id in notificationsStatus && notificationsStatus[notification.id] === false) {
                return;
            }
            notificationsHTML += getServicesNotificationHTML(notification);
        });

        $('#services_notifications').html(notificationsHTML);
    } else {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                let response = JSON.parse(this.responseText);
                let date = new Date();
                let notificationsHTML = '';
                notifications = response['results'];
                notificationsStatus = {};

                let servicesCookieExpiry = $('body').attr('data-services-notifications-cookie-expiry');

                if (servicesCookieExpiry) {
                    servicesCookieExpiry = date.setTime(date.getTime() + (servicesCookieExpiry * 1000));
                } else {
                    servicesCookieExpiry = date.setTime(date.getTime() + (180 * 1000)); // default 3 min cookie refresh
                }
                let expiryDate = new Date(servicesCookieExpiry);
                setServicesNotificationsCookie('services_notifications', JSON.stringify(notifications), expiryDate.toUTCString());

                $.each(notifications, function(index, notification) {
                    if (notification.id in notificationsStatus) {
                        return;
                    }
                    notificationsStatus[notification.id.toString()] = true;
                    notificationsHTML += getServicesNotificationHTML(notification);
                });

                if (!notificationsDailyStatus) {
                    let midnight = new Date();
                    midnight.setHours(23, 59, 59, 0);
                    setServicesNotificationsCookie('services_notifications_daily_status', true, midnight.toUTCString());
                    setServicesNotificationsCookie('services_notifications_status', JSON.stringify(notificationsStatus));
                }

                $('#services_notifications').html(notificationsHTML);
            }
        };

        let navURL = $('body').attr('data-services-notifications-url');
        if (navURL !== '' && navURL !== '#' && navURL !== undefined) {
            request.open('GET', navURL);
            request.withCredentials = true;
            request.send();
        }
    }
}

function getServicesNotificationHTML(notification) {
    let notificationsHTML = '';
    if (notification.type === 'maintenance') {
        let startTime = new Date(notification.start_time).toUTCString();
        let endTime = new Date(notification.end_time).toUTCString();
        notificationsHTML += "<div class='alert alert-info'>" + notification.message +
          '.<strong> The service will be unavailable from ' + startTime + ' to ' + endTime +
          "</strong><span class='alert-link close_services_notification' data-notification-id='" +
          notification.id + "'>Dismiss <i class='fa fa-times aria-hidden='true'></i></span></div>";
    } else {
        notificationsHTML += "<div class='alert alert-" + ((notification.type === 'alert') ? 'danger' : 'warning') + "'>" + notification.message +
                            "<span class='alert-link close_services_notification' data-notification-id='" +
                            notification.id + "'>Dismiss <i class='fa fa-times aria-hidden='true'></i></span></div>";
    }

    return notificationsHTML;
}

function edlyUpdateWpMenuCookie(targetDate, value) {
    /**
     * Clear or Update Edly WordPress Menu Cookie
     */
    let date = new Date();
    let expires = 'expires=';
    let edlyWpMenu = '';

    if (value !== undefined) {
        edlyWpMenu = value;
    }

    // create edly_wp_menu cookie and set nav menu at it's value
    if (targetDate === undefined) {
        targetDate = date.getDate() - 1;
    }
    date.setDate(targetDate);
    expires += date.toUTCString();
    document.cookie = 'edly_wp_menu=' + edlyWpMenu + '; ' + expires + '; domain=.edly.io; path=/;';
}

function edlySetupNavMenu() {
    /**
    * Set Edly WordPress Menu Cookie
    */
    let edlyWpMenuCookie = document.cookie.replace(/(?:(?:^|.*;\s*)edly_wp_menu\s*=\s*([^;]*).*$)|^.*$/, '$1');

    if (edlyWpMenuCookie !== '') {
        // if cookie exist update nav menu
        edlyWpMenuCookie = decodeURIComponent(edlyWpMenuCookie).replace(/\+/g, ' ');
        $('#edly-nav-menu').html(edlyWpMenuCookie);
        edlyNavFocus();
    } else {
        // if cookie doesn't exist fetch nav menu from word-press
        let request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                // parse word-press json response
                let edlyWpMenu = JSON.parse(this.responseText);
                edlyWpMenu = decodeURIComponent(edlyWpMenu).replace(/\\/g, '');

                if (window.location.href.indexOf('login') > -1 || window.location.href.indexOf('register') > -1 || window.location.href.indexOf('password_reset_confirm')) {
                    edlyUpdateWpMenuCookie();
                } else if (edlyWpMenu !== '') {
                    // create edly_wp_menu cookie and set nav menu at it's value
                    let date = new Date();
                    edlyUpdateWpMenuCookie(date.getDate() + 1, encodeURIComponent(edlyWpMenu));
                }

                // update nav menu
                $('#edly-nav-menu').html(edlyWpMenu);
                edlyNavFocus();
            }
        };

        let navURL = $('body').attr('data-nav-menu-url');

        if (navURL !== '' && navURL !== '#') {
            request.open('GET', navURL);
            request.withCredentials = true;
            request.send();
        }
    }
}

function createMobileMenu() {
    /**
     * Dynamically create a mobile menu from all specified mobile links
     * on the page.
     */
    'use strict';
    $('.mobile-nav-item').each(function() {
        var mobileNavItem = $(this).clone().addClass('mobile-nav-link');
        mobileNavItem.removeAttr('role');
        mobileNavItem.find('a').attr('role', 'menuitem');
        // xss-lint: disable=javascript-jquery-append
        $('.mobile-menu').append(mobileNavItem);
    });
}

function makeAnimatedHeader() {
    /**
     * Dynamically add scrolling effect on header of the pages.
     */
    'use strict';
    let documentWindow = $(window);
    let scroll = documentWindow.scrollTop();
    let headerHeight = $('.global-header').outerHeight();
    $('body').css('padding-top', headerHeight);

    documentWindow.scroll(function() {
        let scrolled = documentWindow.scrollTop();

        if (scrolled > headerHeight) {
            $('.global-header').addClass('off-canvas');
        } else {
            $('.global-header').removeClass('off-canvas');
        }

        if (scrolled > scroll) {
            $('.global-header').removeClass('fixed');
        } else {
            $('.global-header').addClass('fixed');
        }
        scroll = documentWindow.scrollTop();
    });
}

function edlySetupZendeskWidget() {
    /**
    * Set Edly Zendesk Widget Cookie
    */
    let zendeskWidgetCookie = document.cookie.replace(/(?:(?:^|.*;\s*)edly_zendesk_widget\s*=\s*([^;]*).*$)|^.*$/, '$1');

    if (zendeskWidgetCookie !== '') {
        let zendeskWidgetScript = document.createElement('script');
        zendeskWidgetScript.setAttribute('id', 'ze-snippet');
        zendeskWidgetScript.setAttribute('src', zendeskWidgetCookie);
        $('#edly-zendesk-widget').html(zendeskWidgetScript);
    } else {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                $('#edly-zendesk-widget').html(JSON.parse(this.responseText));
                let edlyZendeskWidgetCode = $('#ze-snippet').attr('src');
                document.cookie = 'edly_zendesk_widget=' + edlyZendeskWidgetCode + '; domain=.edly.io; path=/;';
            }
        };

        let zendeskWidgetURL = $('body').attr('data-zendesk-widget-url');
        if (zendeskWidgetURL !== '' && zendeskWidgetURL !== '#') {
            request.open('GET', zendeskWidgetURL);
            request.withCredentials = true;
            request.send();
        }
    }
}

function edlySetupWPFooter() {
    let edlyWPFooterURL = $('body').attr('data-footer-url');
    if (edlyWPFooterURL !== '' && edlyWPFooterURL !== '#') {
        let footerLoader = $('.wrapper-footer .loading');
        footerLoader.show();
        let request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                $('.wrapper.wrapper-footer').html(JSON.parse(this.responseText)).find('.container').toggleClass('container grid-container');
            }
        };

        request.open('GET', edlyWPFooterURL);
        request.withCredentials = true;
        request.send();
    }
}

function edlyNavFocus() {
    var container, links, menu, i, len;
    container = document.getElementById('edly-nav-menu');
    menu = container.getElementsByTagName('ul')[0];
    if (menu.className.indexOf('nav-menu') === -1) {
        menu.className += ' nav-menu';
    }

    // Get all the link elements within the menu.
    links = menu.getElementsByTagName('a');
    // Each time a menu link is focused or blurred, toggle focus.
    for (i = 0, len = links.length; i < len; i++) {
        links[i].addEventListener('focus', toggleFocus, true);
        links[i].addEventListener('blur', toggleFocus, true);
    }
}

function toggleFocus() {
    /**
     * Sets or removes .focus class on an element.
     */
    var self = this;

    // Move up through the ancestors of the current link until we hit .nav-menu.
    while (self.className.indexOf('nav-menu') === -1) {
        // On li elements toggle the class .focus.
        if (self.tagName.toLowerCase() === 'li') {
            if (self.className.indexOf('focus') !== -1) {
                self.className = self.className.replace(' focus', '');
            } else {
                self.className += ' focus';
            }
        }

        self = self.parentElement;
    }
}

$(document).ready(function() {
    'use strict';
    var $hamburgerMenu;
    var $mobileMenu;
    var $mobileMainMenu;
    // Toggling visibility for the user dropdown
    $('.global-header .toggle-user-dropdown, .global-header .toggle-user-dropdown span').click(function(e) {
        var $dropdownMenu = $('.global-header .nav-item .dropdown-user-menu');
        var $userDropdown = $('.global-header .toggle-user-dropdown');
        if ($dropdownMenu.is(':visible')) {
            $dropdownMenu.addClass('hidden');
            $userDropdown.attr('aria-expanded', 'false');
        } else {
            $dropdownMenu.removeClass('hidden');
            $dropdownMenu.find('.dropdown-item')[0].focus();
            $userDropdown.attr('aria-expanded', 'true');
        }
        $('.global-header .toggle-user-dropdown').toggleClass('open');
        e.stopPropagation();
    });

    // Hide user dropdown on click away
    if ($('.global-header .nav-item .dropdown-user-menu').length) {
        $(window).click(function(e) {
            var $dropdownMenu = $('.global-header .nav-item .dropdown-user-menu');
            var $userDropdown = $('.global-header .toggle-user-dropdown');
            if ($userDropdown.is(':visible') && !$(e.target).is('.dropdown-item, .toggle-user-dropdown')) {
                $dropdownMenu.addClass('hidden');
                $userDropdown.attr('aria-expanded', 'false');
            }
        });
    }

    // Toggling menu visibility with the hamburger menu
    $('.global-header .hamburger-menu').click(function() {
        $hamburgerMenu = $('.global-header .hamburger-menu');
        $mobileMenu = $('.mobile-menu');
        $mobileMainMenu = $('.main-navigation');
        if ($mobileMenu.is(':visible')) {
            $mobileMenu.addClass('hidden');
            $hamburgerMenu.attr('aria-expanded', 'false');
        } else {
            $mobileMenu.removeClass('hidden');
            $hamburgerMenu.attr('aria-expanded', 'true');
        }
        $hamburgerMenu.toggleClass('open');
        if ($hamburgerMenu.hasClass('open')) {
            $mobileMainMenu.addClass('menu-open');
            $hamburgerMenu.attr('aria-expanded', 'true');
            $mobileMainMenu.closest('.global-header').addClass('menuOpened');
        } else {
            $mobileMainMenu.removeClass('menu-open');
            $hamburgerMenu.attr('aria-expanded', 'false');
            $mobileMainMenu.closest('.global-header').removeClass('menuOpened');
        }
    });

    // Hide hamburger menu if no nav items (sign in and register pages)
    if ($('.mobile-nav-item').size() === 0) {
        $('.global-header .hamburger-menu').addClass('hidden');
    }

    createMobileMenu();
    makeAnimatedHeader();
    edlySetupNavMenu();
});

// Accessibility keyboard controls for user dropdown and mobile menu
$('.mobile-menu, .global-header').on('keydown', function(e) {
    'use strict';
    var isNext;
    var nextLink;
    var loopFirst;
    var loopLast;
    var $curTarget = $(e.target);
    var isLastItem = $curTarget.parent().is(':last-child');
    var isToggle = $curTarget.hasClass('toggle-user-dropdown');
    var isHamburgerMenu = $curTarget.hasClass('hamburger-menu');
    var isMobileOption = $curTarget.parent().hasClass('mobile-nav-link');
    var isDropdownOption = !isMobileOption && $curTarget.parent().hasClass('dropdown-item');
    var $userDropdown = $('.global-header .user-dropdown');
    var $hamburgerMenu = $('.global-header .hamburger-menu');
    var $toggleUserDropdown = $('.global-header .toggle-user-dropdown');

    // Open or close relevant menu on enter or space click and focus on first element.
    if ((e.key === 'Enter' || e.key === 'Space') && (isToggle || isHamburgerMenu)) {
        e.preventDefault();
        e.stopPropagation();

        $curTarget.click();
        if (isHamburgerMenu) {
            if ($('.mobile-menu').is(':visible')) {
                $hamburgerMenu.attr('aria-expanded', true);
                $('.mobile-menu .mobile-nav-link a').first().focus();
            } else {
                $hamburgerMenu.attr('aria-expanded', false);
            }
        } else if (isToggle) {
            if ($('.global-header .nav-item .dropdown-user-menu').is(':visible')) {
                $userDropdown.attr('aria-expanded', 'true');
                $('.global-header .dropdown-item a:first').focus();
            } else {
                $userDropdown.attr('aria-expanded', false);
            }
        }
    }

    // Enable arrow functionality within the menu.
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && (isDropdownOption || isMobileOption ||
        (isHamburgerMenu && $hamburgerMenu.hasClass('open')) || (isToggle && $toggleUserDropdown.hasClass('open')))) {
        isNext = e.key === 'ArrowDown';
        if (isNext && !isHamburgerMenu && !isToggle && isLastItem) {
            // Loop to the start from the final element
            nextLink = isDropdownOption ? $toggleUserDropdown : $hamburgerMenu;
        } else if (!isNext && (isHamburgerMenu || isToggle)) {
            // Loop to the end when up arrow pressed from menu icon
            nextLink = isHamburgerMenu ? $('.mobile-menu .mobile-nav-link a').last()
                : $('.global-header .dropdown-user-menu .dropdown-nav-item').last().find('a');
        } else if (isNext && (isHamburgerMenu || isToggle)) {
            // Loop to the first element from the menu icon
            nextLink = isHamburgerMenu ? $('.mobile-menu .mobile-nav-link a').first()
                : $('.global-header .dropdown-user-menu .dropdown-nav-item').first().find('a');
        } else {
            // Loop up to the menu icon if first element in menu
            if (!isNext && $curTarget.parent().is(':first-child') && !isHamburgerMenu && !isToggle) {
                nextLink = isDropdownOption ? $toggleUserDropdown : $hamburgerMenu;
            } else {
                nextLink = isNext
                    ? $curTarget.parent().next().find('a') // eslint-disable-line newline-per-chained-call
                    : $curTarget.parent().prev().find('a'); // eslint-disable-line newline-per-chained-call
            }
        }
        nextLink.focus();

        // Don't let the screen scroll on navigation
        e.preventDefault();
        e.stopPropagation();
    }

    // Escape clears out of the menu
    if (e.key === 'Escape' && (isDropdownOption || isHamburgerMenu || isMobileOption || isToggle)) {
        if (isDropdownOption || isToggle) {
            $('.global-header .nav-item .dropdown-user-menu').addClass('hidden');
            $toggleUserDropdown.focus()
                .attr('aria-expanded', 'false');
            $('.global-header .toggle-user-dropdown').removeClass('open');
        } else {
            $('.mobile-menu').addClass('hidden');
            $hamburgerMenu.focus()
                .attr('aria-expanded', 'false')
                .removeClass('open');
        }
    }

    // Loop when tabbing and using arrows
    if ((e.key === 'Tab') && ((isDropdownOption && isLastItem) || (isMobileOption && isLastItem) || (isHamburgerMenu &&
        $hamburgerMenu.hasClass('open')) || (isToggle && $toggleUserDropdown.hasClass('open')))) {
        nextLink = null;
        loopFirst = isLastItem && !e.shiftKey && !isHamburgerMenu && !isToggle;
        loopLast = (isHamburgerMenu || isToggle) && e.shiftKey;
        if (!(loopFirst || loopLast)) {
            return;
        }
        e.preventDefault();
        if (isDropdownOption || isToggle) {
            nextLink = loopFirst ? $toggleUserDropdown
                : $('.global-header .dropdown-user-menu .dropdown-nav-item a').last();
        } else {
            nextLink = loopFirst ? $hamburgerMenu : $('.mobile-menu .mobile-nav-link a').last();
        }
        nextLink.focus();
    }
});
