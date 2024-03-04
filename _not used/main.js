$(document).ready(function() {
    let selectingFrom = false;
    let selectingTo = false;
    let fromLesson = null;
    let toLesson = null;

    $(".textbook-option").click(function(event) {
        event.preventDefault();
        event.stopPropagation(); // prevent any parent event handlers from being executed

        // If this textbook is already selected, deselect it and clear units/lessons
        if ($(this).hasClass("selected")) {
            $(this).removeClass("selected");
            $('#units').empty();
            $('#lessons').empty();
            return;
        }

        // Deselect any other previously selected textbook
        $(".textbook-option").removeClass("selected");

        // Select the current textbook
        $(this).addClass("selected");

        // Clear previously displayed units and lessons
        $('#units').empty();
        $('#lessons').empty();

        const selectedTextbooks = [];
        $(".textbook-option.selected").each(function() {
            selectedTextbooks.push($(this).attr('data-level'));
        });

        $.ajax({
            type: "POST",
            url: "/get_units_lessons",
            data: JSON.stringify({ textbook_levels: selectedTextbooks }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                // Empty the containers and append the headers and button containers
                $('#units').empty().append('<div class="header">Units</div><div class="button-container"></div>');
                $('#lessons').empty().append('<div class="header">Lessons</div><div class="button-container"></div>');

                // Iterate through each textbook level in the response
                $.each(response, function(grade, units) {
                    $.each(units, function(unit, lessons) {
                        $('#units').append('<div class="unit-option" data-unit="' + unit + '" data-grade="' + grade + '">' + unit + '</div>'); // Display unit
                    });
                });

                $(".unit-option").click(function() {
                    $(this).toggleClass("selected");

                    // Here, when a unit is clicked, clear previous lessons and show the header for lessons
                    $('#lessons').empty().append('<div class="header">Lessons</div><div class="button-container"></div>');
                    let selectedUnit = $(this).attr("data-unit");

                    // Find the lessons for the clicked unit and display them
                    $.each(response, function(grade, units) {
                        if (units[selectedUnit]) {
                            $.each(units[selectedUnit], function(index, lesson) {
                                $('#lessons').append('<div class="lesson-option" data-lesson="' + lesson + '">' + lesson + '</div>');
                            });
                        }
                    });

                    // Add click event to lesson-option, similar to what you did for unit-option
                    $(".lesson-option").click(function() {
                        if (selectingFrom) {
                            fromLesson = $(this).attr('data-lesson');
                            selectingFrom = false;
                            selectingTo = true;
                        } else if (selectingTo) {
                            toLesson = $(this).attr('data-lesson');
                            selectingTo = false;
                            highlightLessons(fromLesson, toLesson);
                        } else {
                            $(this).toggleClass("selected");
                        }
                    });
                });
            }
        });
    });

    $("#set-from").on("click", function() {
        selectingFrom = true;
        selectingTo = false;
        resetControlOptions();
        $(this).addClass("active");
    });

    $("#set-to").on("click", function() {
        selectingFrom = false;
        selectingTo = true;
        resetControlOptions();
        $(this).addClass("active");
    });

    $("#select-lessons").on("click", function() {
        selectingFrom = false;
        selectingTo = false;
        resetControlOptions();
        $(this).addClass("active");
    });

    function resetControlOptions() {
        $(".control-option").removeClass("active");
    }

    function highlightLessons(from, to) {
        let startHighlighting = false;

        $(".lesson-option").each(function() {
            let currentLesson = $(this).attr('data-lesson');

            if (currentLesson === from || currentLesson === to) {
                $(this).addClass("selected");
                if (startHighlighting || from === to) return false;
                startHighlighting = true;
            } else if (startHighlighting) {
                $(this).addClass("selected");
            }
        });
    }

    // Event listener for radio buttons
    $('input[name="word-selection"]').on("change", function(event) {
        event.preventDefault();
        event.stopPropagation();
        if ($(this).val() === "textbook") {
            $("#textbook-controls").show();
            $("#textbook-selection").show();
            $("#custom-words").hide();
            $('#units').empty();
            $('#lessons').empty();
        } else {
            $("#textbook-controls").hide();
            $("#textbook-selection").hide();
            $("#custom-words").show();
            $('#units').empty();
            $('#lessons').empty();
        }
    });
    // Simulate a click on the 'New Horizon 1' textbook-option after the page loads.
    setTimeout(() => {
        $(".textbook-option[data-level='New Horizon 1']").click(); // Adjust this selector as needed to match your HTML structure and attributes.

        // Since AJAX calls are asynchronous, add another timeout to handle the next interactions.
        setTimeout(() => {
            // Click the first unit and first lesson. Adjust these selectors as needed.
            $(".unit-option:first").click();
            $(".lesson-option:first").click();
        }, 100); // Adjust timeout as needed, based on the average time your AJAX call takes.
    }, 100);
    $("#set-to").click();
});
