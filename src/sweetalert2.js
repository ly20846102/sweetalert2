'use strict';

import { defaultParams, sweetHTML } from './utils/default.js';
import { swalPrefix, swalClasses, iconTypes } from './utils/classes.js';
import { extend, colorLuminance } from './utils/utils.js';
import * as dom from './utils/dom.js';

var modalParams = extend({}, defaultParams);

/*
 * Set type, text and actions on modal
 */
var setParameters = function(params) {
  var i;
  var modal = dom.getModal();

  // set modal width, padding and margin-left
  modal.style.width = params.width + 'px';
  modal.style.padding = params.padding + 'px';
  modal.style.marginLeft = -params.width / 2 + 'px';
  modal.style.background = params.background;

  // add dynamic media query css
  var head = document.getElementsByTagName('head')[0];
  var cssNode = document.createElement('style');
  cssNode.type = 'text/css';
  cssNode.id = dom.mediaqueryId;
  var margin = 5; // %
  var mediaQueryMaxWidth = params.width + parseInt(params.width * (margin/100) * 2, 10);
  cssNode.innerHTML =
    '@media screen and (max-width: ' + mediaQueryMaxWidth + 'px) {' +
      '.' + swalClasses.modal + ' {' +
        'width: auto !important;' +
        'left: ' + margin + '% !important;' +
        'right: ' + margin + '% !important;' +
        'margin-left: 0 !important;' +
      '}' +
    '}';
  head.appendChild(cssNode);

  var $title = modal.querySelector('h2');
  var $content = modal.querySelector('.' + swalClasses.content);
  var $confirmBtn = dom.getConfirmButton();
  var $cancelBtn = dom.getCancelButton();
  var $spacer = modal.querySelector('.' + swalClasses.spacer);
  var $closeButton = modal.querySelector('.' + swalClasses.close);

  // Title
  $title.innerHTML = params.title.split('\n').join('<br>');

  // Content
  if (params.text || params.html) {
    if (typeof params.html === 'object') {
      $content.innerHTML = '';
      if (0 in params.html) {
        for (i = 0; i in params.html; i++) {
          $content.appendChild(params.html[i]);
        }
      } else {
        $content.appendChild(params.html);
      }
    } else {
      $content.innerHTML = params.html || (params.text.split('\n').join('<br>'));
    }
    dom.show($content);
  } else {
    dom.hide($content);
  }
  // Backwards compatability - let's use the new format!
  if (params.input) {
    var legacyInput = {
        tag:         params.input,
        name:        params.name,
        placeholder: params.inputPlaceholder,
        validator:   params.inputValidator,
    };

    if (params.input === 'select') {
        legacyInput.options = params.inputOptions;
    }
  }

  // Form items
  modal.getElementsByTagName('form')[0].innerHTML = '';
  if (params.inputs) {
    // We're doing a reverse loop, so reverse 
    // original data to retain order
    params.inputs.reverse();
    for (var i = params.inputs.length - 1; i >= 0; i--) {
      dom.addInput(params.inputs[i]);
    }
  }

  // Close button
  if (params.showCloseButton) {
    dom.show($closeButton);
  } else {
    dom.hide($closeButton);
  }

  // Custom Class
  modal.className = swalClasses.modal;
  if (params.customClass) {
    dom.addClass(modal, params.customClass);
  }

  // Icon
  dom.hide(modal.querySelectorAll('.' + swalClasses.icon));
  if (params.type) {
    var validType = false;
    for (var iconType in iconTypes) {
      if (params.type === iconType) {
        validType = true;
        break;
      }
    }
    if (!validType) {
      console.error('Unknown alert type: ' + params.type);
      return false;
    }
    var $icon = modal.querySelector('.' + swalClasses.icon + '.' + iconTypes[params.type]);
    dom.show($icon);

    // Animate icon
    switch (params.type) {
      case 'success':
        dom.addClass($icon, 'animate');
        dom.addClass($icon.querySelector('.tip'), 'animate-success-tip');
        dom.addClass($icon.querySelector('.long'), 'animate-success-long');
        break;
      case 'error':
        dom.addClass($icon, 'animate-error-icon');
        dom.addClass($icon.querySelector('.x-mark'), 'animate-x-mark');
        break;
      case 'warning':
        dom.addClass($icon, 'pulse-warning');
        break;
      default:
        break;
    }

  }

  // Custom image
  var $customImage = modal.querySelector('.' + swalClasses.image);
  if (params.imageUrl) {
    $customImage.setAttribute('src', params.imageUrl);
    dom.show($customImage);

    if (params.imageWidth) {
      $customImage.setAttribute('width', params.imageWidth);
    }

    if (params.imageHeight) {
      $customImage.setAttribute('height', params.imageHeight);
    }

    if (params.imageClass) {
      dom.addClass($customImage, params.imageClass);
    }
  } else {
    dom.hide($customImage);
  }

  // Cancel button
  if (params.showCancelButton) {
    $cancelBtn.style.display = 'inline-block';
  } else {
    dom.hide($cancelBtn);
  }

  // Confirm button
  if (params.showConfirmButton) {
    dom.removeStyleProperty($confirmBtn, 'display');
  } else {
    dom.hide($confirmBtn);
  }

  // Buttons spacer
  if (!params.showConfirmButton && !params.showCancelButton) {
    dom.hide($spacer);
  } else {
    dom.show($spacer);
  }

  // Edit text on cancel and confirm buttons
  $confirmBtn.innerHTML = params.confirmButtonText;
  $cancelBtn.innerHTML = params.cancelButtonText;

  // Set buttons to selected background colors
  if (params.buttonsStyling) {
    $confirmBtn.style.backgroundColor = params.confirmButtonColor;
    $cancelBtn.style.backgroundColor = params.cancelButtonColor;
  }

  // Add buttons custom classes
  $confirmBtn.className = swalClasses.confirm;
  dom.addClass($confirmBtn, params.confirmButtonClass);
  $cancelBtn.className = swalClasses.cancel;
  dom.addClass($cancelBtn, params.cancelButtonClass);

  // Buttons styling
  if (params.buttonsStyling) {
    dom.addClass($confirmBtn, 'styled');
    dom.addClass($cancelBtn, 'styled');
  } else {
    dom.removeClass($confirmBtn, 'styled');
    dom.removeClass($cancelBtn, 'styled');

    $confirmBtn.style.backgroundColor = $confirmBtn.style.borderLeftColor = $confirmBtn.style.borderRightColor = '';
    $cancelBtn.style.backgroundColor = $cancelBtn.style.borderLeftColor = $cancelBtn.style.borderRightColor = '';
  }

  // CSS animation
  if (params.animation === true) {
    dom.removeClass(modal, 'no-animation');
  } else {
    dom.addClass(modal, 'no-animation');
  }
};

