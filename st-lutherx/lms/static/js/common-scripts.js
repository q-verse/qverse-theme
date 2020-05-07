/**
* Hide un-enroll button on Dashboard
*/
$(document).click(function(e) {
    // Hide user dropdown when user clicks anywhere on screen apart from dropdown itself
    var button = $('.action-more');
    var container = $('.actions-dropdown');
    // if the target of the click isn't the dropdown button or the container, nor a child of the container or dropdown button
    if (!button.is(e.target) && !button.has(e.target).length &&
        !container.is(e.target) && container.has(e.target).length === 0 &&
        container.is(':visible')) {
        // Trigger click event of drop down button to hide the dropdown
        container.not(':hidden').siblings(button).click();
    }
});

/**
* Show un-enroll button one at a time
*/
var actionButton = $('.action-more');
actionButton.on('mouseup', function (event) {
    var activeButtons = $('.action-more[aria-expanded=true]').not($(this));
    activeButtons.click();
});

/**
* Custom tabs
*/
// Check existance of custom tabs
if ($('.custom-tabs-container').length) {
    $('.tabs-list li').click(function() {
        // Content
        $('.tabs-item-content').hide();
        $('#' + $(this).attr('data-content-id')).show();

        // Tabs
        $('.tabs-list li').removeClass('active');
        $(this).addClass('active');
    });
}
