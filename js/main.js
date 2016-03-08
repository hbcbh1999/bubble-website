$(document).ready(function() {
  var formElement = $('#add-form');
  var buttonElement = formElement.find('.btn');
  var inputElement = $('#exampleInputText');
  var missingEANElement = $('#missing-isbn');
  var manualAddition = $('#manual-addition');
  var foundInOurDatabase = $('#found-in-our-database');
  var notProcessedYet = $('#not-processed-yet');
  var hasBeenRejected = $('#has-been-rejected');
  var ErrorServer = $('#error-server');
  var addedToRequestedEAN = $('#added-requested-EAN');

  function resetError() {
    $('.error').text('');
  }
  function resetInput() {
    inputElement.val('');
  }
  function resetForm() {
    missingEANElement.hide();
    manualAddition.hide();
    addedToRequestedEAN.hide();
    foundInOurDatabase.hide();
    notProcessedYet.hide();
    hasBeenRejected.hide();
    formElement.show();
  }

  $('.back-to-form').on('click', function() {
    resetError();
    resetForm();
  });
  $('.back-to-form-without-text').on('click', function() {
    resetError();
    resetForm();
    resetInput();
  })

  if(formElement) {
    formElement.on('submit', function(event) {
      resetError();
      if (event.preventDefault) event.preventDefault();

      var isbn = inputElement.val();
      $('.ref-EAN').text(isbn);
      if(isbn) {
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
                missingEANElement.show();
                formElement.hide();
                break;
              case 'foundInOurDatabase':
                foundInOurDatabase.show();
                formElement.hide();
                break;
              case 'manualAddition':
                var email = 'nicolas@appbubble.com';
                var subject = 'subject=' + encodeURIComponent('Ajout EAN: ' + isbn);
                var body = 'body=' + encodeURIComponent('Bonjour,\n\nPourriez-vous ajouter l\'EAN suivant s\'il vous plait: ' + isbn + '\n Je vous joins le maximum d\'information en ma possession sur cette BD comme:\n\nTitre:\nAuteur:\nEditeur:\nAutre:\n\n+ une photo de la couverture que je joins à ce mail.\n\nMerci');

                var string = 'mailto:' + email + '?' + subject + '&' + body;
                $('.mailto').attr('href', string);
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
        $('.error').text('Vous n\'avez pas renseigné d\'ISBN, veuillez en saisir un puis recommencer votre recherche')
      }
      return false;
    })
  }
})