/*
 * Animations
 */
var openModal = function(animation, onComplete) {
  var modal = dom.getModal();
  if (animation) {
    dom.fadeIn(dom.getOverlay(), 10);
    dom.addClass(modal, 'show-swal2');
    dom.removeClass(modal, 'hide-swal2');
  } else {
    dom.show(dom.getOverlay());
  }
  dom.show(modal);
  dom.states.previousActiveElement = document.activeElement;
  dom.addClass(modal, 'visible');
  if (onComplete !== null && typeof onComplete === 'function') {
    onComplete.call(this, modal);
  }
};

/*
 * Set 'margin-top'-property on modal based on its computed height
 */
var fixVerticalPosition = function() {
  var modal = dom.getModal();

  modal.style.marginTop = dom.getTopMargin(modal);
};

function modalDependant() {

  if (arguments[0] === undefined) {
    console.error('sweetAlert2 expects at least 1 attribute!');
    return false;
  }

  var params = extend({}, modalParams);

  switch (typeof arguments[0]) {

    case 'string':
      params.title = arguments[0];
      params.text  = arguments[1] || '';
      params.type  = arguments[2] || '';

      break;

    case 'object':
      extend(params, arguments[0]);
      params.extraParams = arguments[0].extraParams;

      break;

    default:
      console.error('Unexpected type of argument! Expected "string" or "object", got ' + typeof arguments[0]);
      return false;
  }

  setParameters(params);

  // Modal interactions
  var modal = dom.getModal();

  return new Promise(function(resolve, reject) {
    // Close on timer
    if (params.timer) {
      modal.timeout = setTimeout(function() {
        sweetAlert.closeModal(params.onClose);
        reject('timer');
      }, params.timer);
    }

    var getInput = function() {
      switch (params.input) {
        case 'select':
          return dom.getChildByClass(modal, swalClasses.select);
        case 'radio':
          return modal.querySelector('.' + swalClasses.radio + ' input:checked') ||
            modal.querySelector('.' + swalClasses.radio + ' input:first-child');
        case 'checkbox':
          return modal.querySelector('#' + swalClasses.checkbox);
        case 'textarea':
          return dom.getChildByClass(modal, swalClasses.textarea);
        default:
          return dom.getChildByClass(modal, swalClasses.input);
      }
    };
    var getInputValue = function() {
      var input = getInput();
      switch (params.input) {
        case 'checkbox':
          return input.checked ? 1 : 0;
        case 'radio':
          return input.checked ? input.value : null;
        case 'file':
          return input.files.length ? input.files[0] : null;
        default:
          return params.inputAutoTrim? input.value.trim() : input.value;
      }
    };

    if (params.input) {
      setTimeout(function() {
        var input = getInput();
        if (input) {
          dom.focusInput(input);
        }
      }, 0);
    }

    var confirm = function(value) {
      if (params.showLoaderOnConfirm) {
        sweetAlert.showLoading();
      }

      if (params.preConfirm) {
        params.preConfirm(value, params.extraParams).then(
          function(preConfirmValue) {
            sweetAlert.closeModal(params.onClose);
            resolve(preConfirmValue || value);
          },
          function(error) {
            sweetAlert.hideLoading();
            if (error) {
              sweetAlert.showValidationError(error);
            }
          }
        );
      } else {
        sweetAlert.closeModal(params.onClose);
        resolve(value);
      }
    };

    // Mouse interactions
    var onButtonEvent = function(event) {
      var e = event || window.event;
      var target = e.target || e.srcElement;
      var targetedConfirm = dom.getConfirmButton() === target || dom.getConfirmButton().contains(target);
      var targetedCancel = dom.getCancelButton() === target || dom.getCancelButton().contains(target);
      var modalIsVisible  = dom.hasClass(modal, 'visible');

      switch (e.type) {
        case 'mouseover':
        case 'mouseup':
        case 'focus':
          if (params.buttonsStyling) {
            if (targetedConfirm) {
              target.style.backgroundColor = colorLuminance(params.confirmButtonColor, -0.1);
            } else if (targetedCancel) {
              target.style.backgroundColor = colorLuminance(params.cancelButtonColor, -0.1);
            }
          }
          break;
        case 'mouseout':
        case 'blur':
          if (params.buttonsStyling) {
            if (targetedConfirm) {
              target.style.backgroundColor = params.confirmButtonColor;
            } else if (targetedCancel) {
              target.style.backgroundColor = params.cancelButtonColor;
            }
          }
          break;
        case 'mousedown':
          if (params.buttonsStyling) {
            if (targetedConfirm) {
              target.style.backgroundColor = colorLuminance(params.confirmButtonColor, -0.2);
            } else if (targetedCancel) {
              target.style.backgroundColor = colorLuminance(params.cancelButtonColor, -0.2);
            }
          }
          break;
        case 'click':
          // Clicked 'confirm'
          if (targetedConfirm && modalIsVisible) {
            if (params.inputs) {
              var inputValues = {};
              var validators = [];
              sweetAlert.disableInput();
              for (var i = params.inputs.length - 1; i >= 0; i--) {
                var input = params.inputs[i];

                // Add any validators to an array so we can 
                // utilise Promise.all
                if (input.validator) {
                  validators.push(input.validator(input.value, input));
                }

                inputValues[input.name] = input.value;
              }
              if (validators.length) {
                Promise.all(validators)
                  .then(function() {
                    sweetAlert.enableInput();
                    confirm(inputValues);
                  }, function(error) {
                    sweetAlert.enableInput();
                    if (error) {
                      sweetAlert.showValidationError(error.message, error.input);
                    }
                  });
              }
              return;
              confirm(inputValues);
            }
            // if (params.input) {
            //   var inputValue = getInputValue();

            //   if (params.inputValidator) {
            //     sweetAlert.disableInput();
            //     params.inputValidator(inputValue, params.extraParams).then(
            //       function() {
            //         sweetAlert.enableInput();
            //         confirm(inputValue);
            //       },
            //       function(error) {
            //         sweetAlert.enableInput();
            //         if (error) {
            //           sweetAlert.showValidationError(error);
            //         }
            //       }
            //     );
            //   } else {
            //     confirm(inputValue);
            //   }

            // } else {
            //   confirm(true);
            // }

          // Clicked 'cancel'
          } else if (targetedCancel && modalIsVisible) {
            sweetAlert.closeModal(params.onClose);
            reject('cancel');
          }

          break;
        default:
      }
    };

    var $buttons = modal.querySelectorAll('button');
    var i;
    for (i = 0; i < $buttons.length; i++) {
      $buttons[i].onclick     = onButtonEvent;
      $buttons[i].onmouseover = onButtonEvent;
      $buttons[i].onmouseout  = onButtonEvent;
      $buttons[i].onmousedown = onButtonEvent;
    }

    // Closing modal by close button
    dom.getCloseButton().onclick = function() {
      sweetAlert.closeModal(params.onClose);
      reject('close');
    };

    // Closing modal by overlay click
    dom.getOverlay().onclick = function() {
      if (params.allowOutsideClick) {
        sweetAlert.closeModal(params.onClose);
        reject('overlay');
      }
    };

    // Focus and blur events handling
    var $confirmButton = dom.getConfirmButton();
    var $cancelButton = dom.getCancelButton();
    var $modalElements = [$confirmButton, $cancelButton].concat(Array.prototype.slice.call(
      modal.querySelectorAll('button:not([class^=' + swalPrefix + ']), input:not([type=hidden]), textarea, select')
    ));
    for (i = 0; i < $modalElements.length; i++) {
      $modalElements[i].onfocus = onButtonEvent;
      $modalElements[i].onblur = onButtonEvent;
    }

    // Reverse buttons if neede d
    if (params.reverseButtons) {
      $confirmButton.parentNode.insertBefore($cancelButton, $confirmButton);
    }

    function setFocus(index, increment) {
      // search for visible elements and select the next possible match
      for (var i = 0; i < $modalElements.length; i++) {
        index = index + increment;

        // rollover to first item
        if (index === $modalElements.length) {
          index = 0;

        // go to last item
        } else if (index === -1) {
          index = $modalElements.length - 1;
        }

        // determine if element is visible, the following is borrowed from jqeury $(elem).is(':visible') implementation
        if (
          $modalElements[index].offsetWidth ||
          $modalElements[index].offsetHeight ||
          $modalElements[index].getClientRects().length
        ) {
          $modalElements[index].focus();
          return;
        }
      }
    }

    function handleKeyDown(event) {
      var e = event || window.event;
      var keyCode = e.keyCode || e.which;

      if ([9, 13, 32, 27].indexOf(keyCode) === -1) {
        // Don't do work on keys we don't care about.
        return;
      }

      var $targetElement = e.target || e.srcElement;

      var btnIndex = -1; // Find the button - note, this is a nodelist, not an array.
      for (var i = 0; i < $modalElements.length; i++) {
        if ($targetElement === $modalElements[i]) {
          btnIndex = i;
          break;
        }
      }

      // TAB
      if (keyCode === 9) {
        if (!e.shiftKey) {
          // Cycle to the next button
          setFocus(btnIndex, 1);
        } else {
          // Cycle to the prev button
          setFocus(btnIndex, -1);
        }

        dom.stopEventPropagation(e);

      } else {
        if (keyCode === 13 || keyCode === 32) {
          if (btnIndex === -1) {
            // ENTER/SPACE clicked outside of a button.
            dom.fireClick($confirmButton, e);
          }
        } else if (keyCode === 27 && params.allowEscapeKey === true) {
          sweetAlert.closeModal(params.onClose);
          reject('esc');
        }
      }
    }

    dom.states.previousWindowKeyDown = window.onkeydown;
    window.onkeydown = handleKeyDown;

    // Loading state
    if (params.buttonsStyling) {
      $confirmButton.style.borderLeftColor = params.confirmButtonColor;
      $confirmButton.style.borderRightColor = params.confirmButtonColor;
    }

    /**
     * Show spinner instead of Confirm button and disable Cancel button
     */
    sweetAlert.showLoading = sweetAlert.enableLoading = function() {
      dom.addClass($confirmButton, 'loading');
      dom.addClass(modal, 'loading');
      $confirmButton.disabled = true;
      $cancelButton.disabled = true;
    };

    /**
     * Show spinner instead of Confirm button and disable Cancel button
     */
    sweetAlert.hideLoading = sweetAlert.disableLoading = function() {
      dom.removeClass($confirmButton, 'loading');
      dom.removeClass(modal, 'loading');
      $confirmButton.disabled = false;
      $cancelButton.disabled = false;
    };

    sweetAlert.enableButtons = function() {
      $confirmButton.disabled = false;
      $cancelButton.disabled = false;
    };

    sweetAlert.disableButtons = function() {
      $confirmButton.disabled = true;
      $cancelButton.disabled = true;
    };

    sweetAlert.enableInput = function() {
      var inputTypes = ['input', 'select', 'textarea'];

      for (var i = inputTypes.length - 1; i >= 0; i--) {
        var inputNodes = modal.getElementsByTagName('form')[0].getElementsByTagName(inputTypes[i]);
        for (var iNode = inputNodes.length - 1; iNode >= 0; iNode--) {
          inputNodes[iNode].removeAttribute("disabled");
        }
      }
    };

    sweetAlert.disableInput = function() {
      var inputTypes = ['input', 'select', 'textarea'];

      for (var i = inputTypes.length - 1; i >= 0; i--) {
        var inputNodes = modal.getElementsByTagName('form')[0].getElementsByTagName(inputTypes[i]);
        for (var iNode = inputNodes.length - 1; iNode >= 0; iNode--) {
          inputNodes[iNode].setAttribute("disabled", true);
        }
      }
    };

    sweetAlert.showValidationError = function(error, input) {
      var $validationError = modal.querySelector('.' + swalClasses.validationerror);
      $validationError.innerHTML = error;
      dom.show($validationError);

      var inputNode = document.getElementById(input.id);
      dom.focusInput(inputNode);
      dom.addClass(inputNode, 'error');
    };

    sweetAlert.resetValidationError = function() {
      var $validationError = modal.querySelector('.' + swalClasses.validationerror);
      dom.hide($validationError);

      var inputTypes = ['input', 'select', 'textarea'];

      for (var i = inputTypes.length - 1; i >= 0; i--) {
        var inputNodes = modal.getElementsByTagName('form')[0].getElementsByTagName(inputTypes[i]);
        for (var iNode = inputNodes.length - 1; iNode >= 0; iNode--) {
          dom.removeClass(inputNodes[iNode], 'error');
        }
      }
    };

    sweetAlert.enableButtons();
    sweetAlert.hideLoading();
    sweetAlert.resetValidationError();

    // input, select
    // var inputTypes = ['input', 'select', 'radio', 'checkbox', 'textarea'];
    // var input;
    // for (i = 0; i < inputTypes.length; i++) {
    //   var inputClass = swalClasses[inputTypes[i]];
    //   input = dom.getChildByClass(modal, inputClass);

    //   // set attributes
    //   while (input.attributes.length > 0) {
    //     input.removeAttribute(input.attributes[0].name);
    //   }
    //   for (var attr in params.inputAttributes) {
    //     input.setAttribute(attr, params.inputAttributes[attr]);
    //   }

    //   // set class
    //   input.className = inputClass;
    //   if (params.inputClass) {
    //     dom.addClass(input, params.inputClass);
    //   }

    //   dom._hide(input);
    // }

    // var populateInputOptions;
    // switch (params.input) {
    //   case 'text':
    //   case 'email':
    //   case 'password':
    //   case 'file':
    //     input = dom.getChildByClass(modal, swalClasses.input);
    //     input.value = params.inputValue;
    //     input.placeholder = params.inputPlaceholder;
    //     input.type = params.input;
    //     dom._show(input);
    //     break;
    //   case 'select':
    //     var select = dom.getChildByClass(modal, swalClasses.select);
    //     select.innerHTML = '';
    //     if (params.inputPlaceholder) {
    //       var placeholder = document.createElement('option');
    //       placeholder.innerHTML = params.inputPlaceholder;
    //       placeholder.value = '';
    //       placeholder.disabled = true;
    //       placeholder.selected = true;
    //       select.appendChild(placeholder);
    //     }
    //     populateInputOptions = function(inputOptions) {
    //       for (var optionValue in inputOptions) {
    //         var option = document.createElement('option');
    //         option.value = optionValue;
    //         option.innerHTML = inputOptions[optionValue];
    //         if (params.inputValue === optionValue) {
    //           option.selected = true;
    //         }
    //         select.appendChild(option);
    //       }
    //       dom._show(select);
    //       select.focus();
    //     };
    //     break;
    //   case 'radio':
    //     var radio = dom.getChildByClass(modal, swalClasses.radio);
    //     radio.innerHTML = '';
    //     populateInputOptions = function(inputOptions) {
    //       for (var radioValue in inputOptions) {
    //         var id = 1;
    //         var radioInput = document.createElement('input');
    //         var radioLabel = document.createElement('label');
    //         var radioLabelSpan = document.createElement('span');
    //         radioInput.type = 'radio';
    //         radioInput.name = swalClasses.radio;
    //         radioInput.value = radioValue;
    //         radioInput.id = swalClasses.radio + '-' + (id++);
    //         if (params.inputValue === radioValue) {
    //           radioInput.checked = true;
    //         }
    //         radioLabelSpan.innerHTML = inputOptions[radioValue];
    //         radioLabel.appendChild(radioInput);
    //         radioLabel.appendChild(radioLabelSpan);
    //         radioLabel.for = radioInput.id;
    //         radio.appendChild(radioLabel);
    //       }
    //       dom._show(radio);
    //       var radios = radio.querySelectorAll('input');
    //       if (radios.length) {
    //         radios[0].focus();
    //       }
    //     };
    //     break;
    //   case 'checkbox':
    //     var checkbox = dom.getChildByClass(modal, swalClasses.checkbox);
    //     var checkboxInput = modal.querySelector('#' + swalClasses.checkbox);
    //     checkboxInput.value = 1;
    //     checkboxInput.checked = Boolean(params.inputValue);
    //     var label = checkbox.getElementsByTagName('span');
    //     if (label.length) {
    //       checkbox.removeChild(label[0]);
    //     }
    //     label = document.createElement('span');
    //     label.innerHTML = params.inputPlaceholder;
    //     checkbox.appendChild(label);
    //     dom._show(checkbox);
    //     break;
    //   case 'textarea':
    //     var textarea = dom.getChildByClass(modal, swalClasses.textarea);
    //     textarea.value = params.inputValue;
    //     textarea.placeholder = params.inputPlaceholder;
    //     dom._show(textarea);
    //     break;
    //   case null:
    //     break;
    //   default:
    //     console.error('Unexpected type of input! Expected "text" or "email" or "password", "select", "checkbox", "textarea" or "file", got ' + typeof arguments[0]);
    //     break;
    // }

    // if (params.input === 'select' || params.input === 'radio') {
    //   if (params.inputOptions instanceof Promise) {
    //     sweetAlert.showLoading();
    //     params.inputOptions.then(function(inputOptions) {
    //       sweetAlert.hideLoading();
    //       populateInputOptions(inputOptions);
    //     });
    //   } else if (typeof params.inputOptions === 'object') {
    //     populateInputOptions(params.inputOptions);
    //   } else {
    //     console.error('Unexpected type of inputOptions! Expected object or Promise, got ' + params.inputOptions);
    //   }
    // }

    fixVerticalPosition();
    openModal(params.animation, params.onOpen);

    // Focus the first element (input or button)
    setFocus(-1, 1);
  });
}

