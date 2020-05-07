jQuery(document).ready(function($) {
    edlySetupWPFooter();
    // hide the notification and set the id in cookie.
    $(document).on('click', '.close_services_notification', function(event) {
        $(this).parent().hide();
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
        notificationsHTML += "<div class='alert alert-" + ((notification.type === 'alert') ? 'danger' : 'warning') +
            "'>" + notification.message + "<span class='alert-link close_services_notification' " +
            "data-notification-id='" + notification.id + "'>Dismiss <i class='fa fa-times aria-hidden='true'>" +
            '</i></span></div>';
    }

    return notificationsHTML;
}

function edlySetupWPFooter() {
    let edlyWPFooterURL = $('body').attr('data-footer-url');
    if (edlyWPFooterURL !== '' && edlyWPFooterURL !== '#') {
        let footerLoader = $('.wrapper-footer .loading');
        footerLoader.show();
        let request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                $('.wrapper.wrapper-footer').html(JSON.parse(this.responseText)).find('.colophon.container').toggleClass('container footer-content-primary');
            }
        };

        request.open('GET', edlyWPFooterURL);
        request.withCredentials = true;
        request.send();
    }
}
