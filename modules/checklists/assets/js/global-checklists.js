/**
 * @package PublishPress
 * @author PublishPress
 *
 * Copyright (C) 2018 PublishPress
 *
 * ------------------------------------------------------------------------------
 * Based on Edit Flow
 * Author: Daniel Bachhuber, Scott Bressler, Mohammad Jangda, Automattic, and
 * others
 * Copyright (c) 2009-2016 Mohammad Jangda, Daniel Bachhuber, et al.
 * ------------------------------------------------------------------------------
 *
 * This file is part of PublishPress
 *
 * PublishPress is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * PublishPress is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with PublishPress.  If not, see <http://www.gnu.org/licenses/>.
 */

(function ($, objectL10n_checklists_global_checklist) {
  'use strict';

  $(function () {
    show_post_type_requirements(objectL10n_checklists_global_checklist.first_post_type);

    $('#pp-checklists-requirements tbody').sortable({ items: ' > tr' });

    // Set the event for the post type filter
    $('#pp-checklists-post-type-filter a').on('click', function (event) {
      event.preventDefault();

      // Hide all requirements except the first one (title)
      $('.pp-checklists-requirement-row:not(.ppch-title-group)').hide();

      var $target = $(event.toElement || event.target),
        post_type = $target.attr('href').substring(1);

      show_post_type_requirements(post_type);
    });

    // Set the mask for settings fields
    $('.pp-checklists-number').on('keypress', function (event) {
      var key = event.keyCode || event.which;
      var allowed_keys = [
        35,
        36,
        37,
        38,
        39,
        40, // arrows
        8,
        9,
        46,
        27,
        13, // backspace, tab, delete, esc, enter
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57, // 0-9
      ];

      // Ignore any key different than number
      if (allowed_keys.indexOf(key) < 0) {
        event.preventDefault();

        return false;
      }

      return true;
    });

    $('.pp-checklists-float').on('keypress', function (event) {
      var key = event.keyCode || event.which;
      var allowed_keys = [
        35,
        36,
        37,
        38,
        39,
        40, // arrows
        44,
        46, // decimal separators
        8,
        9,
        46,
        27,
        13, // backspace, tab, delete, esc, enter
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57, // 0-9
      ];

      // Ignore any key different than number
      if (allowed_keys.indexOf(key) < 0) {
        event.preventDefault();

        return false;
      }

      return true;
    });

    /**
     * Show the requirements for the specific post type and hide all the
     * others.
     *
     * @param  {string} post_type
     */
    function show_post_type_requirements(post_type) {
      // Mark the filter as selected
      $('#pp-checklists-post-type-filter li.nav-tab-active').removeClass('nav-tab-active');
      $('#pp-checklists-post-type-filter li.post-type-' + post_type).addClass('nav-tab-active');

      $('.pp-checklists-tabs-list li a').removeClass('active');

      //remove active class from all tabs
      $('.pp-checklists-tabs a').removeClass('active');

      $('.pp-checklists-tabs ul').removeClass('active');
      $('.pp-checklists-tabs ul#list-' + post_type).addClass('active');

      //add active class to title tab
      $('.pp-checklists-tabs li:first-child a').addClass('active');

      $('.pp-checklists-tab-body').hide();
      $('#pp-checklists-tab-body-' + post_type).show();

      const current_data_tab =
        $('#list-' + post_type)
          .find('li a.active')
          .attr('data-tab') || 'title';
      // Hide the requirements which are not for the current post type
      $('#pp-checklists-requirements tr.pp-checklists-requirement-row').hide();
      // Display the correct requirements
      $(
        '#pp-checklists-requirements tr.ppch-' + current_data_tab + '-group[data-post-type="' + post_type + '"]',
      ).show();
    }

    /**
     * Returns the current post type, selected by the filter.
     *
     * @return string
     */
    function get_current_post_type() {
      var post_type = $('#pp-checklists-post-type-filter li.nav-tab-active a').attr('href').substring(1);

      if (post_type === '' || post_type === false || post_type === null || typeof post_type === undefined) {
        post_type = objectL10n_checklists_global_checklist.first_post_type;
      }

      return post_type;
    }

    /**
     * Method to remove custom item from the requirements list, identified
     * by the temporary ID/
     *
     * @param  {string} id
     * @param  {string} type
     */
    function remove_row(id, type) {
      // Add a special hidden input to flag the delete action
      var $input = $('<input type="hidden" />')
        .attr('name', 'publishpress_checklists_checklists_options[' + type + '_items_remove][]')
        .val(id)
        .appendTo($('#pp-checklists-requirements'));

      $('tr[data-id="' + id + '"]').remove();
    }

    /**
     * Callback for events where we want to trigger
     * a remove row action
     *
     * @param  {Event} event
     */
    function callback_remove_row(event) {
      var $target = $(event.target);

      remove_row($target.data('id'), $target.data('type'));
    }

    /**
     * Duplicate an existing requirement by cloning its configuration
     *
     * @param  {string} originalId - ID of the requirement to duplicate
     * @param  {string} postType - Post type for the requirement
     */
    function duplicate_requirement(originalId, postType) {
      var newId = originalId + '_copy_' + uidGen(8);
      
      var $originalRow = $('tr[data-id="' + originalId + '"][data-post-type="' + postType + '"]');
      
      if ($originalRow.length === 0) {
        return;
      }
      
      // Get the original requirement type and all configuration
      var originalType = $originalRow.data('type') || 'custom';
      var originalTitle = $originalRow.find('td:first-child input, td:first-child textarea').val() || $originalRow.find('td:first-child').text().trim();
      var originalRule = $originalRow.find('select[name*="_rule"] option:selected').val();
      
      // Extract configuration based on requirement type
      var config = extractRequirementConfig($originalRow, originalType);
      
      var duplicatedTitle = originalTitle;
      if (duplicatedTitle.match(/\(\d+\)$/)) {
        duplicatedTitle = duplicatedTitle.replace(/\((\d+)\)$/, function(match, number) {
          return '(' + (parseInt(number) + 1) + ')';
        });
      } else {
        duplicatedTitle += ' (2)';
      }
      
      createDuplicatedRow(newId, duplicatedTitle, originalRule, postType, originalType, config, originalId);
    }
    
    /**
     * Extract configuration from original requirement row
     */
    function extractRequirementConfig($originalRow, originalType) {
      var config = {
        minValue: '',
        maxValue: '',
        editableBy: [],
        canIgnore: [],
        multipleValues: {}
      };
      
      // Extract min/max values for counter types
      var $minInput = $originalRow.find('input[name*="_min"]');
      var $maxInput = $originalRow.find('input[name*="_max"]');
      
      if ($minInput.length > 0) {
        config.minValue = $minInput.val() || '';
      }
      if ($maxInput.length > 0) {
        config.maxValue = $maxInput.val() || '';
      }
      
      // If no input fields, extract from label text for built-in requirements
      if (config.minValue === '' && config.maxValue === '') {
        var labelText = $originalRow.find('td:first-child').text().trim();
        var patterns = [
          { regex: /(?:minimum|at least|min\.?)\s+(\d+)/i, type: 'min' },
          { regex: /(?:maximum|up to|max\.?)\s+(\d+)/i, type: 'max' },
          { regex: /exactly\s+(\d+)/i, type: 'exact' },
          { regex: /between\s+(\d+)\s+and\s+(\d+)/i, type: 'between' }
        ];
        
        patterns.forEach(function(pattern) {
          var match = labelText.match(pattern.regex);
          if (match) {
            if (pattern.type === 'exact') {
              config.minValue = config.maxValue = match[1];
            } else if (pattern.type === 'between') {
              config.minValue = match[1];
              config.maxValue = match[2];
            } else if (pattern.type === 'min') {
              config.minValue = match[1];
            } else if (pattern.type === 'max') {
              config.maxValue = match[1];
            }
          }
        });
      }
      
      // Extract role permissions
      config.editableBy = $originalRow.find('select[name*="_editable_by"]').val() || [];
      config.canIgnore = $originalRow.find('select[name*="_can_ignore"]').val() || [];
      
      // Extract multiple field values
      $originalRow.find('select[multiple]').each(function() {
        var fieldName = $(this).attr('name').match(/\[(.*?)\]/);
        if (fieldName && fieldName[1]) {
          config.multipleValues[fieldName[1]] = $(this).val() || [];
        }
      });
      
      return config;
    }
    
    /**
     * Create a duplicated requirement row with preserved type information
     */
    function createDuplicatedRow(newId, title, rule, postType, originalType, config, originalId) {
      // For built-in requirements, we need to create a custom item that mimics the original
      var requirementType = (originalType === 'counter' || originalType === 'simple' || originalType === 'multiple') ? 'custom' : originalType;
      var hasMinMax = config.minValue !== '' || config.maxValue !== '';
      
      create_row(newId, title, rule, postType, requirementType, hasMinMax);
      
      var $newRow = $('tr[data-id="' + newId + '"][data-post-type="' + postType + '"]');
      
      $newRow.attr('data-original-type', originalType);
      $newRow.attr('data-original-id', originalId);
      $newRow.attr('data-requirement-type', originalId.replace(/_copy_.*$/, ''));
      $newRow.addClass('pp-checklists-duplicated-requirement');
      
      // Apply configuration
      applyRequirementConfig($newRow, config);
      
      // Show the custom group
      $('.ppch-custom-group').show();
    }
    
    /**
     * Apply extracted configuration to the new row
     */
    function applyRequirementConfig($row, config) {
      if (config.minValue) {
        $row.find('input[name*="_min"]').val(config.minValue);
      }
      if (config.maxValue) {
        $row.find('input[name*="_max"]').val(config.maxValue);
      }
      
      if (config.editableBy && config.editableBy.length > 0) {
        $row.find('select[name*="_editable_by"]').val(config.editableBy);
      }
      
      if (config.canIgnore && config.canIgnore.length > 0) {
        $row.find('select[name*="_can_ignore"]').val(config.canIgnore);
      }
      
      for (var fieldName in config.multipleValues) {
        var $select = $row.find('select[name*="[' + fieldName + ']"]');
        if ($select.length > 0 && config.multipleValues[fieldName].length > 0) {
          $select.val(config.multipleValues[fieldName]);
        }
      }
      
      // Re-initialize select2
      $row.find('select').select2();
    }

    /**
     * Create a row inside the requirements table
     *
     * @param  {string} title
     * @param  {string} action
     *
     * @return {Element}
     */
    function create_row(id, title, action, post_type, type) {
      var $table = $('#pp-checklists-requirements'),
        $tr = $('<tr>'),
        $td = null,
        $titleField = type == 'openai' ? $('<textarea>') : $('<input type="text" />'),
        $idField = $('<input type="hidden" />'),
        $actionField = $('<select>'),
        $canIgnoreField = $('<select>'),
        $optionsField = $('<select>'),
        $option,
        $a,
        $icon,
        $suggestionItem = $('<div class="pp-custom-suggestion">'),
        $suggestionsObject = objectL10n_checklists_global_checklist[type + '_suggestions'],
        rule;

      $table.find('tbody#pp-checklists-tab-body-' + post_type).append($tr);
      $table.find('tr.ppch-custom-group #empty-custom-rule').hide();

      $tr
        .addClass('pp-checklists-requirement-row')
        .attr('data-id', id)
        .attr('data-type', type)
        .attr('data-post-type', post_type);

      $td = $('<td>').appendTo($tr);

      // ID field
      $idField
        .attr('name', 'publishpress_checklists_checklists_options[' + type + '_items][]')
        .val(id)
        .appendTo($td);

      // Title cell
      $titleField
        .attr('name', 'publishpress_checklists_checklists_options[' + id + '_title][' + post_type + ']')
        .val(title)
        .addClass('pp-checklists-custom-item-title')
        .focus()
        .attr('data-id', id)
        .attr('placeholder', objectL10n_checklists_global_checklist[type + '_enter_name'])
        .appendTo($td);

      // Suggestion
      if (typeof $suggestionsObject !== 'undefined') {
        $suggestionItem.append(
          '<span class="suggestion-title">' + objectL10n_checklists_global_checklist.suggestion_title + ':</span> ',
        );
        for (var key in $suggestionsObject) {
          if ($suggestionsObject.hasOwnProperty(key)) {
            $suggestionItem.append(
              '<span>&#x2022; <a href="javascript:void(0);" class="' +
                key +
                '" data-prompt="' +
                $suggestionsObject[key].prompt +
                '">' +
                $suggestionsObject[key].label +
                '</a></span> ',
            );
          }
        }
        $suggestionItem.appendTo($td);
      }

      // Action cell
      $td = $('<td>').appendTo($tr);
      $actionField
        .attr('name', 'publishpress_checklists_checklists_options[' + id + '_rule][' + post_type + ']')
        .attr('data-id', id)
        .appendTo($td);

      $.each(objectL10n_checklists_global_checklist.rules, function (value, label) {
        $option = $('<option>').attr('value', value).text(label).appendTo($actionField);
      });

      // can_ignore cell
      $td = $('<td>').appendTo($tr);
      $canIgnoreField
        .attr('class', 'pp-checklists-can-ignore')
        .attr('name', 'publishpress_checklists_checklists_options[' + id + '_can_ignore][' + post_type + '][]')
        .attr('multiple', 'multiple')
        .appendTo($td);

      $option = $('<option value=""></option>').appendTo($canIgnoreField);
      $.each(objectL10n_checklists_global_checklist.roles, function (value, label) {
        $option = $('<option>').attr('value', value).text(label).appendTo($canIgnoreField);
      });

      // Options cell
      $td = $('<td>').addClass('pp-checklists-task-params').appendTo($tr);

      if (type !== 'openai') {
        $optionsField
          .attr('id', '' + post_type + '-checklists-' + id + '_editable_by')
          .attr('name', 'publishpress_checklists_checklists_options[' + id + '_editable_by][' + post_type + '][]')
          .attr('multiple', 'multiple')
          .appendTo($td);

        $option = $('<option value=""></option>').appendTo($optionsField);
        $.each(objectL10n_checklists_global_checklist.roles, function (value, label) {
          $option = $('<option>').attr('value', value).text(label).appendTo($optionsField);
        });

        var $label = $('<p>')
          .addClass('pp-checklists-editable-by-description')
          .text(objectL10n_checklists_global_checklist.editable_by);
        $optionsField.after($label);
        
        // Add min/max fields for counter-type duplicated requirements
        if (arguments.length > 5 && arguments[5] === true) { // hasMinMax parameter
          var $minField = $('<input type="text" />')
            .attr('name', 'publishpress_checklists_checklists_options[' + id + '_min][' + post_type + ']')
            .attr('class', 'pp-checklists-small-input pp-checklists-number')
            .attr('placeholder', 'Min');
          var $maxField = $('<input type="text" />')
            .attr('name', 'publishpress_checklists_checklists_options[' + id + '_max][' + post_type + ']')
            .attr('class', 'pp-checklists-small-input pp-checklists-number')
            .attr('placeholder', 'Max');
          
          var $minMaxContainer = $('<div class="pp-checklists-number">').append(
            $('<label>').text('Min'),
            $minField,
            $('<label>').text('Max'),
            $maxField
          );
          $label.after($minMaxContainer);
        }
      }

      $a = $('<a>')
        .attr('href', 'javascript:void(0);')
        .addClass('pp-checklists-remove-custom-item')
        .attr('title', objectL10n_checklists_global_checklist.remove)
        .attr('data-id', id)
        .attr('data-type', type)
        .appendTo($td);
      $icon = $('<span>').addClass('dashicons dashicons-no').attr('data-id', id).attr('data-type', type).appendTo($a);

      // Re-initialize select 2
      $('#pp-checklists-global select').select2();

      $a.on('click', callback_remove_row);
    }

    /*----------  Custom items  ----------*/
    $('#pp-checklists-add-button').on('click', function (event) {
      $('.ppch-custom-group').show();

      var newId = uidGen(15);

      create_row(newId, '', '', get_current_post_type(), 'custom');
    });

    // Hide all requirements except the first one (title)
    $('.pp-checklists-requirement-row:not(.ppch-title-group)').hide();

    /**
     * Requirements tab switch
     */
    $(document).on('click', '.pp-checklists-tabs a', function (event) {
      event.preventDefault();

      var clicked_tab = $(this).attr('data-tab');

      //remove active class from all tabs
      $('.pp-checklists-tabs a').removeClass('active');

      //add active class to current tab
      $(this).addClass('active');

      // hide all tabs contents
      $('.pp-checklists-requirement-row').hide();

      // Show the current tab contents that also have the matching data-post-type attribute
      $('.ppch-' + clicked_tab + '-group[data-post-type="' + get_current_post_type() + '"]').show();
    });

    /*----------  OpenAI items  ----------*/
    $('#pp-checklists-openai-promt-button').on('click', function (event) {
      $('.ppch-custom-group').show();

      var newId = uidGen(15);

      create_row(newId, '', '', get_current_post_type(), 'openai');
    });
    $(document).on('click', '.pp-custom-suggestion a', function (event) {
      event.preventDefault();
      $(this).closest('td').find('.pp-checklists-custom-item-title').val($(this).data('prompt'));
    });

    $('.pp-checklists-remove-custom-item').on('click', callback_remove_row);

    /*----------  Duplicate items  ----------*/
    $(document).on('click', '.pp-checklists-duplicate-item', function (event) {
      event.preventDefault();
      var requirementId = $(this).data('id');
      var postType = $(this).data('post-type');
      duplicate_requirement(requirementId, postType);
    });

    /*----------  Form validation  ----------*/
    $('#pp-checklists-global').submit(function () {
      var submit_form = true,
        submit_error = '',
        required_rules = objectL10n_checklists_global_checklist.required_rules,
        required_rules_notice = objectL10n_checklists_global_checklist.submit_error,
        custom_task_error_displayed = false;

      //remove previous notice
      $('.checklists-save-notice').remove();

      //select all row
      $('.pp-checklists-requirement-row').each(function () {
        var requirement_id = $(this).attr('data-id');
        var row_requirement_title = $(this).find('td:first-child').text();
        var requirement_rule = $(this)
          .find('#post-checklists-' + requirement_id + '_rule option:selected')
          .val();
        var min_field = $(this).find('#post-checklists-' + requirement_id + '_min');
        var max_field = $(this).find('#post-checklists-' + requirement_id + '_max');
        var time_field = $(this).find('input[type="time"]');

        //check if selected rule require validation and option is Base_counter
        if ($.inArray(requirement_rule, required_rules) !== -1 && (min_field.length > 0 || max_field.length > 0)) {
          //void submit and add to error if none of min and max field is set
          if (Number(min_field.val()) === 0 && Number(max_field.val()) === 0) {
            submit_form = false;
            var field_title = $('<strong>').text(`"${row_requirement_title}"`);
            submit_error += $('<div class="checklists-save-notice"></div>')
              .append(
                $('<div class="alert alert-danger alert-dismissible"></div>')
                  .append('<a href="javascript:void(0);" class="close">×</a>')
                  .append(document.createTextNode(required_rules_notice))
                  .append(' ')
                  .append(field_title),
              )
              .html();
          }
        }

        // validation for exact time requirement: block if empty time on required rule
        if ($.inArray(requirement_rule, required_rules) !== -1 && time_field.length > 0) {
          if (!time_field.val()) {
            submit_form = false;
            var field_title = $('<strong>').text(`"${row_requirement_title}"`);
            submit_error += $('<div class="checklists-save-notice"></div>')
              .append(
                $('<div class="alert alert-danger alert-dismissible"></div>')
                  .append('<a href="javascript:void(0);" class="close">×</a>')
                  .append(document.createTextNode(required_rules_notice))
                  .append(' ')
                  .append(field_title),
              )
              .html();
          }
        }
      });

      $('.pp-checklists-custom-item-title').each(function () {
        if ($(this).val().trim() === '' && !custom_task_error_displayed) {
          submit_form = false;
          submit_error += $('<div class="checklists-save-notice"></div>')
            .append(
              $('<div class="alert alert-danger alert-dismissible"></div>')
                .append('<a href="javascript:void(0);" class="close">×</a>')
                .append(document.createTextNode(objectL10n_checklists_global_checklist.custom_item_error)),
            )
            .html();
          custom_task_error_displayed = true;
        }
      });

      if (!submit_form) {
        var submit_error_el = $('<div class="checklists-save-notice"></div>').append(submit_error);
        $('#pp-checklists-global #submit').before(submit_error_el);
      }

      return submit_form;
    });

    // Remove current notice on dismiss
    $(document).on('click', '#pp-checklists-global .checklists-save-notice .close', function (event) {
      event.preventDefault();
      //remove whole current notice
      $(this).parent('.alert-dismissible').remove();
    });

    // Remove notice on any number input changed
    $(document).on('change input paste', '.pp-checklists-number', function () {
      //remove previous notice
      $('.checklists-save-notice').remove();
    });
  });

  function uidGen(len) {
    var text = ' ',
      charset = 'abcdefghijklmnopqrstuvwxyz';

    for (var i = 0; i < len; i++) {
      text += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return text.trim();
  }
})(jQuery, objectL10n_checklists_global_checklist);
