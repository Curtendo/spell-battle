let startPoint = {
    lesson: null,
    unit: null,
    textbook: null
};
let endPoint = {
    lesson: null,
    unit: null,
    textbook: null
};

$(document).ready(function() {
    let fromSelected = false;

    function updateToButtonStatus() {
        if (startPoint.lesson === null) {
            $("#set-to").prop("disabled", true).addClass("disabled-button");
        } else {
            $("#set-to").prop("disabled", false).removeClass("disabled-button");
        }
    }

    function displayUnitsForTextbook(grade) {
        $(".unit-option").hide();
        $(`.unit-option[data-grade='${grade}']`).show();
        $(".lesson-option").hide();
    }

    function displayLessonsForUnit(grade, unit) {
        $(".lesson-option").hide();
        $(`.lesson-option[data-grade='${grade}'][data-unit='${unit}']`).show();
    }

    // Function to reset highlights and set default selections
    function setDefaultViewSelections() {
        $(".textbook-option, .unit-option, .lesson-option").removeClass('light-green selected');
        $(".textbook-option:first").addClass('light-green');
        $(".unit-option:first").addClass('light-green');
        $(".lesson-option:first").addClass('light-green');
        displayUnitsForTextbook($(".textbook-option:first").data("grade"));
        displayLessonsForUnit($(".unit-option:first").data("grade"), $(".unit-option:first").data("unit"));
        $("#set-from").addClass('light-green');
        $("#set-to").addClass('selected');

        fromSelected = false;
        startPoint = {
            lesson: $(".lesson-option:first"),
            unit: $(".unit-option:first"),
            textbook: $(".textbook-option:first")
        };
    }

    function clearStartPoints() {
        startPoint.textbook = null;
        startPoint.unit = null;
        startPoint.lesson = null;
    }

    function clearEndPoints() {
        endPoint.textbook = null;
        endPoint.unit = null;
        endPoint.lesson = null;
    }

    function updateFromDisplayText() {
        $("#from-display").text("New Horizon " + startPoint.textbook.data("grade"));
    }

    function updateFromDisplayTextUnit() {
        $("#from-display").text("New Horizon " + startPoint.textbook.data("grade") +
                                " - Unit " + startPoint.unit.data("unit"));
    }

    function updateFromDisplayAll() {
        $("#from-display").text("New Horizon " + startPoint.textbook.data("grade") +
                                " - Unit " + startPoint.unit.data("unit") +
                                " - " + startPoint.lesson.data("lesson"));
    }

    function updateToDisplayText() {
        $("#to-display").text("New Horizon " + endPoint.textbook.data("grade"));
    }

    function updateToDisplayTextUnit() {
        $("#to-display").text("New Horizon " + endPoint.textbook.data("grade") +
                                " - Unit " + endPoint.unit.data("unit"));
    }

    function updateToDisplayAll() {
        $("#to-display").text("New Horizon " + endPoint.textbook.data("grade") +
                                " - Unit " + endPoint.unit.data("unit") +
                                " - " + endPoint.lesson.data("lesson"));
    }

    function displayRadioButtons() {
        if ($("#textbook-words").prop("checked")) {
            $("#custom-words, #start-form-custom, #start-game-custom").hide();
            $("#submit-range").show();
            $("#textbook-controls, #textbook-selection, #units-lessons-container").show();
        } else if ($("#custom-words-radio").prop("checked")) {
            $("#textbook-controls, #textbook-selection, #units-lessons-container").hide();
            $("#submit-range").hide();
            $("#custom-words, #start-form-custom, #start-game-custom").show();
            // Optionally, clear the textarea
            $("#custom-words textarea").val('');
        }
    }

    setDefaultViewSelections();
    updateFromDisplayAll();

    $("#set-from").on('mousedown', function() {
        $(".control-option").removeClass('selected light-green'); // Clear previously highlighted selections
        fromSelected = true;
        $(this).addClass('light-green');
    });

    $("#set-to").on('mousedown', function() {
        if ($(this).prop('disabled')) {
            return;
        }
        fromSelected = false;
        $(this).addClass('selected');
    });

    $(".textbook-option").on('mousedown', function() {
        if (fromSelected) {
            $(".textbook-option").removeClass('light-green selected');
            Object.keys(startPoint).forEach(key => {
                startPoint[key] = null;
            });
            $(this).addClass('light-green');
            clearStartPoints();
            startPoint.textbook = $(this);
            updateFromDisplayText();
            updateToButtonStatus();
        } else {
            if ($(this).index() < startPoint.textbook.index()) {
                // Disallow selection
                return;
            }
            $(".textbook-option").removeClass('light-green selected');
            $(this).addClass('selected').prevAll().addClass('light-green');
            clearEndPoints();
            endPoint.textbook = $(this);
            updateToDisplayText();
        }

        displayUnitsForTextbook($(this).data("grade"));
        $(".unit-option, .lesson-option").removeClass('light-green selected');
    });

    $(".unit-option").on('mousedown', function() {
        if (fromSelected) {
            $(".unit-option").removeClass('light-green selected');
            $(this).addClass('light-green');
            clearStartPoints();
            startPoint.unit = $(this);
            startPoint.textbook = $(`.textbook-option[data-grade='${$(this).data("grade")}']`);
            updateFromDisplayTextUnit();
            updateToButtonStatus();
        } else {
            const textbookIndex = $(`.textbook-option[data-grade='${$(this).data("grade")}']`).index();
            if (textbookIndex < startPoint.textbook.index() ||
                (textbookIndex === startPoint.textbook.index() && $(this).index() < startPoint.unit.index())) {
                // Disallow selection
                return;
                }
            clearEndPoints();
            endPoint.unit = $(this);
            endPoint.textbook = $(`.textbook-option[data-grade='${$(this).data("grade")}']`);
            updateToDisplayTextUnit();
            $(".unit-option").removeClass('selected');
            $(this).addClass('selected');
        }

        displayLessonsForUnit($(this).data("grade"), $(this).data("unit"));
        $(".lesson-option").removeClass('light-green selected');
    });

    $(".lesson-option").on('mousedown', function() {
        if (fromSelected) {
            $(".lesson-option").removeClass('light-green selected');
            $(this).addClass('light-green');
            startPoint = {
                lesson: $(this),
                unit: $(`.unit-option[data-grade='${$(this).data("grade")}'][data-unit='${$(this).data("unit")}']`),
                textbook: $(`.textbook-option[data-grade='${$(this).data("grade")}']`)
            };
            updateFromDisplayAll();
            updateToButtonStatus();
            $("#set-to").trigger('mousedown');
        } else {
            const textbookIndex = $(`.textbook-option[data-grade='${$(this).data("grade")}']`).index();
            const unitIndex = $(`.unit-option[data-grade='${$(this).data("grade")}'][data-unit='${$(this).data("unit")}']`).index();
            if (textbookIndex < startPoint.textbook.index() ||
                (textbookIndex === startPoint.textbook.index() && unitIndex < startPoint.unit.index()) ||
                (textbookIndex === startPoint.textbook.index() && unitIndex === startPoint.unit.index() && $(this).index() < startPoint.lesson.index())) {
                // Disallow selection
                return;
            }

            endPoint = {
                lesson: $(this),
                unit: $(`.unit-option[data-grade='${$(this).data("grade")}'][data-unit='${$(this).data("unit")}']`),
                textbook: $(`.textbook-option[data-grade='${$(this).data("grade")}']`)
            }

            if (startPoint.lesson && endPoint.lesson) {
                // Clear previous highlights
                $(".lesson-option, .unit-option, .textbook-option").removeClass('light-green');
                $(".lesson-option, .unit-option, .textbook-option").removeClass('selected');


                // Highlight endPoint textbook and unit green
                if (startPoint.textbook[0] !== endPoint.textbook[0] && endPoint.textbook.index() > startPoint.textbook.index()) {
                    endPoint.textbook.addClass('selected');
                }
                if (startPoint.unit[0] !== endPoint.unit[0] && endPoint.unit.index() > startPoint.unit.index()) {
                    endPoint.unit.addClass('selected');
                }

                if (startPoint.unit[0] === endPoint.unit[0]) {  // Check if they are in the same unit
                    // Just highlight the common unit
                    startPoint.unit.addClass('light-green');
                } else {
                    // Highlight units
                    startPoint.unit.nextUntil(endPoint.unit).addBack().addClass('light-green');
                    endPoint.unit.addClass('light-green');
                }

                // Highlight textbooks
                if (startPoint.textbook[0] === endPoint.textbook[0]) {  // Check if they are in the same textbook
                    // Just highlight the common textbook
                    startPoint.textbook.addClass('light-green');
                } else {
                    startPoint.textbook.nextUntil(endPoint.textbook).addBack().addClass('light-green');
                    endPoint.textbook.addClass('light-green');
                }

                if (startPoint.lesson.is(endPoint.lesson)) {
                    endPoint.lesson.addClass('selected');
                } else {
                // Highlight lessons light-green
                startPoint.lesson.nextUntil(endPoint.lesson).addBack().addClass('light-green');
                endPoint.lesson.addClass('selected');
                }

                updateToDisplayAll();

            }
        }
    });

    displayRadioButtons();

    $("#textbook-words, #custom-words-radio").on("change", function() {
        displayRadioButtons();
    });

    // Initialize the slider
    $("#word-length-slider").slider({
        tooltip: 'hide'
    });

    // Fetch initial values
    let initialValues = $("#word-length-slider").slider("getValue");
    let initialMin = initialValues[0];
    let initialMax = initialValues[1];

    // Display the initial values
    $("#min-value-display").text(initialMin);
    $("#max-value-display").text(initialMax);

    // Update the displayed values upon sliding
    $("#word-length-slider").on("slide", function(slideEvt) {
        $("#min-value-display").text(slideEvt.value[0]);
        $("#max-value-display").text(slideEvt.value[1]);
    });

    $("#submit-range").on('click', function() {
        // Ensure both startPoint and endPoint are selected
        if (!startPoint.lesson || !endPoint.lesson) {
            alert("Please select both starting and ending points.");
            return;
        }

        // Fetch data from startPoint and endPoint
        const dataToSend = {
            startPoint: {
                textbook: startPoint.textbook.data('grade'),
                unit: startPoint.unit.data('unit'),
                lesson: startPoint.lesson.data('lesson')
            },
            endPoint: {
                textbook: endPoint.textbook.data('grade'),
                unit: endPoint.unit.data('unit'),
                lesson: endPoint.lesson.data('lesson')
            }
        };

        // Send data to the backend using AJAX
        $.ajax({
            type: 'POST',
            url: '/get_word_lengths',
            data: JSON.stringify(dataToSend),
            contentType: "application/json; charset=utf-8",
            success: function(response) {
                // Update your slider's min and max
                $("#word-length-container").show();

                let upperHandleValue;
                if (response.maxLength < response.minLength + 2 || response.minLength + 2 > 14) {
                    upperHandleValue = response.maxLength;
                }
                else {
                    upperHandleValue = response.minLength + 2;
                }

                $("#word-length-slider").slider('setAttribute', 'min', response.minLength);
                $("#word-length-slider").slider('setAttribute', 'max', response.maxLength);
                $("#word-length-slider").slider('setValue', [response.minLength, upperHandleValue]);  // Initital handle values
                // Update the displayed values
                $("#min-value-display").text(response.minLength);
                $("#max-value-display").text(upperHandleValue);

                // Hide elements
                $("#word-selection").hide();
                $("#textbook-controls").hide();
                $("#textbook-selection").hide();
                $("#units-lessons-container").hide();
                $("#top-divider").hide();
                $("#submit-range").hide();

                // Show elements
                $("#settings-back").css('visibility', 'visible');
                $("#start-form-textbook").show();
                $("#start-game-textbook").show();

            },
            error: function() {
                alert("Error communicating with the server.");
            }
        });
    });

    // Back button functionality
    $("#settings-back").on('click', function() {
        // Hide elements, clear selections
        $("#settings-back").css('visibility', 'hidden');
        $("#word-length-container").hide();
        setDefaultViewSelections();
        clearEndPoints();
        $("#to-display").text("");
        $("#start-game-textbook").hide();

        // Show elements, select defaults
        updateFromDisplayAll();
        updateToButtonStatus();
        $("#word-selection").show();
        $("#textbook-controls").show();
        $("#textbook-selection").show();
        $("#units-lessons-container").show();
        $("#top-divider").show();
        $("#submit-range").show();
    });

    $("#start-game-textbook").on('click', function(e) {
        const sliderValues = $("#word-length-slider").slider("getValue");
        if (!sliderValues[0] || !sliderValues[1]) {
            alert("Please select min and max word length.");
            e.preventDefault();  // Prevent the form from submitting
            return;
        }

        $('#min-length').val(sliderValues[0]);
        $('#max-length').val(sliderValues[1]);
    });

    // Start custom word game
    $("#start-game-custom").on('click', function(e) {
        let customWords = $("#custom-words textarea").val().split("\n");
        customWords = customWords.filter(word => word.trim() !== ""); // Remove empty lines
        customWords = customWords.map(word => word.trim()); // Trims whitespace before and after words

        // Check if the textarea is empty
        if (customWords.length === 0) {
            alert("Please enter some words.");
            e.preventDefault();
            return;
        }

        for (let word of customWords) {
        // Check for only alpha characters
            if (!/^[a-zA-Z]+$/.test(word)) {
                alert("Only alphabet characters, please.");
                e.preventDefault();
                return;
            }

            // Check word length
            if (word.length < 3 || word.length > 14) {
                alert("Each word must be between 3 and 14 letters long. Are you crazy?");
                e.preventDefault();
                return;
            }
        }

        $("#custom-words-input").val(customWords.join(","));
    });


});