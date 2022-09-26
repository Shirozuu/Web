// define lettering classes
$(".ac, .ac-d").lettering();
$(".al, .ac-l").lettering("lines");
$(".aw, .aw-l").lettering("words");

// check for lettering.js whitespaces
$("span[class^='char']").each(function(){
	var str = $(this).text();
	
	if(str === null || str.match(/^ *$/) !== null){
    $(this).empty();
	}
});

$("content").show(0).css({
	'display': 'flex',
	'justify-content': 'center',
	'align-items': 'center'
});

// define elements for blob thingy
const CURSOR = $("#cBlob");
const CLICKER = $("#cClick");
const BLOBBER = $(".blobber");

// set blob position
$(document).mousemove(function(e) {
  CURSOR.css({
    top: e.pageY - CURSOR.height() / 2 + "px",
    left: e.pageX - CURSOR.width() / 2 + "px"
  });
});

// functions for cursor
const initCursor = () => CURSOR.css("transform", "scale(1)");
const setCursorHover = () => CURSOR.css("transform", "scale(2)");
const removeCursorHover = () => CURSOR.css("transform", "scale(1)");
const setCursorClick = e => {
  CLICKER.css({
    top: e.pageY - CLICKER.height() / 2 + "px",
    left: e.pageX - CLICKER.width() / 2 + "px"
  });
  CLICKER.addClass("clicked");
};

setTimeout(function(){
	initCursor();
}, 1000)

// non clickable elements
BLOBBER.each(function() {
  $(this).on({
    mouseover: setCursorHover,
    mouseleave: removeCursorHover
  });
  
  if($(this).hasClass("link")){
    $(this)
      .click(setCursorClick)
      .click(function(){
      var href = $(this).data('href');
      
      setTimeout(function(){
        toggleNav();
        
        //window.location.href = href;
        var result = confirm("the " + href + " page will appear here");
        
        if (result) {
          window.location.reload(false);
        }
      }, 800);
    });
  }
});

$(".nav__icon").click(function() {
  toggleNav();