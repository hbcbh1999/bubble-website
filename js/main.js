$(document).ready(function() {
  var formElement = $('#add-form');
  var buttonElement = formElement.find('.btn');
  var inputElement = $('#exampleInputText');
  var manualAddition = $('#manual-addition');
  var foundInOurDatabase = $('#found-in-our-database');
  var notProcessedYet = $('#not-processed-yet');
  var hasBeenRejected = $('#has-been-rejected');
  var ErrorServer = $('#error-server');
  var addedToRequestedEAN = $('#added-requested-EAN');

  function resetError() {
    $('.error').text('');
    $('.error-container').hide();
  }
  function resetInput() {
    inputElement.val('');
  }
  function resetForm() {
    manualAddition.hide();
    addedToRequestedEAN.hide();
    foundInOurDatabase.hide();
    notProcessedYet.hide();
    hasBeenRejected.hide();
    formElement.show();
  }
  function displayValidation() {
    $('.validation-container').show();
  }
  function resetValidation() {
    $('.validation-container').hide();
  }
  function displayErrorChar() {
    $('.error').text('L\'ISBN renseigné contient d\'autres caractères que des chiffres');
    $('.error-container').show();
  }
  function displayErrorCharMin13() {
    $('.error').text('L\'ISBN renseigné contient plus de 13 caractères');
    $('.error-container').show();
  }
  function isValidInput(isbn) {
    return isValidInputChar(isbn) && isValidInputLength(isbn);
  }
  function isValidInputChar(isbn) {
    return Number.isInteger(Number(isbn))
  }
  function isValidInputLength(isbn) {
    return isbn.length === 13;
  }

  $('.back-to-form').on('click', function() {
    resetError();
    resetForm();
    resetValidation();
  });
  $('.back-to-form-without-text').on('click', function() {
    resetError();
    resetForm();
    resetValidation();
    resetInput();
  });
  inputElement.on('keyup', function() {
    resetError();
    var isbn = inputElement.val();
    if(isValidInput(isbn)) {
      displayValidation();
    } else {
      resetValidation();
      if(!isValidInputChar(isbn)) {
        displayErrorChar();
      } else if(isbn.length > 13) {
        displayErrorCharMin13();
      }
    }

  })

  if(formElement) {
    formElement.on('submit', function(event) {
      resetError();
      if (event.preventDefault) event.preventDefault();

      var isbn = inputElement.val();

      $('.ref-EAN').text(isbn);
      if(isValidInput(isbn)) {

        buttonElement.text('Envoi en cours...');
        var serverUrl = 'https://hidden-taiga-24860.herokuapp.com/';
        // var serverUrl = 'http://localhost:3000/';

        $.ajax({
          type: 'GET',
          url: serverUrl + 'addbook?isbn=' + isbn,
          success: function(response) {
            buttonElement.text('Envoyer');

            switch (response.code) {
              case 'missingISBN':
                $('.error').text('Vous n\'avez pas renseigné d\'ISBN, veuillez en saisir un puis recommencer votre recherche')
                break;
              case 'foundInOurDatabase':
                foundInOurDatabase.show();
                formElement.hide();
                break;
              case 'manualAddition':
                $('.mailto').attr('href', buildEmailString(isbn));
                manualAddition.show();
                formElement.hide();
                break;
              case 'addedToRequestedEAN':
                addedToRequestedEAN.show();
                formElement.hide();
                break;
              case 'notProcessedYet':
                notProcessedYet.show();
                formElement.hide();
                break;
              case 'hasBeenRejected':
                hasBeenRejected.show();
                formElement.hide();
                break;
              case 'errorServer':
                ErrorServer.show();
                formElement.hide();
                break;
              default:

            }
          },
        });
      } else {
        if(!isbn) {
          $('.error').text('Vous n\'avez pas renseigné d\'ISBN, veuillez en saisir un puis recommencer votre recherche');
        } else if(isbn.length > 13) {
          displayErrorCharMin13();
        } else if(isbn.length < 13) {
          $('.error').text('L\'ISBN renseigné contient moins de 13 caractères');
        } else if(!Number.isInteger(Number(isbn))) {
          displayErrorChar();
        }
        $('.error-container').show();
      }
      return false;
    })
  }

  function buildEmailString(isbn) {
    var email = 'nicolas@appbubble.com';
    var subject = 'subject=' + encodeURIComponent('Ajout EAN: ' + isbn);
    var body = 'body=' + encodeURIComponent('Bonjour,\n\nPourriez-vous ajouter l\'EAN suivant s\'il vous plait: ' + isbn + '\n Je vous joins le maximum d\'information en ma possession sur cette BD comme:\n\nTitre:\nAuteur:\nEditeur:\nAutre:\n\n+ une photo de la couverture que je joins à ce mail.\n\nMerci');

    return 'mailto:' + email + '?' + subject + '&' + body;
  }
})
