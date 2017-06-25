$(document).ready(function(){
     $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                $('#go-to-top').fadeIn();
            } else {
                $('#go-to-top').fadeOut();
            }
        });

        $('#go-to-top').click(function () {
            $('#go-to-top').tooltip('hide');
            $('body,html').animate({
                scrollTop: 0
            }, 250);
            return false;
        });
        
        $('#go-to-top').tooltip('show');
});