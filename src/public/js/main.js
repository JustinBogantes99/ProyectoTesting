jQuery(document).ready(function ($) {

  // Header fixed and Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $('.back-to-top').fadeIn('slow');
      $('#header').addClass('header-fixed');
    } else {
      $('.back-to-top').fadeOut('slow');
      $('#header').removeClass('header-fixed');
    }
  });
  $('.back-to-top').click(function () {
    $('html, body').animate({
      scrollTop: 0
    }, 1500, 'easeInOutExpo');
    return false;
  });

  // Initiate the wowjs
  new WOW().init();

  // Initiate superfish on nav menu
  $('.nav-menu').superfish({
    animation: {
      opacity: 'show'
    },
    speed: 400
  });

  // Mobile Navigation
  if ($('#nav-menu-container').length) {
    var $mobile_nav = $('#nav-menu-container').clone().prop({
      id: 'mobile-nav'
    });
    $mobile_nav.find('> ul').attr({
      'class': '',
      'id': ''
    });
    $('body').append($mobile_nav);
    $('body').prepend('<button type="button" id="mobile-nav-toggle"><i class="fa fa-bars"></i></button>');
    $('body').append('<div id="mobile-body-overly"></div>');
    $('#mobile-nav').find('.menu-has-children').prepend('<i class="fa fa-chevron-down"></i>');

    $(document).on('click', '.menu-has-children i', function (e) {
      $(this).next().toggleClass('menu-item-active');
      $(this).nextAll('ul').eq(0).slideToggle();
      $(this).toggleClass("fa-chevron-up fa-chevron-down");
    });

    $(document).on('click', '#mobile-nav-toggle', function (e) {
      $('body').toggleClass('mobile-nav-active');
      $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
      $('#mobile-body-overly').toggle();
    });

    $(document).click(function (e) {
      var container = $("#mobile-nav, #mobile-nav-toggle");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
          $('#mobile-body-overly').fadeOut();
        }
      }
    });
  } else if ($("#mobile-nav, #mobile-nav-toggle").length) {
    $("#mobile-nav, #mobile-nav-toggle").hide();
  }

  // Smoth scroll on page hash links
  $('a[href*="#"]:not([href="#"])').on('click', function () {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {

      var target = $(this.hash);
      if (target.length) {
        var top_space = 0;

        if ($('#header').length) {
          top_space = $('#header').outerHeight();

          if (!$('#header').hasClass('header-fixed')) {
            top_space = top_space - 20;
          }
        }

        $('html, body').animate({
          scrollTop: target.offset().top - top_space
        }, 1500, 'easeInOutExpo');

        if ($(this).parents('.nav-menu').length) {
          $('.nav-menu .menu-active').removeClass('menu-active');
          $(this).closest('li').addClass('menu-active');
        }

        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
          $('#mobile-body-overly').fadeOut();
        }
        return false;
      }
    }
  });

  // Porfolio filter
  $("#portfolio-flters li").click(function () {
    $("#portfolio-flters li").removeClass('filter-active');
    $(this).addClass('filter-active');

    var selectedFilter = $(this).data("filter");
    $("#portfolio-wrapper").fadeTo(100, 0);

    $(".portfolio-item").fadeOut().css('transform', 'scale(0)');

    setTimeout(function () {
      $(selectedFilter).fadeIn(100).css('transform', 'scale(1)');
      $("#portfolio-wrapper").fadeTo(300, 1);
    }, 300);
  });

  // jQuery counterUp
  $('[data-toggle="counter-up"]').counterUp({
    delay: 10,
    time: 1000
  });

  // custom code

  $('#date').data('datepicker')
  $('#date2').data('datepicker')

  $('.date-consultas').data('datepicker');

  $('.datepicker').on('click', e => {
    e.preventDefault();
    e.stopPropagation();
  });

  function phoneMask() {
    var num = $(this).val().replace(/\D/g, '');
    $(this).val(num.substring(0, 4) + '-' + num.substring(4, 8));
  }
  $('[type="tel"]').keyup(phoneMask);

  $(document).ready(function () {
    $("#show_errors").modal('show');
  });

  $(document).ready(function () {
    $("#show_success").modal('show');
  });

  $("#btnSubmit").click(function (event) {

    // Fetch form to apply custom Bootstrap validation
    var form = $("#signupForm")

    if (form[0].checkValidity() === false) {
      event.preventDefault()
      event.stopPropagation()
    }

    form.addClass('was-validated');
  });

  $(".readonly").keydown(function (e) {
    e.preventDefault();
  });

  $("#cPeriodos").change(function () {
    let selected = $(this).children("option:selected").val();
    $("#cPeriodos").val = selected;
  });
  $("#cProfesores").change(function () {
    let selected = $(this).children("option:selected").val();
    $("#cProfesores").val = selected;
  }
  );

  $('#collapseExample').collapse('show');
  $('#collapseExample2').collapse('hide');

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  $('#date').datepicker({
    minDate: tomorrow
  });
});

$('#btnMenuBandejas').on('click', function () {
  if ($('#collapseExample').hasClass('show')) {
    $('#btnMenuBandejas').html("Mostrar Menú");
  }
  else {
    $('#btnMenuBandejas').html("Ocultar Menú");
  }

  $('#collapseExample').collapse('toggle');
});

function colocarFechaLimite(fechaLimite) {
  var tomorrow = new Date(Date.parse(fechaLimite));
  tomorrow.setDate(tomorrow.getDate() + 1);
  $('#date').datepicker({
    maxDate: tomorrow
  });
}

function colocarFechaMinima(fechaLimite) {
  var tomorrow = new Date(Date.parse(fechaLimite));
  tomorrow.setDate(tomorrow.getDate() + 1);
  $('#date').datepicker({
    minDate: tomorrow
  });
}

tinymce.init({
  selector: '.textBI', menubar: false, toolbar: 'undo bold italic underline',
  setup: function (ed) {
    ed.on("change", function () {
      tinymce.triggerSave();
    });
    ed.on("keyup", function () {
      tinymce.triggerSave();
    });
  }
});
tinymce.init({ selector: '.vistaBI', menubar: false, toolbar: false, readonly: 1 });
$(document).click(function () {
  $("#dropdown").hide();
});

/* Clicks within the dropdown won't make
   it past the dropdown itself */
$("#dropdown").click(function (e) {
  e.stopPropagation();
});

$("#toggleMemos").click(function () {
  $('#collapseChat').collapse('toggle');
  let objDiv = document.getElementById("messages");
  objDiv.scrollTop = objDiv.scrollHeight;
});

$(document).on('click', '.dropdown-menu', function (e) {
  e.stopPropagation();
});

$(".clickable-row").click(function () {
  let checkbox = $(this).find("input[type='checkbox']");
  checkbox.prop('checked', !checkbox[0].checked);
});

$(".form-check-input").click(function () {
  let checkbox = $(this);
  checkbox.prop('checked', !checkbox[0].checked);
});

$(".dropDrownBusqueda").on("keyup", function () {
  var value = $(this).val().toLowerCase();
  $(".dropdown-menu li").filter(function () {
    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
  });
});

$("input[name*='buscar_porTipo']").on("click", function (e) {
  e.preventDefault();
  let valor = $(this).val();
  pagina = parseInt(valor, 10);
  $('.carouselTipo').carousel(pagina);
  let id = $(this).attr("class");
  $("." + id).prop("checked", true);
  console.log(id);
  $('.carouselTipo').carousel('pause');
});

$('.carouselTipo').carousel('pause')