// SweetAlert function
function sweetAlert() {
  // Copy arguments to the local args variable
  var args = arguments;
  var modal = dom.getModal();

  if (modal === null) {
    sweetAlert.init();
    modal = dom.getModal();
  }

  if (dom.hasClass(modal, 'visible')) {
    dom.resetPrevState();
  }

  return modalDependant.apply(this, args);
}

/*
 * Global function for chaining sweetAlert modals
 */
sweetAlert.queue = function(steps) {
  return new Promise(function(resolve, reject) {
    (function step(i, callback) {
      if (i < steps.length) {
        sweetAlert(steps[i]).then(function() {
          step(i+1, callback);
        }, function(dismiss) {
          reject(dismiss);
        });
      } else {
        resolve();
      }
    })(0);
  });
};

/*
 * Global function to close sweetAlert
 */
sweetAlert.close = sweetAlert.closeModal = function(onComplete) {
  var modal = dom.getModal();
  dom.removeClass(modal, 'show-swal2');
  dom.addClass(modal, 'hide-swal2');
  dom.removeClass(modal, 'visible');

  // Reset icon animations
  var $successIcon = modal.querySelector('.' + swalClasses.icon + '.' + iconTypes.success);
  dom.removeClass($successIcon, 'animate');
  dom.removeClass($successIcon.querySelector('.tip'), 'animate-success-tip');
  dom.removeClass($successIcon.querySelector('.long'), 'animate-success-long');

  var $errorIcon = modal.querySelector('.' + swalClasses.icon + '.' + iconTypes.error);
  dom.removeClass($errorIcon, 'animate-error-icon');
  dom.removeClass($errorIcon.querySelector('.x-mark'), 'animate-x-mark');

  var $warningIcon = modal.querySelector('.' + swalClasses.icon + '.' + iconTypes.warning);
  dom.removeClass($warningIcon, 'pulse-warning');

  dom.resetPrevState();

  if (dom.animationEndEvent && !dom.hasClass(modal, 'no-animation')) {
    modal.addEventListener(dom.animationEndEvent, function swalCloseEventFinished() {
      modal.removeEventListener(dom.animationEndEvent, swalCloseEventFinished);
      if (dom.hasClass(modal, 'hide-swal2')) {
        dom._hide(modal);
        dom.fadeOut(dom.getOverlay(), 0);
      }
    });
  } else {
    dom._hide(modal);
    dom._hide(dom.getOverlay());
  }
  if (onComplete !== null && typeof onComplete === 'function') {
    onComplete.call(this, modal);
  }
};

