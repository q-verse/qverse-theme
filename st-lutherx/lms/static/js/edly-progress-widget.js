function progressOptions(progressBarColor, strokeWidth) {
    return {
        color: progressBarColor,
        strokeWidth: strokeWidth,
        trailColor: '#ffffff',
        easing: 'easeInOut',
        svgStyle: {
            display: 'block',
            width: '100%',
            height: '100%'
        },
        text: {
            style: {
                color: '#0A0A0A',
                position: 'absolute',
                left: '50%',
                top: '50%',
                padding: 0,
                margin: 0,
                fontSize: '16px',
                transform: {
                    prefix: true,
                    value: 'translate(-50%, -50%)'
                }
            }
        }
    };
}

const animateOptions = {
    from: { color: '#000 ' },
    to: { color: '#888' },
    duration: 1200
};

const overallProgressBtn = new ProgressBar.Circle('#overall_progressBtn', progressOptions('#339CD8', '15'));
const overallProgress = new ProgressBar.Circle('#overall_progress', progressOptions('#339CD8', '15'));
const problemProgress = new ProgressBar.Line('#problem_progress', progressOptions('#62AA46', '30'));
const videoProgress = new ProgressBar.Line('#video_progress', progressOptions('#9C5CB8', '30'));
const htmlProgress = new ProgressBar.Line('#html_progress', progressOptions('#D97F3E', '30'));
const otherProgress = new ProgressBar.Line('#other_progress', progressOptions('#4BB9BF', '30'));

$(window).on('load', function () {
    edlyLoadCourseProgress();

    $(document).on('click', '.progress-check', function () {
        edlyLoadCourseProgress();
    });

    $('#btn-close-progress-widget').on('click', function() {
        $(this).parent().toggleClass('show');
        $(this).toggleClass('show-close-icon');
    });
});

function edlyLoadCourseProgress() {
    /**
     * Load current course progress
     */
    let request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            $('#edly-progress-widget-feedback').hide();
            $('.edly-progress-widget-container').show();

            let completeProgress = JSON.parse(this.responseText);
            let totalBlockWiseProgress = completeProgress.total_block_types;
            let totalCompletedBlockWiseProgress = completeProgress.total_completed_block_types;

            let overallprogressPercentBtn = completeProgress.total_completed_blocks / completeProgress.total_blocks;
            if (!completeProgress.total_blocks) { overallprogressPercentBtn = 0; }
            overallProgressBtn.animate(overallprogressPercentBtn, animateOptions);
            overallProgressBtn.setText(Math.round((overallprogressPercentBtn || 0) * 100) + '%');

            let overallprogressPercent = completeProgress.total_completed_blocks / completeProgress.total_blocks;
            if (!completeProgress.total_blocks) { overallprogressPercent = 0; }
            overallProgress.animate(overallprogressPercent, animateOptions);
            overallProgress.setText(Math.round((overallprogressPercent || 0) * 100) + '%');

            let problemProgressPercent = totalCompletedBlockWiseProgress.problem / totalBlockWiseProgress.problem;
            problemProgress.animate(problemProgressPercent, animateOptions)
            problemProgress.setText(Math.round((problemProgressPercent || 0) * 100) + '%');
            $('#problem_progress_figures').html(totalCompletedBlockWiseProgress.problem + '/' + totalBlockWiseProgress.problem);

            let videoProgressPercent = totalCompletedBlockWiseProgress.video / totalBlockWiseProgress.video;
            videoProgress.animate(videoProgressPercent, animateOptions)
            videoProgress.setText(Math.round((videoProgressPercent || 0) * 100) + '%');
            $('#videos_progress_figures').html(totalCompletedBlockWiseProgress.video + '/' + totalBlockWiseProgress.video);

            let htmlProgressPercent = totalCompletedBlockWiseProgress.html / totalBlockWiseProgress.html;
            htmlProgress.animate(htmlProgressPercent, animateOptions)
            htmlProgress.setText(Math.round((htmlProgressPercent || 0) * 100) + '%');
            $('#html_progress_figures').html(totalCompletedBlockWiseProgress.html + '/' + totalBlockWiseProgress.html);

            let otherProgressPercent = totalCompletedBlockWiseProgress.other / totalBlockWiseProgress.other;
            otherProgress.animate(otherProgressPercent, animateOptions)
            otherProgress.setText(Math.round((otherProgressPercent || 0) * 100) + '%');
            $('#other_progress_figures').html(totalCompletedBlockWiseProgress.other + '/' + totalBlockWiseProgress.other);
        } else if (this.readyState === 4 && this.status === 404) {
            $('.edly-progress-widget-container').hide();
        } else if (this.readyState !== 4) {
            $('#edly-progress-widget-feedback').html('Loading course progress ...');
        } else {
            $('#edly-progress-widget-feedback').html('There was an error loading course progress!');
        }
    };

    let courseKey = $('[data-course-id]').attr('data-course-id');
    let courseProgressURL = $('#edly-progress-widget-feedback').attr('data-ajax-url');

    if (courseProgressURL !== '' && courseProgressURL !== '#') {
        request.open('GET', courseProgressURL + `?course_id=${encodeURIComponent(courseKey)}`, true);
        request.withCredentials = true;
        request.send();
    }
}