/*
 * Global function to click 'Confirm' button
 */
sweetAlert.clickConfirm = function() {
  dom.getConfirmButton().click();
};

/*
 * Global function to click 'Cancel' button
 */
sweetAlert.clickCancel = function() {
  dom.getCancelButton().click();
};

/*
 * Add modal + overlay to DOM
 */
sweetAlert.init = function() {
  if (typeof document === 'undefined') {
    console.log('SweetAlert2 requires document to initialize');
    return;
  } else if (document.getElementsByClassName(swalClasses.container).length) {
    return;
  }

  var sweetWrap = document.createElement('div');
  sweetWrap.className = swalClasses.container;

  sweetWrap.innerHTML = sweetHTML;

  document.body.appendChild(sweetWrap);

  // var modal = dom.getModal();

  window.addEventListener('resize', fixVerticalPosition, false);
};

/**
 * Set default params for each popup
 * @param {Object} userParams
 */
sweetAlert.setDefaults = function(userParams) {
  if (!userParams) {
    throw new Error('userParams is required');
  }
  if (typeof userParams !== 'object') {
    throw new Error('userParams has to be a object');
  }

  extend(modalParams, userParams);
};

/**
 * Reset default params for each popup
 */
sweetAlert.resetDefaults = function() {
  modalParams = extend({}, defaultParams);
};

sweetAlert.version = '';

window.sweetAlert = window.swal = sweetAlert;

/*
* If library is injected after page has loaded
*/
(function() {
  if (document.readyState === 'complete' || document.readyState === 'interactive' && document.body) {
    sweetAlert.init();
  } else {
    document.addEventListener('DOMContentLoaded', function onDomContentLoaded() {
      document.removeEventListener('DOMContentLoaded', onDomContentLoaded, false);
      sweetAlert.init();
    }, false);
  }
})();

if (typeof Promise === 'function') {
  Promise.prototype.done = function() {
    return this.catch(function() {
      // Catch promise rejections silently.
      // https://github.com/limonte/sweetalert2/issues/177
    });
  };
}

export default sweetAlert;
